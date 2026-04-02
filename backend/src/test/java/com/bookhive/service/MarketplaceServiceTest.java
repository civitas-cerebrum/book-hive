package com.bookhive.service;

import com.bookhive.dto.ListingRequest;
import com.bookhive.model.Book;
import com.bookhive.model.MarketplaceListing;
import com.bookhive.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class MarketplaceServiceTest {
    @Autowired private MarketplaceService marketplaceService;
    @Autowired private MarketplaceListingRepository listingRepository;
    @Autowired private BookRepository bookRepository;
    @Autowired private OrderRepository orderRepository;

    @BeforeEach
    void setUp() {
        listingRepository.deleteAll();
        orderRepository.deleteAll();
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
    void createListing_succeeds() {
        var listing = marketplaceService.createListing("seller1",
            new ListingRequest("book-001", "LIKE_NEW", 7.99));
        assertEquals("ACTIVE", listing.getStatus());
        assertEquals("seller1", listing.getSellerId());
    }

    @Test
    void buyListing_createsOrder() {
        var listing = marketplaceService.createListing("seller1",
            new ListingRequest("book-001", "GOOD", 5.99));
        var order = marketplaceService.buyListing("buyer1", listing.getId());
        assertEquals("COMPLETED", order.getStatus());
        assertEquals(5.99, order.getTotalPrice(), 0.01);
        // Listing should be SOLD
        var updated = listingRepository.findById(listing.getId()).get();
        assertEquals("SOLD", updated.getStatus());
    }

    @Test
    void buyOwnListing_throws() {
        var listing = marketplaceService.createListing("seller1",
            new ListingRequest("book-001", "NEW", 8.99));
        assertThrows(IllegalArgumentException.class, () ->
            marketplaceService.buyListing("seller1", listing.getId()));
    }

    @Test
    void cancelListing_succeeds() {
        var listing = marketplaceService.createListing("seller1",
            new ListingRequest("book-001", "FAIR", 3.99));
        marketplaceService.cancelListing("seller1", listing.getId());
        assertEquals("CANCELLED", listingRepository.findById(listing.getId()).get().getStatus());
    }
}
