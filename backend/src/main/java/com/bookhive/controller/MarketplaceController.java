package com.bookhive.controller;

import com.bookhive.dto.ErrorResponse;
import com.bookhive.dto.ListingRequest;
import com.bookhive.model.MarketplaceListing;
import com.bookhive.security.UserPrincipal;
import com.bookhive.service.MarketplaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
@Tag(name = "Marketplace", description = "Second-hand book marketplace")
public class MarketplaceController {
    private final MarketplaceService marketplaceService;

    public MarketplaceController(MarketplaceService marketplaceService) {
        this.marketplaceService = marketplaceService;
    }

    @GetMapping
    @Operation(summary = "List active marketplace listings")
    public List<MarketplaceListing> getListings() {
        return marketplaceService.getActiveListings();
    }

    @PostMapping("/listings")
    @Operation(summary = "Create a new listing")
    public ResponseEntity<?> createListing(@AuthenticationPrincipal UserPrincipal principal,
                                           @Valid @RequestBody ListingRequest request) {
        try {
            return ResponseEntity.ok(marketplaceService.createListing(principal.getId(), request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("listing_error", e.getMessage()));
        }
    }

    @PostMapping("/listings/{id}/buy")
    @Operation(summary = "Buy a marketplace listing")
    public ResponseEntity<?> buyListing(@AuthenticationPrincipal UserPrincipal principal,
                                        @PathVariable String id) {
        try {
            return ResponseEntity.ok(marketplaceService.buyListing(principal.getId(), id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("buy_error", e.getMessage()));
        }
    }

    @DeleteMapping("/listings/{id}")
    @Operation(summary = "Cancel own listing")
    public ResponseEntity<?> cancelListing(@AuthenticationPrincipal UserPrincipal principal,
                                           @PathVariable String id) {
        try {
            marketplaceService.cancelListing(principal.getId(), id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("cancel_error", e.getMessage()));
        }
    }
}
