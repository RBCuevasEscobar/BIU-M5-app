package mx.iqenglish.tutoring.dto;

public class TopicDTO {
    private Long id;
    private Long moduleId;
    private String topicCode;
    private String title;
    private String grammarFocus;
    private String vocabularyFocus;
    private String speakingFocus;

    public TopicDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getModuleId() { return moduleId; }
    public void setModuleId(Long moduleId) { this.moduleId = moduleId; }
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
}
