package mx.iqenglish.tutoring.service;

import java.util.List;
import mx.iqenglish.tutoring.dto.CreateTutoringGroupDTO;
import mx.iqenglish.tutoring.dto.DuplicateGroupDTO;
import mx.iqenglish.tutoring.dto.GroupReportDTO;
import mx.iqenglish.tutoring.dto.TutoringGroupDTO;
import mx.iqenglish.tutoring.dto.UpdateTutoringGroupDTO;
import mx.iqenglish.tutoring.entity.GroupStatus;

public interface TutoringGroupService {
    List<mx.iqenglish.tutoring.dto.AppointmentDTO> getEnrolledStudentsByGroup(Long groupId);
    byte[] exportEnrolledStudentsCsv(Long groupId, Long campusId, Long moduleId, Long teacherId);

    List<TutoringGroupDTO> getAllGroups();
    TutoringGroupDTO getGroupById(Long id);
    TutoringGroupDTO createGroup(CreateTutoringGroupDTO dto);
    TutoringGroupDTO duplicateGroup(Long groupId, DuplicateGroupDTO dto);
    TutoringGroupDTO updateGroup(Long id, UpdateTutoringGroupDTO dto);
    void deleteGroup(Long id);
    TutoringGroupDTO updateGroupStatus(Long id, GroupStatus status);
    List<TutoringGroupDTO> filterGroups(Long campusId, Long moduleId, Long teacherId, Long bookId, GroupStatus status);
    GroupReportDTO generateGroupReport(Long campusId, Long moduleId, Long teacherId, Long bookId, GroupStatus status);
    byte[] exportGroupReportCsv(Long campusId, Long moduleId, Long teacherId, Long bookId, GroupStatus status);
}
