package mx.iqenglish.tutoring.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import mx.iqenglish.tutoring.dto.*;
import mx.iqenglish.tutoring.service.AcademicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Academic Curriculum Catalog", description = "Curriculum hierarchy: Programs, Levels, Books, Modules (Lessons) and Topics")
public class AcademicCatalogController {

    private final AcademicService academicService;

    public AcademicCatalogController(AcademicService academicService) {
        this.academicService = academicService;
    }

    @GetMapping("/academic-programs")
    @Operation(summary = "List academic programs and syllabus")
    public ResponseEntity<ApiResponse<List<AcademicProgramDTO>>> getPrograms() {
        return ResponseEntity.ok(ApiResponse.ok(academicService.getAllPrograms()));
    }

    @GetMapping("/academic-levels")
    @Operation(summary = "List academic levels by program ID")
    public ResponseEntity<ApiResponse<List<AcademicLevelDTO>>> getLevels(@RequestParam(required = false, defaultValue = "1") Long programId) {
        return ResponseEntity.ok(ApiResponse.ok(academicService.getLevelsByProgram(programId)));
    }

    @GetMapping("/books")
    @Operation(summary = "List all Books (Book 1, Book 2, Book 3)")
    public ResponseEntity<ApiResponse<List<BookDTO>>> getBooks(@RequestParam(required = false) Long levelId) {
        if (levelId != null) {
            return ResponseEntity.ok(ApiResponse.ok(academicService.getBooksByLevel(levelId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(academicService.getAllBooks()));
    }

    @GetMapping("/modules")
    @Operation(summary = "List modules/lessons for a specific book or all modules")
    public ResponseEntity<ApiResponse<List<ModuleDTO>>> getModules(@RequestParam(required = false) Long bookId) {
        if (bookId != null) {
            return ResponseEntity.ok(ApiResponse.ok(academicService.getModulesByBook(bookId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(academicService.getAllModules()));
    }

    @GetMapping("/modules/{id}")
    @Operation(summary = "Get module/lesson details with associated topics")
    public ResponseEntity<ApiResponse<ModuleDTO>> getModuleById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(academicService.getModuleById(id)));
    }

    @GetMapping("/topics")
    @Operation(summary = "List topics for a specific module")
    public ResponseEntity<ApiResponse<List<TopicDTO>>> getTopics(@RequestParam Long moduleId) {
        return ResponseEntity.ok(ApiResponse.ok(academicService.getTopicsByModule(moduleId)));
    }
}