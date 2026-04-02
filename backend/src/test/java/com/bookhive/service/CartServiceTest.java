package com.bookhive.service;

import com.bookhive.dto.CartItemRequest;
import com.bookhive.model.Book;
import com.bookhive.model.CartItem;
import com.bookhive.repository.BookRepository;
import com.bookhive.repository.CartItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CartServiceTest {
    @Autowired private CartService cartService;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private BookRepository bookRepository;

    @BeforeEach
    void setUp() {
        cartItemRepository.deleteAll();
        bookRepository.deleteAll();
        Book book = new Book();
        book.setId("book-001");
        book.setTitle("Test Book");
        book.setStock(10);
        book.setPrice(9.99);
        book.setIsbn("978-0-0000-0001-0");
        bookRepository.save(book);
    }

    @Test
    void addItem_createsCartItem() {
        cartService.addItem("user1", new CartItemRequest("book-001", 2));
        var items = cartService.getCart("user1");
        assertEquals(1, items.size());
        assertEquals(2, items.get(0).getQuantity());
    }

    @Test
    void addItem_existingBook_updatesQuantity() {
        cartService.addItem("user1", new CartItemRequest("book-001", 1));
        cartService.addItem("user1", new CartItemRequest("book-001", 3));
        var items = cartService.getCart("user1");
        assertEquals(1, items.size());
        assertEquals(4, items.get(0).getQuantity());
    }

    @Test
    void addItem_insufficientStock_throws() {
        assertThrows(IllegalArgumentException.class, () ->
            cartService.addItem("user1", new CartItemRequest("book-001", 20)));
    }

    @Test
    void clearCart_removesAll() {
        cartService.addItem("user1", new CartItemRequest("book-001", 1));
        cartService.clearCart("user1");
        assertTrue(cartService.getCart("user1").isEmpty());
    }
}
