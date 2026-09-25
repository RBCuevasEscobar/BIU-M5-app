package mx.iqenglish.tutoring.dto;

import java.util.List;

public class BookDTO {
    private Long id;
    private Long levelId;
    private String levelName;
    private Integer bookNumber;
    private String title;
    private String description;
    private String coverImage;
    private List<ModuleDTO> modules;

    public BookDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getLevelId() { return levelId; }
    public void setLevelId(Long levelId) { this.levelId = levelId; }
    public String getLevelName() { return levelName; }
    public void setLevelName(String levelName) { this.levelName = levelName; }
    public Integer getBookNumber() { return bookNumber; }
    public void setBookNumber(Integer bookNumber) { this.bookNumber = bookNumber; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }
    public List<ModuleDTO> getModules() { return modules; }
    public void setModules(List<ModuleDTO> modules) { this.modules = modules; }
}
