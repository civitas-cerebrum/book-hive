package com.bookhive.controller;

import com.bookhive.model.Order;
import com.bookhive.security.UserPrincipal;
import com.bookhive.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Order management endpoints")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @Operation(summary = "Checkout cart into an order")
    public ResponseEntity<?> checkout(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(orderService.checkout(principal.getId()));
    }

    @GetMapping
    @Operation(summary = "List user's orders")
    public List<Order> getOrders(@AuthenticationPrincipal UserPrincipal principal) {
        return orderService.getOrders(principal.getId());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details")
    public ResponseEntity<Order> getOrder(@AuthenticationPrincipal UserPrincipal principal,
                                          @PathVariable String id) {
        return orderService.getOrder(principal.getId(), id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/return")
    @Operation(summary = "Return an order (within 10-minute window)")
    public ResponseEntity<?> returnOrder(@AuthenticationPrincipal UserPrincipal principal,
                                         @PathVariable String id) {
        return ResponseEntity.ok(orderService.returnOrder(principal.getId(), id));
    }
}
