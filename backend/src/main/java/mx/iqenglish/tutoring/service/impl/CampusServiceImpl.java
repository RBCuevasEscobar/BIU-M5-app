package mx.iqenglish.tutoring.service.impl;

import mx.iqenglish.tutoring.dto.CampusDTO;
import mx.iqenglish.tutoring.entity.Campus;
import mx.iqenglish.tutoring.exception.ResourceNotFoundException;
import mx.iqenglish.tutoring.mapper.EntityMapper;
import mx.iqenglish.tutoring.repository.CampusRepository;
import mx.iqenglish.tutoring.service.CampusService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CampusServiceImpl implements CampusService {

    private final CampusRepository campusRepository;
    private final EntityMapper entityMapper;

    public CampusServiceImpl(CampusRepository campusRepository, EntityMapper entityMapper) {
        this.campusRepository = campusRepository;
        this.entityMapper = entityMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CampusDTO> getAllActiveCampuses() {
        return campusRepository.findByIsActiveTrue().stream().map(entityMapper::toCampusDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CampusDTO getCampusById(Long id) {
        Campus campus = campusRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Campus", id));
        return entityMapper.toCampusDTO(campus);
    }
}
