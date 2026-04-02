package com.bookhive.controller;

import com.bookhive.dto.CartItemRequest;
import com.bookhive.dto.CartItemUpdateRequest;
import com.bookhive.model.CartItem;
import com.bookhive.security.UserPrincipal;
import com.bookhive.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@Tag(name = "Cart", description = "Shopping cart endpoints")
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    @Operation(summary = "Get current user's cart")
    public List<CartItem> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        return cartService.getCart(principal.getId());
    }

    @PostMapping("/items")
    @Operation(summary = "Add item to cart")
    public ResponseEntity<?> addItem(@AuthenticationPrincipal UserPrincipal principal,
                                     @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addItem(principal.getId(), request));
    }

    @PutMapping("/items/{id}")
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<?> updateItem(@AuthenticationPrincipal UserPrincipal principal,
                                        @PathVariable String id,
                                        @Valid @RequestBody CartItemUpdateRequest body) {
        return ResponseEntity.ok(cartService.updateItem(principal.getId(), id, body.quantity()));
    }

    @DeleteMapping("/items/{id}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<?> removeItem(@AuthenticationPrincipal UserPrincipal principal,
                                        @PathVariable String id) {
        cartService.removeItem(principal.getId(), id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    @Operation(summary = "Clear entire cart")
    public ResponseEntity<?> clearCart(@AuthenticationPrincipal UserPrincipal principal) {
        cartService.clearCart(principal.getId());
        return ResponseEntity.ok().build();
    }
}
