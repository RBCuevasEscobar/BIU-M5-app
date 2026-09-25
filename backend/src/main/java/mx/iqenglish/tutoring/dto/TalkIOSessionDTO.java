package mx.iqenglish.tutoring.dto;
public class TalkIOSessionDTO {
    private String sessionId; private String studentName; private String moduleCode; private String topicTitle; private String avatarName; private String promptText; private String responseAudioUrl; private String feedbackText; private Integer pronunciationScore; private Integer grammarScore; private Integer vocabularyScore;
    public TalkIOSessionDTO() {}
    public String getSessionId() { return sessionId; } public void setSessionId(String s) { this.sessionId = s; }
    public String getStudentName() { return studentName; } public void setStudentName(String s) { this.studentName = s; }
    public String getModuleCode() { return moduleCode; } public void setModuleCode(String s) { this.moduleCode = s; }
    public String getTopicTitle() { return topicTitle; } public void setTopicTitle(String s) { this.topicTitle = s; }
    public String getAvatarName() { return avatarName; } public void setAvatarName(String s) { this.avatarName = s; }
    public String getPromptText() { return promptText; } public void setPromptText(String s) { this.promptText = s; }
    public String getResponseAudioUrl() { return responseAudioUrl; } public void setResponseAudioUrl(String s) { this.responseAudioUrl = s; }
    public String getFeedbackText() { return feedbackText; } public void setFeedbackText(String s) { this.feedbackText = s; }
    public Integer getPronunciationScore() { return pronunciationScore; } public void setPronunciationScore(Integer n) { this.pronunciationScore = n; }
    public Integer getGrammarScore() { return grammarScore; } public void setGrammarScore(Integer n) { this.grammarScore = n; }
    public Integer getVocabularyScore() { return vocabularyScore; } public void setVocabularyScore(Integer n) { this.vocabularyScore = n; }
}
