package com.bookhive.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CartItemRequest(
    @NotBlank String bookId,
    @Min(1) int quantity
) {}
