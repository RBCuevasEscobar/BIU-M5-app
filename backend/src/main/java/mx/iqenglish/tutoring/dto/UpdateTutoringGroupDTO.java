package mx.iqenglish.tutoring.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import mx.iqenglish.tutoring.entity.GroupStatus;

public class UpdateTutoringGroupDTO {

    @NotBlank(message = "El nombre del grupo es obligatorio")
    private String name;

    @NotNull(message = "El plantel es obligatorio")
    private Long campusId;

    @NotNull(message = "El docente es obligatorio")
    private Long teacherId;

    @NotNull(message = "El modulo es obligatorio")
    private Long moduleId;

    private Long topicId;

    @NotNull(message = "La capacidad es obligatoria")
    @Min(value = 1, message = "La capacidad minima debe ser 1")
    private Integer capacity;

    private String modality;

    private GroupStatus status;

    public UpdateTutoringGroupDTO() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getCampusId() { return campusId; }
    public void setCampusId(Long campusId) { this.campusId = campusId; }
    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }
    public Long getModuleId() { return moduleId; }
    public void setModuleId(Long moduleId) { this.moduleId = moduleId; }
    public Long getTopicId() { return topicId; }
    public void setTopicId(Long topicId) { this.topicId = topicId; }
    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
    public String getModality() { return modality; }
    public void setModality(String modality) { this.modality = modality; }
    public GroupStatus getStatus() { return status; }
    public void setStatus(GroupStatus status) { this.status = status; }
}
