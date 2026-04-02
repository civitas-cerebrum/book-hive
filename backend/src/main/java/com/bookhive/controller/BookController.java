package com.bookhive.controller;

import com.bookhive.model.Book;
import com.bookhive.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/books")
@Tag(name = "Books", description = "Book catalog endpoints")
public class BookController {
    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    @Operation(summary = "List/search books with pagination")
    public Page<Book> findAll(@RequestParam(required = false) String query,
                              @RequestParam(required = false) String genre,
                              @RequestParam(defaultValue = "0") int page,
                              @RequestParam(defaultValue = "12") int size) {
        if (query != null && query.length() > 100) {
            query = query.substring(0, 100);
        }
        return bookService.findAll(query, genre, page, Math.min(size, 100));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get book details by ID")
    public ResponseEntity<Book> findById(@PathVariable String id) {
        return bookService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
