package com.bookhive.service;

import com.bookhive.dto.CartItemRequest;
import com.bookhive.model.Book;
import com.bookhive.model.Order;
import com.bookhive.model.User;
import com.bookhive.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class OrderServiceTest {
    @Autowired private OrderService orderService;
    @Autowired private CartService cartService;
    @Autowired private BookRepository bookRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        cartItemRepository.deleteAll();
        bookRepository.deleteAll();
        userRepository.deleteAll();
        Book book = new Book();
        book.setId("book-001");
        book.setTitle("Test Book");
        book.setStock(10);
        book.setPrice(9.99);
        book.setIsbn("978-0-0000-0001-0");
        bookRepository.save(book);
        User user = new User("user1", "user1@example.com", "pw");
        user.setId("user1");
        userRepository.save(user);
    }

    @Test
    void checkout_createsOrder() {
        cartService.addItem("user1", new CartItemRequest("book-001", 2));
        Order order = orderService.checkout("user1");
        assertEquals("COMPLETED", order.getStatus());
        assertEquals(19.98, order.getTotalPrice(), 0.01);
        assertEquals(1, order.getItems().size());
        // Cart should be empty after checkout
        assertTrue(cartService.getCart("user1").isEmpty());
        // Stock should be decremented
        assertEquals(8, bookRepository.findById("book-001").get().getStock());
    }

    @Test
    void checkout_emptyCart_throws() {
        assertThrows(IllegalArgumentException.class, () -> orderService.checkout("user1"));
    }

    @Test
    void returnOrder_withinWindow_succeeds() {
        cartService.addItem("user1", new CartItemRequest("book-001", 2));
        Order order = orderService.checkout("user1");
        Order returned = orderService.returnOrder("user1", order.getId());
        assertEquals("RETURNED", returned.getStatus());
        assertEquals(10, bookRepository.findById("book-001").get().getStock());
    }
}
