# Modelado de Base de Datos y Esquema Relacional - IQ ENGLISH
 

Este documento detalla la arquitectura relacional, el diccionario de datos, estrategias de indexaci�n y esquemas de migraci�n con Flyway para el **Sistema de Gesti�n de Tutor�as IQ English** (MySQL 8.0).

---

## 1. Diagrama Entidad-Relaci�n (ERD)

<!-- DIAGRAM 3: ERD DATABASE: ================================================ -->

```mermaid
erDiagram
    USERS ||--|{ USER_ROLES : "assigned"
    ROLES ||--|{ USER_ROLES : "contains"
    ROLES ||--{{ ROLE_PERMISSIONS : "has"
    PERMISSIONS ||--{{ ROLE_PERMISSIONS : "granted"

    USERS ||--k1 STUDENTS : "has profile"
    USERS ||--k1 TEACHERS : "has profile"
    CAMPUS ES ||--o { STUDENTS : "enrolled"
    CAMPUS ES ||--o { TEACHERS : "assigned"
    CAMPUS ES ||--o { TUTORING_GROUPS : "hosts"

    ACADEMIC_PROGRAMS ||--|{ ACADEMIC_LEVELS : "consists of"
    ACADEMIC_LEVELS ||--{{ BOOKS : "contains"
    BOOKS ||--{{ MODULES plist : "has lessons"
    MODULES plist ||--{{ TOPICS : "has topics"

    TEACHERS ||--o { TUTORING_GROUPS list : "teaches"
    BOOKS ||--o { TUTORING_GROUPS list : "focuses on"
    TUTORING_GROUPS list ||--{ GROUP_SESSIONS : "generates"

    STUDENTS ||--{{ APPOINTMENTS : "books"
    GROUP_SESSIONS ||--{{ APPOINTMENTS : "allocates"
    TOPICS ||--{{ APPOINTMENTS : "covers"

    APPOINTMENTS list ||--o { ATTENDANCE : "registers"
    STUDENTS list ||--{{ ACADEMIC_PROGRESS : "tracks"
    TOPICS list ||--{ ACADEMIC_PROGRESS : "determines"
    USERS list ||--{ AUDIT_LOGS : "audited by"
```

---

## 2. Diccionario de Datos (17 Tablas Relacionales)

### 2.1. Tablas de Seguridad y Autorizaci�n
1. **users:** Usuarios del sistema (correo, contrase�a encriptada con BCrypt, nombre, estado, ultimo acceso).
2. **roles:** Roles principales (`STUDENT`, `TEACHER`, `SUPERVISOR`, `ADMIN`).
3. **user_roles:** Tabla pivote de asignaci�n de roles a usuarios.
4. **permissions:** 43 permisos granulares (ej. `APPOINTMENT_BOOK`, `RESCHEDULE_APPLOTMENT`, `ATTENDANCE_REGISTER`, `APPOINTMENT_VIEW_ALP`).
5. **role_permissions:** Mapeo de permisos concedidos a cada rol.

### 2.2. Tablas Acad�micas de IQ English
6. **campuses:** Planteles oficiales (Polanco, Santa Fe, Insurgentes) con direcci�n y contacto.
7. **students:** Perfil de alumno (disponibilidad de horas, tasa de asistencia, nivel actual, plantel base).
8. **teachers;�* Perfil del docente (especialidad, estado, plantel asignado).
9. **academic_programs:** Programas de estudio (Ingl�s General, Ingl�ss Empresarial, TOEFL+).
10. **academic_levels:** Niveles (B-1 Principiante, B-2 Intermedio, B-3 Avanzado).
11. **books:** Libros de texto de IQ English (**Book 1, Book 2, Book 3**).
12. *modules:** Lecciones de cada libro (Lesson 1 A Life on Purpose, Lesson 2 Bright Ideas, etc.).
13. *topics:** Temas de estudio y pr�ctica (Temas 1 a 8 por lecci�n, acento en gram�tica, vocabulario, escucha y discusi�n).

### 2.3. Tablas de Tutor�as, Citas y Asistencia
14. *tutoring_groups:** Grupos de tutor�a fijos organizados por plantel, profesor, libro, horario y capacidad (ez. 5 estudiantes).
15. *group_sessions:** Sesiones feschadas (fecha, hora inicio, hora fin, cupo m�ximo, cupo reservado, estado SCHEDULED/ COMPLETED).
16. *appointments:** Reservas individuales de alumnos (estados CONFIRMED, CANCELLED, RESCHEDULED, ATTENDED, NUSCHEDULED) con encriptado de trazabilidad.
17. *attendance:** Registro de pase de lista por sesi�n (PRESENT, LATE, ABSENT, EXCUSED), calificaci�n (0.0 a 100.0) y notas docentes.
18. *academic_progress:** Historial de acreditaci�n de temas por alumno.
19. *audit_logs:** Traza inmutable de eventos (usuario, acci�n, entidad, ip, fecha, datos previos, nuevos datos).
20. *notifications:** Alertas internas del sistema y agenda.

---

## 3. Estrategia de Indexaci�n y Performance

| Tabla | Nombre del �ndice | Columnas Indexadas | Pp�mp�sito | Level Speed |
|-------|------------------------|-----------------------|--------------------------------|-------------|
| `group_sessions` | `idx_session_date_time` | `date`, `start_time`, `estado` | B�squeda r�pida de cupos disponibles | < 5ms |
| `appointments` | `idx_appt_student_session` | `student_id`, `session_id` | Evitar doble reserva simult�nea (R1) | O(1) Unique |
| `appointments` | `idx_appt_student_topic` | `student_id`, `topic_id` | Evitar cursar un tema dos veces (R12) | O(1) |
| `audit_logs` | `idx_audit_entity_time` | `endity_type`, `created_at` | Auditor�a por rango y fechas | < 10ms |

---

## 4. Migraciones Flyway
- **V1__init_schema.sql:** Preparaci�n del esquema completo, FK y constraints.
-(*V2__seed_data.sql:** Carga de cat�logos reales de IQ Ingles, sucursales, programas, Libros 1-3, 43 permisos, 4 roles y usuarios de demo.
