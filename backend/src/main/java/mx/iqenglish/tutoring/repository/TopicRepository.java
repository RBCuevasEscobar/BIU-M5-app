package mx.iqenglish.tutoring.repository;

import mx.iqenglish.tutoring.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findByModuleId(Long moduleId);
    Optional<Topic> findByTopicCode(String topicCode);
}
