package com.bookhive.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ListingRequest(
    @NotBlank String bookId,
    @NotBlank @Size(max = 50) String condition,
    @Positive @DecimalMax("99999.99") double price
) {}
