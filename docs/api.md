# IQ ENGLISH - API SPECIFICATION

## Overview
REST API specification compliant with OpenAPI 3.0 standards for the IQ English Tutoring Management System.
Base Path: `/api/v1`

---

## 1. Authentication & Security Endpoints (`/api/v1/auth`)

- `POST /auth/login` - Authenticate user credentials and return JWT bearer token.
- `GET /auth/me` - Get current authenticated user profile and permissions.

---

## 2. User Management Endpoints (`/api/v1/users`) - Phase 9

- `GET /users` - List users with pagination (`page`, `size`, `sort`), search (`search`), role filter (`role`), and status filter (`status`). Requires `USER_READ` or `ADMIN` or `SUPERVISOR`.
- `GET /users/all` - List all registered users unpaged. Requires `USER_READ` or `ADMIN` or `SUPERVISOR`.
- `GET /users/{id}` - Retrieve detailed user profile by ID. Requires `USER_READ` or `ADMIN` or `SUPERVISOR`.
- `POST /users` - Create a new user account with role and optional campus/student/teacher assignment. Requires `USER_CREATE` or `ADMIN`.
- `PUT /users/{id}` - Update user profile attributes. Requires `USER_UPDATE` or `ADMIN`.
- `PATCH /users/{id}/status` - Update user status (`ACTIVE`, `INACTIVE`, `SUSPENDED`). Enforces last admin safeguard. Requires `USER_UPDATE` or `ADMIN`.
- `PATCH /users/{id}/role` - Update assigned role. Enforces last admin safeguard. Requires `ROLE_MANAGE` or `ADMIN`.
- `DELETE /users/{id}` - Soft-delete user account. Enforces last admin and self-deletion safeguards. Requires `USER_DISABLE` or `ADMIN`.
- `POST /users/change-password` - Authenticated user change own password. Requires `isAuthenticated()`.
- `POST /users/{id}/password-reset` - Admin reset password for any user. Requires `USER_UPDATE` or `ADMIN`.
- `GET /users/report` - Statistical overview of system user distribution. Requires `USER_READ` or `ADMIN` or `SUPERVISOR`.
- `GET /users/export/csv` - Export user directory as CSV. Requires `USER_READ` or `ADMIN` or `SUPERVISOR`.
- `GET /users/{id}/audit` - Retrieve audit history for a specific user. Requires `AUDIT_READ` or `ADMIN`.

---

## 3. Academic Catalog Endpoints (`/api/v1/academic`)

- `GET /academic/programs` - Get list of academic programs.
- `GET /academic/books` - Get academic books with module trees.
- `GET /academic/books/{id}` - Get book details.

---

## 4. Tutoring & Group Endpoints (`/api/v1/groups`, `/api/v1/appointments`)

- `GET /groups` - List tutoring groups.
- `POST /groups` - Create tutoring group.
- `GET /appointments/search` - Search available tutoring slots.
- `POST /appointments` - Book tutoring appointment.
- `POST /appointments/{id}/reschedule` - Atomic reschedule (R10).
- `POST /appointments/{id}/cancel` - Cancel appointment.

---

## 5. Attendance & Evaluations (`/api/v1/attendance`)

- `POST /attendance/record` - Record attendance for a tutoring session.
- `GET /attendance/student/{studentId}` - View student attendance history.

---

## 6. TalkIO Practice Endpoints (`/api/v1/talkio`)

- `POST /talkio/session/start` - Start AI oral practice session.
- `POST /talkio/session/{sessionId}/evaluate` - Submit speech audio and receive evaluations.
