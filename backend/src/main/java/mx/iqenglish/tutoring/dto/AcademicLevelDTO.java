package mx.iqenglish.tutoring.dto;

import java.util.List;

public class AcademicLevelDTO {
    private Long id;
    private Long programId;
    private String code;
    private String name;
    private Integer sequenceOrder;
    private String description;
    private List<BookDTO> books;

    public AcademicLevelDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProgramId() { return programId; }
    public void setProgramId(Long programId) { this.programId = programId; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getSequenceOrder() { return sequenceOrder; }
    public void setSequenceOrder(Integer sequenceOrder) { this.sequenceOrder = sequenceOrder; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<BookDTO> getBooks() { return books; }
    public void setBooks(List<BookDTO> books) { this.books = books; }
}
