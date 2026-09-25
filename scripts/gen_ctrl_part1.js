const fs = require('fs');
const path = require('path');
const base = path.resolve('backend/src/main/java/mx/iqenglish/tutoring');
function w(p, s) {
  const f = path.join(base, p);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, s.trim() + '\n', 'utf8');
}

w('controller/AuthController.java', `package mx.iqenglish.tutoring.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import mx.iqenglish.tutoring.dto.ApiResponse;
import mx.iqenglish.tutoring.dto.AuthRequest;
import mx.iqenglish.tutoring.dto.AuthResponse;
import mx.iqenglish.tutoring.dto.UserDTO;
import mx.iqenglish.tutoring.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication & User Context", description = "OAuth2/OIDC compatible authentication and profile endpoints")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user credentials and receive JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile and permissions")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser() {
        return ResponseEntity.ok(ApiResponse.ok(authService.getCurrentUser()));
    }
}
`);

w('controller/UserController.java', `package mx.iqenglish.tutoring.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import mx.iqenglish.tutoring.dto.ApiResponse;
import mx.iqenglish.tutoring.dto.UserDTO;
import mx.iqenglish.tutoring.service.AuthService;
import mx.iqenglish.tutoring.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User Management", description = "User administration and profile inspection")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserDTO>> getMyProfile() {
        return ResponseEntity.ok(ApiResponse.ok(authService.getCurrentUser()));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('USER_READ') or hasRole('ADMIN') or hasRole('SUPERVISOR')")
    @Operation(summary = "List all registered users (Admin / Supervisor only)")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_READ') or hasRole('ADMIN') or hasRole('SUPERVISOR')")
    @Operation(summary = "Get user details by ID")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserById(id)));
    }
}
`);

w('controller/CampusController.java', `package mx.iqenglish.tutoring.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import mx.iqenglish.tutoring.dto.ApiResponse;
import mx.iqenglish.tutoring.dto.CampusDTO;
import mx.iqenglish.tutoring.service.CampusService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
`);

w('controller/AcademicCatalogController.java', `package mx.iqenglish.tutoring.controller;

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
    @Operation(summary = "List modules/lessons for a specific book")
    public ResponseEntity<ApiResponse<List<ModuleDTO>>> getModules(@RequestParam Long bookId) {
        return ResponseEntity.ok(ApiResponse.ok(academicService.getModulesByBook(bookId)));
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
`);

console.log('Part 1 Controllers written successfully');
