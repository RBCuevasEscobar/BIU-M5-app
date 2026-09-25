package mx.iqenglish.tutoring.dto;

import java.util.List;

public class ModuleDTO {
    private Long id;
    private Long bookId;
    private Integer bookNumber;
    private String bookTitle;
    private String moduleCode;
    private String title;
    private String description;
    private Integer sequenceOrder;
    private List<TopicDTO> topics;

    public ModuleDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public Integer getBookNumber() { return bookNumber; }
    public void setBookNumber(Integer bookNumber) { this.bookNumber = bookNumber; }
    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }
    public String getModuleCode() { return moduleCode; }
    public void setModuleCode(String moduleCode) { this.moduleCode = moduleCode; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getSequenceOrder() { return sequenceOrder; }
    public void setSequenceOrder(Integer sequenceOrder) { this.sequenceOrder = sequenceOrder; }
    public List<TopicDTO> getTopics() { return topics; }
    public void setTopics(List<TopicDTO> topics) { this.topics = topics; }
}
