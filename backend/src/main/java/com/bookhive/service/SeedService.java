package com.bookhive.service;

import com.bookhive.model.Book;
import com.bookhive.model.User;
import com.bookhive.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.List;

@Service
public class SeedService {
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final MarketplaceListingRepository listingRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    public SeedService(BookRepository bookRepository, UserRepository userRepository,
                       CartItemRepository cartItemRepository, OrderRepository orderRepository,
                       MarketplaceListingRepository listingRepository,
                       PasswordEncoder passwordEncoder, ObjectMapper objectMapper) {
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.listingRepository = listingRepository;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
    }

    public void seed() {
        if (bookRepository.count() > 0) return; // already seeded
        seedBooks();
        seedUsers();
    }

    public void reset() {
        bookRepository.deleteAll();
        userRepository.deleteAll();
        cartItemRepository.deleteAll();
        orderRepository.deleteAll();
        listingRepository.deleteAll();
        seedBooks();
        seedUsers();
    }

    private void seedBooks() {
        try {
            var resource = new ClassPathResource("books.json");
            List<Book> books = objectMapper.readValue(
                resource.getInputStream(), new TypeReference<>() {});
            bookRepository.saveAll(books);
        } catch (IOException e) {
            throw new RuntimeException("Failed to load seed data", e);
        }
    }

    private void seedUsers() {
        String encoded = passwordEncoder.encode("Test1234!");
        User user1 = new User("testuser1", "testuser1@bookhive.test", encoded);
        user1.setBalance(100.00);
        User user2 = new User("testuser2", "testuser2@bookhive.test", encoded);
        user2.setBalance(100.00);
        userRepository.save(user1);
        userRepository.save(user2);
    }
}
