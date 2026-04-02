package com.bookhive.service;

import com.bookhive.dto.ListingRequest;
import com.bookhive.model.*;
import com.bookhive.repository.*;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;

@Service
public class MarketplaceService {
    private final MarketplaceListingRepository listingRepository;
    private final BookRepository bookRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public MarketplaceService(MarketplaceListingRepository listingRepository,
                              BookRepository bookRepository, OrderRepository orderRepository,
                              UserRepository userRepository) {
        this.listingRepository = listingRepository;
        this.bookRepository = bookRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    public List<MarketplaceListing> getActiveListings() {
        return listingRepository.findByStatus("ACTIVE");
    }

    public MarketplaceListing createListing(String sellerId, ListingRequest request) {
        bookRepository.findById(request.bookId())
            .orElseThrow(() -> new IllegalArgumentException("Book not found"));
        MarketplaceListing listing = new MarketplaceListing();
        listing.setSellerId(sellerId);
        listing.setBookId(request.bookId());
        listing.setCondition(request.condition());
        listing.setPrice(request.price());
        listing.setListedAt(Instant.now());
        listing.setStatus("ACTIVE");
        return listingRepository.save(listing);
    }

    public Order buyListing(String buyerId, String listingId) {
        MarketplaceListing listing = listingRepository.findById(listingId)
            .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        if (!"ACTIVE".equals(listing.getStatus())) {
            throw new IllegalArgumentException("Listing is not active");
        }
        if (listing.getSellerId().equals(buyerId)) {
            throw new IllegalArgumentException("Cannot buy your own listing");
        }
        // Deduct buyer balance, credit seller
        User buyer = userRepository.findById(buyerId)
            .orElseThrow(() -> new IllegalArgumentException("Buyer not found"));
        if (buyer.getBalance() < listing.getPrice()) {
            throw new IllegalArgumentException("Insufficient balance");
        }
        buyer.setBalance(buyer.getBalance() - listing.getPrice());
        userRepository.save(buyer);

        User seller = userRepository.findById(listing.getSellerId())
            .orElseThrow(() -> new IllegalArgumentException("Seller not found"));
        seller.setBalance(seller.getBalance() + listing.getPrice());
        userRepository.save(seller);

        listing.setStatus("SOLD");
        listingRepository.save(listing);

        Order order = new Order();
        order.setUserId(buyerId);
        order.setItems(List.of(new OrderItem(listing.getBookId(), 1, listing.getPrice())));
        order.setTotalPrice(listing.getPrice());
        order.setStatus("COMPLETED");
        order.setPurchasedAt(Instant.now());
        return orderRepository.save(order);
    }

    public void cancelListing(String sellerId, String listingId) {
        MarketplaceListing listing = listingRepository.findById(listingId)
            .filter(l -> l.getSellerId().equals(sellerId))
            .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        if (!"ACTIVE".equals(listing.getStatus())) {
            throw new IllegalArgumentException("Can only cancel active listings");
        }
        listing.setStatus("CANCELLED");
        listingRepository.save(listing);
    }

    public List<MarketplaceListing> getSellerListings(String sellerId) {
        return listingRepository.findBySellerId(sellerId);
    }
}
