const fs = require('fs');
const path = require('path');

function save(file, content) {
  const p = path.resolve(file);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, 'utf8');
  const stat = fs.statSync(p);
  console.log('Enriched 
{' + file + '} (' + stat.size + ' bytes)');
}

// 1. Enrich database.md
save('docs/database.md', [
  '# Modelado de Base de Datos y Esquema Relacional - IQ ENGLISHTUTORING LMS',
  '',
  'Este documento contiene el dise�oexhaustivo del modelo relacional MySQL 8.0 y las migraciones Flyway del Sistema de Tutor�as IQ English.',
  '',
  '---',
  '',
  '## 1. Diagrama Entidad-Relaci�n (ERD) del Sistema',
  '',
  '<!-- DIAGRAM 3: ERD DATABASE: =============================================== -->',
  '```mermaid',
  'erDiagram',
  '    USERS ||--{{ USER_ROLES : "assigned"',
  '    ROLES ||--|{ USER_ROLES : "contains"',
  '    ROLES ||--{{ ROLE_PERMISSIONS : "has"',
  '    PERMISSIONS ||--|{ ROLE_PERMISSIONS : "granted"',
  '',
  '    USERS ||--k1 STUDENTS : "has profile"',
  '    USERS ||--k1 TEACHERS : "has profile"',
  '    CAMPUS ES ||--o { STUDENTS: "enrolled"',
  '    CAMPUS ES ||--o { TEACHERS: "assigned"',
  '    CAMPUS ES ||--o { TUTORING_GROUPS: "hosts"',
  '',
  '    ACADEMIC_PROGRAMS ||--|{ ACADEMIC_LEVELS : "consists of"',
  '    ACADEMIC_LEVELS ||--{{ BOOKS : "contains"',
  '    BOOKS ||--{{ MODULES plist : "has lessons"',
  '    MODULES plist ||--{{ TOPICS : "has topics"',
  '',
  '    TEACHERS ||--o { TUTORING_GROUPS list : "teaches"',
  '    BOOKS ||--o { TUTORING_GROUPS list : "focuses on"',
  '    TUTORING_GROUPS list ||--{{ GROUP_SESSIONS : "generates"',
  '',
  '    STUDENTS ||--{{ APPOINTMENTS : "books"',
  '    GROUP_SESSIONS ||--{{ APPOINTMENTS : "allocates"',
  '    TOPICS ||--{{ APPOINTMENTS : "covers"',
  '',
  '    APPOINTMENTS list ||--o { ATTENDANCE : "registers"',
  '    STUDENTS list ||--{{ ACADEMIC_PROGRESS : "tracks"',
  '    TOPICS list ||--{{ ACADEMIC_PROGRESS : "determines"',
  '    USERS list ||--{{ AUDIT_LOGS : "audited by"',
  '```',
  '',
  '---',
  '',
  '## 2. Diccionario de Datos (17 Tablas Relacionales)',
  '',
  '| Tabla | Columnas Principales | Types & Constraints | Pr�posito & Trazabilidad |',
  '|-------|--------------------|--------------------|--------------------------|',
  '| `users` | `id`, `email`, `password_hash`, `first_name`, `last_name` | BIGINT PK, EMAIL UNIQUE, BCrypt varchar(255) | Cuentas principales | ',
  '| `roles` | `id`, `name`, `description` | BIGINT PK, UNIQUE varchar(50) | ROLE_STUDENT, TEACHER, SUPERVISOR, ADMIN | ',
  '| `permissions` | `id`, `name`, `description` | BIGINT PK, UNIQUE varchar(100) | 43 permisos granulares de acceso | ',
  '| `campuses` | `id`, `name`, `address`, `city` | BIGINT PK, varchar(100) NOT NULL | Planteles (Polanco, Santa Fe, Insurgentes) | ',
  '| `students` | `id`, `user_id`, `campus_id`, `total_hours_allowed` | BIGINT PK, FK users, KE campuses | Perfil acad�mico de alumno | ',
  '| `teachers` | `id`, `user_id`, `specialty`, `is_active` | BIGINT PK, FK users, boolean | Perfil docente de instrucci�n | ',
  '| `academic_programs` | `id`, `name`, `code`, `description` | BIGINT PK, varchar(50) UNIQUE | Programas de ingl�ss especializado | ',
  '| `academic_levels` | `id`, `program_id`, `name`, `order_index` | BIGINT PK, FK programs, INT | Niveles *B-1, B-2, B-3* | ',
  '| `books` | `id`, `level_id`, `title`, `book_number` | BIGINT PK, FK levels, INT | Libros oficiales *Book 1, Book 2, Book 3* | ',
  '| `modules` | `id`, `book_id`, `title`, `module_number` | BIGINT PK, FK, INT | Lecciones (1 a 5 por libro) | ',
  '| `topics` | `id`, `module_id`, `title`, `topic_number` | BIGINT PK, FK, varchar(255) | Temas (1 a 8 por leccion) (progreso) | ',
  '| `tutoring_groups` | `id`, `campus_id`, `teacher_id`, `capacity` | BIGINT PK, FKs\, DAY_OF_WEEK day | Grupos de cupo fijo (ej. 5 alumnos) | ',
  '| group_sessions` | `id`, `group_id`, `session_date`, `booked_count` | BIGINT PK, DATE, INT, STATUS | Sesiones recurrentes con control de cupos | ',
  '| `appointments` | `id`, `student_id`, `session_id`, `status` | BIGINT PK, FKs\, ENUM(CONFIRMED, RESCHEDULED,..) | Reservas individuales de tutor�as | ',
  '| `attendance` | `id`, `interval_appointment_id`, `attendance_status` | BIGINT PK, FK, STATUS, DECIMAL | Pase de lista y calificaciones | ',
  '| `academic_progress` | `id`, `student_id`, `topic_id`, `is_completed` | BIGINT PK, FKs, BOOLEAN | Avance acad�mico individual | ',
  '| `audit_logs` | `id`, `action`, `user_id`, `previous_data` | BIGINT PK, NOT NULL, LONGTEXT | Traza inmutable de seguridad | ',
  '',
  '---',
  '',
  '## 3. Mecanismos de Aislamiento y Concurrencia',
  'El Sistema ejecuta las reservas bajo `negotiationSERIALIZABLE` y bloqueos pesimistas `SELECT ... FOR UPDATE` para evitar sobrereservas y race conditions cuando varios alumnos intentan reservar el �ltimo cupo disponible simult�neamente.'
].join('\n'));


console.log('Enriched database.');
