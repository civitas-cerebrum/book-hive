package com.bookhive.service;

import com.bookhive.model.*;
import com.bookhive.repository.*;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, CartItemRepository cartItemRepository,
                        BookRepository bookRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    public Order checkout(String userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        List<OrderItem> orderItems = cartItems.stream().map(ci -> {
            Book book = bookRepository.findById(ci.getBookId())
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + ci.getBookId()));
            if (book.getStock() < ci.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for: " + book.getTitle());
            }
            book.setStock(book.getStock() - ci.getQuantity());
            bookRepository.save(book);
            return new OrderItem(ci.getBookId(), ci.getQuantity(), book.getPrice());
        }).toList();

        double total = orderItems.stream()
            .mapToDouble(i -> i.getPriceAtPurchase() * i.getQuantity()).sum();

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getBalance() < total) {
            throw new IllegalArgumentException("Insufficient balance");
        }
        user.setBalance(user.getBalance() - total);
        userRepository.save(user);

        Order order = new Order();
        order.setUserId(userId);
        order.setItems(orderItems);
        order.setTotalPrice(total);
        order.setStatus("COMPLETED");
        order.setPurchasedAt(Instant.now());

        order = orderRepository.save(order);
        cartItemRepository.deleteByUserId(userId);
        return order;
    }

    public List<Order> getOrders(String userId) {
        return orderRepository.findByUserIdOrderByPurchasedAtDesc(userId);
    }

    public Optional<Order> getOrder(String userId, String orderId) {
        return orderRepository.findById(orderId)
            .filter(o -> o.getUserId().equals(userId));
    }

    public Order returnOrder(String userId, String orderId) {
        Order order = orderRepository.findById(orderId)
            .filter(o -> o.getUserId().equals(userId))
            .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!order.isReturnEligible()) {
            throw new IllegalArgumentException("Return window has expired");
        }
        // Restore stock
        for (OrderItem item : order.getItems()) {
            Book book = bookRepository.findById(item.getBookId())
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));
            book.setStock(book.getStock() + item.getQuantity());
            bookRepository.save(book);
        }
        // Credit balance
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setBalance(user.getBalance() + order.getTotalPrice());
        userRepository.save(user);

        order.setStatus("RETURNED");
        return orderRepository.save(order);
    }
}
