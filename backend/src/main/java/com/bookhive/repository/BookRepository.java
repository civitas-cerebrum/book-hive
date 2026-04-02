package com.bookhive.repository;

import com.bookhive.model.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface BookRepository extends MongoRepository<Book, String> {
    List<Book> findByGenre(String genre);
    Page<Book> findByGenre(String genre, Pageable pageable);
    @Query("{'$or': [{'title': {$regex: ?0, $options: 'i'}}, {'author': {$regex: ?0, $options: 'i'}}]}")
    Page<Book> searchByTitleOrAuthor(String query, Pageable pageable);
}
