package com.bookhive.service;

import com.bookhive.model.Book;
import com.bookhive.repository.BookRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class BookService {
    private final BookRepository bookRepository;

    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public Page<Book> findAll(String query, String genre, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        if (query != null && !query.isBlank()) {
            String sanitized = query.replaceAll("[\\\\^$.|?*+()\\[\\]{}]", "\\\\$0");
            return bookRepository.searchByTitleOrAuthor(sanitized, pageable);
        }
        if (genre != null && !genre.isBlank()) {
            return bookRepository.findByGenre(genre, pageable);
        }
        return bookRepository.findAll(pageable);
    }

    public Optional<Book> findById(String id) {
        return bookRepository.findById(id);
    }
}
