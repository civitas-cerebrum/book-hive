package com.bookhive.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record ListingRequest(
    @NotBlank String bookId,
    @NotBlank String condition,
    @Positive double price
) {}
