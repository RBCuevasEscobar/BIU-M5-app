package mx.iqenglish.tutoring.repository;

import mx.iqenglish.tutoring.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByLevelId(Long levelId);
    List<Book> findByLevelIdOrderByBookNumberAsc(Long levelId);
    Optional<Book> findByBookNumber(Integer bookNumber);
}