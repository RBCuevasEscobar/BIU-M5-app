package mx.iqenglish.tutoring.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "topics")
public class Topic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @Column(name = "topic_code", nullable = false, length = 50)
    private String topicCode;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "grammar_focus", length = 255)
    private String grammarFocus;

    @Column(name = "vocabulary_focus", length = 255)
    private String vocabularyFocus;

    @Column(name = "speaking_focus", length = 255)
    private String speakingFocus;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Topic() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Module getModule() { return module; }
    public void setModule(Module module) { this.module = module; }
    public String getTopicCode() { return topicCode; }
    public void setTopicCode(String topicCode) { this.topicCode = topicCode; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getGrammarFocus() { return grammarFocus; }
    public void setGrammarFocus(String grammarFocus) { this.grammarFocus = grammarFocus; }
    public String getVocabularyFocus() { return vocabularyFocus; }
    public void setVocabularyFocus(String vocabularyFocus) { this.vocabularyFocus = vocabularyFocus; }
    public String getSpeakingFocus() { return speakingFocus; }
    public void setSpeakingFocus(String speakingFocus) { this.speakingFocus = speakingFocus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
