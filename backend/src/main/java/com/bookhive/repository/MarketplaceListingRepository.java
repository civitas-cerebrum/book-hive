package com.bookhive.repository;

import com.bookhive.model.MarketplaceListing;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MarketplaceListingRepository extends MongoRepository<MarketplaceListing, String> {
    List<MarketplaceListing> findByStatus(String status);
    List<MarketplaceListing> findBySellerId(String sellerId);
}
