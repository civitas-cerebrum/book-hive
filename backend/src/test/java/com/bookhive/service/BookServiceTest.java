package com.bookhive.service;

import com.bookhive.model.Book;
import com.bookhive.repository.BookRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class BookServiceTest {
    @Autowired private BookService bookService;
    @Autowired private BookRepository bookRepository;

    @BeforeEach
    void setUp() {
        bookRepository.deleteAll();
        Book book = new Book();
        book.setId("book-001");
        book.setTitle("Test Book");
        book.setAuthor("Test Author");
        book.setGenre("Fiction");
        book.setPrice(9.99);
        book.setStock(10);
        book.setIsbn("978-0-0000-0001-0");
        bookRepository.save(book);
    }

    @Test
    void findAll_returnsPage() {
        Page<Book> page = bookService.findAll(null, null, 0, 10);
        assertEquals(1, page.getTotalElements());
    }

    @Test
    void findAll_filterByGenre() {
        Page<Book> page = bookService.findAll(null, "Fiction", 0, 10);
        assertEquals(1, page.getTotalElements());
        Page<Book> empty = bookService.findAll(null, "Sci-Fi", 0, 10);
        assertEquals(0, empty.getTotalElements());
    }

    @Test
    void findAll_searchByQuery() {
        Page<Book> page = bookService.findAll("Test", null, 0, 10);
        assertEquals(1, page.getTotalElements());
    }

    @Test
    void findById_exists() {
        var book = bookService.findById("book-001");
        assertTrue(book.isPresent());
        assertEquals("Test Book", book.get().getTitle());
    }
}
