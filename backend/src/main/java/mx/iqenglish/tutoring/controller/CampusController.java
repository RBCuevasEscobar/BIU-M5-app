package mx.iqenglish.tutoring.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import mx.iqenglish.tutoring.dto.ApiResponse;
import mx.iqenglish.tutoring.dto.CampusDTO;
import mx.iqenglish.tutoring.service.CampusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/campuses")
@Tag(name = "Campuses", description = "Planteles IQ English catalog and branch information")
public class CampusController {

    private final CampusService campusService;

    public CampusController(CampusService campusService) {
        this.campusService = campusService;
    }

    @GetMapping
    @Operation(summary = "List all active IQ English campuses")
    public ResponseEntity<ApiResponse<List<CampusDTO>>> getAllCampuses() {
        return ResponseEntity.ok(ApiResponse.ok(campusService.getAllActiveCampuses()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get campus branch details by ID")
    public ResponseEntity<ApiResponse<CampusDTO>> getCampusById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(campusService.getCampusById(id)));
    }
}
