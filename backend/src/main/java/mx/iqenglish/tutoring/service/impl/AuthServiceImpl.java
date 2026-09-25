package mx.iqenglish.tutoring.service.impl;

import mx.iqenglish.tutoring.dto.*;
import mx.iqenglish.tutoring.entity.*;
import mx.iqenglish.tutoring.exception.BusinessException;
import mx.iqenglish.tutoring.exception.ResourceNotFoundException;
import mx.iqenglish.tutoring.mapper.EntityMapper;
import mx.iqenglish.tutoring.repository.StudentRepository;
import mx.iqenglish.tutoring.repository.TeacherRepository;
import mx.iqenglish.tutoring.repository.UserRepository;
import mx.iqenglish.tutoring.security.JwtTokenProvider;
import mx.iqenglish.tutoring.security.SecurityUtils;
import mx.iqenglish.tutoring.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final EntityMapper entityMapper;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtTokenProvider tokenProvider,
                           UserRepository userRepository,
                           StudentRepository studentRepository,
                           TeacherRepository teacherRepository,
                           EntityMapper entityMapper) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.entityMapper = entityMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(request.getUsername())
            .or(() -> userRepository.findByEmail(request.getUsername()))
            .orElseThrow(() -> new ResourceNotFoundException("User", request.getUsername()));

        AuthResponse response = new AuthResponse();
        response.setToken(jwt);
        response.setExpiresIn(jwtExpirationMs);
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());

        Set<String> roles = user.getRoles().stream().map(Role::getName).collect(Collectors.toSet());
        response.setRoles(roles);

        Set<String> permissions = user.getRoles().stream()
            .filter(r -> r.getPermissions() != null)
            .flatMap(r -> r.getPermissions().stream())
            .map(Permission::getName)
            .collect(Collectors.toSet());
        response.setPermissions(permissions);

        if (roles.contains("ROLE_STUDENT")) {
            studentRepository.findByUserId(user.getId())
                .ifPresent(s -> response.setProfile(entityMapper.toStudentDTO(s)));
        } else if (roles.contains("ROLE_TEACHER")) {
            teacherRepository.findByUserId(user.getId())
                .ifPresent(t -> response.setProfile(entityMapper.toTeacherDTO(t)));
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getCurrentUser() {
        String username = SecurityUtils.getCurrentUsername()
            .orElseThrow(() -> new BusinessException("NOT_AUTHENTICATED", "No active user session found", HttpStatus.UNAUTHORIZED));
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", username));
        return entityMapper.toUserDTO(user);
    }
}
