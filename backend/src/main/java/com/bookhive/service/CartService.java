package com.bookhive.service;

import com.bookhive.dto.CartItemRequest;
import com.bookhive.model.Book;
import com.bookhive.model.CartItem;
import com.bookhive.repository.BookRepository;
import com.bookhive.repository.CartItemRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CartService {
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;

    public CartService(CartItemRepository cartItemRepository, BookRepository bookRepository) {
        this.cartItemRepository = cartItemRepository;
        this.bookRepository = bookRepository;
    }

    public List<CartItem> getCart(String userId) {
        return cartItemRepository.findByUserId(userId);
    }

    public CartItem addItem(String userId, CartItemRequest request) {
        Book book = bookRepository.findById(request.bookId())
            .orElseThrow(() -> new IllegalArgumentException("Book not found"));
        var existing = cartItemRepository.findByUserIdAndBookId(userId, request.bookId());
        int totalQty = existing.map(item -> item.getQuantity() + request.quantity())
                               .orElse(request.quantity());
        if (totalQty > book.getStock()) {
            throw new IllegalArgumentException("Insufficient stock");
        }
        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(totalQty);
            return cartItemRepository.save(item);
        }
        return cartItemRepository.save(new CartItem(userId, request.bookId(), request.quantity()));
    }

    public CartItem updateItem(String userId, String itemId, int quantity) {
        CartItem item = cartItemRepository.findById(itemId)
            .filter(i -> i.getUserId().equals(userId))
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
        Book book = bookRepository.findById(item.getBookId())
            .orElseThrow(() -> new IllegalArgumentException("Book not found"));
        if (quantity > book.getStock()) {
            throw new IllegalArgumentException("Insufficient stock");
        }
        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    public void removeItem(String userId, String itemId) {
        CartItem item = cartItemRepository.findById(itemId)
            .filter(i -> i.getUserId().equals(userId))
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
        cartItemRepository.delete(item);
    }

    public void clearCart(String userId) {
        cartItemRepository.deleteByUserId(userId);
    }
}
