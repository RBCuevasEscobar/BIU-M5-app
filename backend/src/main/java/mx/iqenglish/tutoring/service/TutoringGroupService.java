package mx.iqenglish.tutoring.service;

import mx.iqenglish.tutoring.dto.*;
import mx.iqenglish.tutoring.entity.GroupStatus;

import java.util.List;

public interface TutoringGroupService {
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
