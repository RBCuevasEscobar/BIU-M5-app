package mx.iqenglish.tutoring.dto;

import java.util.List;

public class AcademicProgramDTO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private List<AcademicLevelDTO> levels;

    public AcademicProgramDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<AcademicLevelDTO> getLevels() { return levels; }
    public void setLevels(List<AcademicLevelDTO> levels) { this.levels = levels; }
}
