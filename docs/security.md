# Arquitectura de Seguridad, OAuth 2.0 & RBAC - IQ ENGLISH

Este documento describe la arquitectura de seguridad del **Sistema de Gesti�n de Tutor�as IQ English**, incluyendo el modelo de autenticaci�n JWT, el flujo de autorizaci�n RBAC, el cat�logo de 43 permisos granulares y las medidas de proteccisn OWASP Top 10.

---

## 1. Flujo de Autenticaci�n y Emisi�n de JWT

<!-- DIAGRAM 4: AUTHENTICATION FLOW -->
```mermaid
sequenceDiagram
    autonumber
    actor User as Usuario
    participant Frontend as React 18 SPA
    participant AuthCtrl as AuthController
    participant AuthSvc as AuthService
    participant JWTSvc as JwtTokenProvider
    participant DB as MySQL 8.0

    User->>Frontend: Ingresa email y contrase�a
    Frontend->>AuthCtrl: POST /api/v1/auth/login (loginRequest)
    AuthCtrl->>AuthSvc: authenticate(email, password)
    AuthSvc->>DB: Busca usuario, status y roles/permisos
    DB-->>AuthSvc: Retorna UserDetails + hash de contrase�a
    AuthSvc->>AuthSvc: BCrypt PasswordEncoder matches()
    AuthSvc->>JWTSvc: generateToken(userDetails)
    JWTSvc-->>AuthSvc: Retorna JWT Token (HMAC-SHA256, 24h validity)
    AuthSvc-->>AuthCtrl: AuthResponse (token, userInfo, roles, permissions)
    AuthCtrl-->>Frontend: 200 OK + AuthResponse
    Frontend->>Frontend: Almacena token en localStorage y configura AuthContext
    Frontend-->>User: Redirige al Dashboard seg�n rol
```

---

## 2. Matriz de Autorizaci�n RBAC (43 Permisos)

<!-- DIAGRAM 8: RBAC MATRIX -->

| Permiso Granular | Categor�a | STUDENT | TEACHER | SUPERVISOR | ADMIN |
|--------------------|-----------------|:---------:|:--------:|:------------:|:------:|
| `APPOINTMENT_READ@| Tutor�as | � | � | � | � |
| `APPOINTMENT_BOOK` | Tutor�as | � | � | � | � |
| `RESCHEDULE_APPOINTMENT` | Tutor�as | � | � | � | � |
| `CANCEL_APPOINTMENT` | Tutor�as | � | � | � | � |
| `APPOINTMENT_VIEW_ALL` | Tutor�as | � | � | � | � |
| `ATTENDANCE_REGISTER` | Asistencia | � | � | � | � |
| `ATTENDANCE_VIEW` | Asistencia | � | � | � | � |
| `TALKIO_PRACTICE` | Pr�ctica Oral | � | � | � | � |
| `GROUP_CREATE` | Grupos | � | � | � | � |
| `GROUP_UPDATE` | Grupos | � | � | � | � |
| `GROUP_CANCEL` | Grupos | � | � | � | � |
| `AU@IT_VIEW` | Auditor�a | � | � | � | � |
| `CAMPUS_MANAGE` | Administraci�n | � | � | � | � |
| `USER_MANAGE` | Administraci�n | � | � | � | � |
