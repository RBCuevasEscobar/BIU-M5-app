-- ============================================================================
-- IQ ENGLISH - TUTORING MANAGEMENT SYSTEM
-- V3__clean_and_reset_database.sql
-- Reset all transactional tables and seed fresh consistent entities
-- ============================================================================

-- 0. CLEAN EXISTING DATA IN REVERSE FOREIGN KEY DEPENDENCY ORDER
DELETE FROM audit_logs;
DELETE FROM notifications;
DELETE FROM attendance;
DELETE FROM academic_progress;
DELETE FROM appointments;
DELETE FROM group_sessions;
DELETE FROM tutoring_groups;
DELETE FROM teachers;
DELETE FROM students;
DELETE FROM user_roles;
DELETE FROM role_permissions;
DELETE FROM users;
DELETE FROM topics;
DELETE FROM modules;
DELETE FROM books;
DELETE FROM academic_levels;
DELETE FROM academic_programs;
DELETE FROM campuses;
DELETE FROM permissions;
DELETE FROM roles;

-- 1. ROLES
INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_STUDENT', 'IQ English Student with tutoring booking access'),
(2, 'ROLE_TEACHER', 'Academic Instructor managing classes and attendance'),
(3, 'ROLE_SUPERVISOR', 'Academic Supervisor managing groups, schedules, and teachers'),
(4, 'ROLE_ADMIN', 'System Administrator with full operational management');

-- 2. PERMISSIONS
INSERT INTO permissions (id, name, description, module) VALUES
(1, 'TUTORING_SEARCH', 'Search for available tutoring sessions', 'TUTORING'),
(2, 'TUTORING_BOOK', 'Book an open tutoring session slot', 'TUTORING'),
(3, 'TUTORING_CANCEL', 'Cancel a booked tutoring appointment', 'TUTORING'),
(4, 'TUTORING_RESCHEDULE', 'Reschedule an existing tutoring appointment', 'TUTORING'),
(5, 'TUTORING_VIEW_MY', 'View own tutoring appointments history', 'TUTORING'),
(6, 'ATTENDANCE_RECORD', 'Record attendance and grades for assigned tutoring groups', 'ATTENDANCE'),
(7, 'ATTENDANCE_VIEW_GROUP', 'View attendance lists for assigned groups', 'ATTENDANCE'),
(8, 'ATTENDANCE_VIEW_STUDENT', 'View individual student attendance history', 'ATTENDANCE'),
(9, 'GROUP_CREATE', 'Create a new tutoring group cohorte', 'GROUPS'),
(10, 'GROUP_UPDATE', 'Update configuration and teacher assignment of a group', 'GROUPS'),
(11, 'GROUP_DUPLICATE', 'Duplicate existing tutoring group structure to new schedule', 'GROUPS'),
(12, 'GROUP_CANCEL', 'Cancel or archive a tutoring group', 'GROUPS'),
(13, 'GROUP_READ', 'View tutoring groups details and enrollment status', 'GROUPS'),
(14, 'STUDENT_READ_ASSIGNED', 'View students enrolled in assigned groups', 'STUDENT'),
(15, 'ACADEMIC_PROGRESS_VIEW', 'View student curriculum progress and level status', 'ACADEMIC'),
(16, 'ACADEMIC_LEVEL_MANAGE', 'Configure academic levels and CEFR scales', 'ACADEMIC'),
(17, 'BOOK_MANAGE', 'Manage curriculum books and pedagogical materials', 'ACADEMIC'),
(18, 'MODULE_MANAGE', 'Configure lesson modules and grammar competencies', 'ACADEMIC'),
(19, 'TOPIC_MANAGE', 'Configure specific tutoring discussion topics', 'ACADEMIC'),
(20, 'CAMPUS_MANAGE', 'Manage physical branch campuses and classrooms', 'CAMPUS'),
(21, 'CAMPUS_VIEW', 'View campus directory and room capacities', 'CAMPUS'),
(22, 'TALKIO_PRACTICE', 'Access TalkIO AI interactive spoken fluency simulator', 'TALKIO'),
(23, 'TALKIO_SYNC', 'Synchronize TalkIO practice metrics with student profile', 'TALKIO'),
(24, 'REPORT_OCCUPANCY', 'Generate group occupancy and capacity metrics report', 'REPORTS'),
(25, 'REPORT_ATTENDANCE', 'Generate institutional student attendance rate reports', 'REPORTS'),
(26, 'REPORT_DASHBOARD', 'View role-specific aggregated operational dashboard', 'REPORTS'),
(27, 'TEACHER_SCHEDULE_VIEW', 'View complete teacher weekly schedule grid', 'TEACHER'),
(28, 'TEACHER_ASSIGN', 'Assign teachers to tutoring groups and rooms', 'TEACHER'),
(29, 'TEACHER_AVAILABILITY_SET', 'Set teacher available working hours and branches', 'TEACHER'),
(30, 'TEACHER_SUPERVISION', 'Supervise teaching performance and hours', 'TEACHER'),
(31, 'STUDENT_READ', 'View all students directory', 'STUDENT'),
(32, 'USER_CREATE', 'Create user accounts', 'ADMIN'),
(33, 'USER_READ', 'View all system users', 'ADMIN'),
(34, 'USER_UPDATE', 'Edit user profiles and roles', 'ADMIN'),
(35, 'USER_DISABLE', 'Disable or archive user accounts', 'ADMIN'),
(36, 'ROLE_MANAGE', 'Manage roles and role-permission mappings', 'ADMIN'),
(37, 'PERMISSION_MANAGE', 'Manage system permissions', 'ADMIN'),
(38, 'SECURITY_POLICY_MANAGE', 'Configure session timeout and RBAC policies', 'ADMIN'),
(39, 'NOTIFICATION_BROADCAST', 'Send system-wide broadcast alerts and notices', 'NOTIFICATIONS'),
(40, 'CALENDAR_INTEGRATE', 'Sync appointments with Google Calendar / Outlook', 'INTEGRATIONS'),
(41, 'SYSTEM_CONFIGURATION', 'Configure global application parameters', 'ADMIN'),
(42, 'AUDIT_READ', 'View system security audit logs', 'ADMIN');

-- 3. ROLE-PERMISSION MAPPINGS
-- ROLE_STUDENT (Role 1)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 15), (1, 21), (1, 22), (1, 23), (1, 26), (1, 40);

-- ROLE_TEACHER (Role 2)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 6), (2, 7), (2, 8), (2, 13), (2, 14), (2, 15), (2, 21), (2, 22), (2, 24), (2, 26), (2, 27), (2, 40);

-- ROLE_SUPERVISOR (Role 3)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, 1), (3, 6), (3, 7), (3, 8), (3, 9), (3, 10), (3, 11), (3, 12), (3, 13), (3, 14), (3, 15),
(3, 20), (3, 21), (3, 22), (3, 24), (3, 25), (3, 26), (3, 27), (3, 28), (3, 29), (3, 30),
(3, 31), (3, 33), (3, 39), (3, 40);

-- ROLE_ADMIN (Role 4 - All Permissions 1 to 42)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions;

-- 4. CAMPUSES
INSERT INTO campuses (id, code, name, address, city, state, postal_code, phone, email, is_active) VALUES
(1, 'TLX-01', 'Plantel Tlaxcala Central', 'Av. Juarez 102, Centro', 'Tlaxcala', 'Tlaxcala', '90000', '+52 246 462 0011', 'tlaxcala@iqenglish.mx', TRUE),
(2, 'APZ-02', 'Plantel Apizaco Norte', 'Blvd. 16 de Septiembre 405, San Martin', 'Apizaco', 'Tlaxcala', '90300', '+52 241 417 8822', 'apizaco@iqenglish.mx', TRUE),
(3, 'HMT-03', 'Plantel Huamantla Oriente', 'Calle Hidalgo 210, Centro', 'Huamantla', 'Tlaxcala', '90500', '+52 247 472 5533', 'huamantla@iqenglish.mx', TRUE);

-- 5. ACADEMIC PROGRAMS
INSERT INTO academic_programs (id, code, name, description, is_active) VALUES
(1, 'IQ-EFL-PROG', 'IQ English Fluency Acceleration Program', 'Comprehensive communicative English program based on interactive tutoring and AI conversation practice', TRUE);

-- 6. ACADEMIC LEVELS
INSERT INTO academic_levels (id, program_id, code, name, sequence_order, description) VALUES
(1, 1, 'LEV-1', 'Level 1 - Principiante', 1, 'Nivel elemental enfocado en fundamentos gramaticales y vocabulario base (A1-A2)'),
(2, 1, 'LEV-2', 'Level 2 - Intermedio', 2, 'Nivel intermedio para desarrollo de fluidez conversacional y expresiones complejas (B1-B2)'),
(3, 1, 'LEV-3', 'Level 3 - Avanzado', 3, 'Nivel avanzado para comunicacion ejecutiva, tecnica y redaccion formal (C1-C2)');

-- 7. BOOKS
INSERT INTO books (id, level_id, book_number, title, description, cover_image) VALUES
(1, 1, 1, 'Book 1: Foundations of Fluency', 'Gramatica basica, fonetica, estructuras cotidianas y speaking introductorio', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'),
(2, 2, 2, 'Book 2: Interactive Fluency', 'Expresiones idiomaticas, debates interactivos y speaking situacional intermedio', 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400'),
(3, 3, 3, 'Book 3: Professional English', 'Ingles de negocios, terminologia corporativa y redaccion ejecutiva', 'https://images.unsplash.com/photo-1532012164546-f432f2e37b7b?w=400'),
(4, 3, 4, 'Book 4: Mastery and Leadership', 'Liderazgo, negociaciones de alto impacto y preparacion avanzada TOEFL/IELTS', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400');

-- 8. MODULES (Lessons)
INSERT INTO modules (id, book_id, module_code, title, description, sequence_order) VALUES
-- Book 1 (Level 1)
(1, 1, 'MOD-B1-01', 'Lesson 1A: Introductions, Greetings & Alphabet', 'Verb to be, subject pronouns, alphabet phonetics and basic greetings', 1),
(2, 1, 'MOD-B1-02', 'Lesson 2B: Jobs, Occupations & Workplaces', 'Indefinite articles (a/an), simple present statements and workplace terms', 2),
(3, 1, 'MOD-B1-03', 'Lesson 4B: Clock Time, Schedules & Daily Routines', 'Simple present questions, adverbs of frequency and time prepositions (at, on, in)', 3),
(4, 1, 'MOD-B1-04', 'Lesson 6A: Supermarket, Shopping & Quantifiers', 'Countable and uncountable nouns, some/any, much/many, how much/how many', 4),
(5, 1, 'MOD-B1-05', 'Lesson 8B: Past Simple & Memorable Vacations', 'Regular and irregular past simple verbs, past time expressions and travel talk', 5),

-- Book 2 (Level 2)
(6, 2, 'MOD-B2-01', 'Lesson 1A: Personality Types & Life Goals', 'Gerunds as subjects, relative clauses with who/that and personality adjectives', 1),
(7, 2, 'MOD-B2-02', 'Lesson 3B: Urban Living, Cities & Commuting', 'Evaluations and comparisons with adjectives and nouns (enough, too much/too many)', 2),
(8, 2, 'MOD-B2-03', 'Lesson 5B: Requests, Excuses & Apologies', 'Two-part verbs, Would you mind + gerund, polite requests and reasonable excuses', 3),
(9, 2, 'MOD-B2-04', 'Lesson 6A: Technology, Devices & Troubleshooting', 'Infinitives and gerunds for uses and purposes, imperative for giving instructions', 4),
(10, 2, 'MOD-B2-05', 'Lesson 8B: Hypothetical Situations & Second Conditional', 'Unreal conditional with would/could, past tense hypotheses and moral dilemmas', 5),

-- Book 3 (Level 3)
(11, 3, 'MOD-B3-01', 'Lesson 1A: Engineering Breakthroughs & Innovations', 'Past adverbs, future continuous, future perfect and technical timeline debate', 1),
(12, 3, 'MOD-B3-02', 'Lesson 3B: Global Business Negotiations & Trade', 'Passives with modals, negotiation diplomatic phrasing and contract vocabulary', 2),
(13, 3, 'MOD-B3-03', 'Lesson 5A: Environmental Policies & Sustainability', 'Subjunctive mood in business proposals, cause-effect connectors and ecological data', 3),
(14, 3, 'MOD-B3-04', 'Lesson 7B: Leadership Psychology & Team Building', 'Reported speech review, managing corporate conflict and motivational coaching', 4),
(15, 3, 'MOD-B3-05', 'Lesson 9A: Cross-Cultural Communication in Corporations', 'Inversion for emphasis, diplomatic softeners and international business etiquette', 5);

-- 9. TOPICS
INSERT INTO topics (id, module_id, topic_code, title, grammar_focus, vocabulary_focus, speaking_focus) VALUES
(1, 1, 'TOP-B1-1A-1', 'Introductions, Greetings & Alphabet', 'Verb to be, Personal pronouns', 'Greetings, Numbers 1-100, Alphabet', 'Exchanging basic personal information'),
(2, 3, 'TOP-B1-4B-1', 'Clock Time, Schedules & Daily Routines', 'Simple Present, Adverbs of frequency', 'Time expressions, Daily activities', 'Describing typical daily routines'),
(3, 8, 'TOP-B2-5B-1', 'Requests, Excuses and Apologies', 'Two-part verbs, Would you mind + gerund', 'Household complaints, polite refusals', 'Making requests and giving reasonable excuses'),
(4, 9, 'TOP-B2-6A-1', 'Describing Technology & Giving Advice', 'Infinitives & gerunds for purposes', 'Smart devices, troubleshooting terms', 'Giving suggestions for electronic devices'),
(5, 11, 'TOP-B3-1A-1', 'Engineering Breakthroughs & Innovations', 'Past adverbs, Future continuous & Future perfect', 'Engineering terminology, timelines', 'Debating future technological milestones');

-- 10. USERS (Password: Password123! -> BCrypt hash)
-- Hash: $2a$10$OT1TvVoDgUznULW48cmyX.r4NFnvCE3p0FIXZSFche7qlFpEwHrty
INSERT INTO users (id, username, email, password_hash, first_name, last_name, phone, status, avatar_url) VALUES
(1, 'student.carlos', 'carlos.mendoza@student.iqenglish.mx', '$2a$10$OT1TvVoDgUznULW48cmyX.r4NFnvCE3p0FIXZSFche7qlFpEwHrty', 'Carlos', 'Mendoza Ramos', '+522461002233', 'ACTIVE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'),
(2, 'student.sofia', 'sofia.ramirez@student.iqenglish.mx', '$2a$10$OT1TvVoDgUznULW48cmyX.r4NFnvCE3p0FIXZSFche7qlFpEwHrty', 'Sofia', 'Ramirez Castro', '+522411002234', 'ACTIVE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia'),
(3, 'student.miguel', 'miguel.torres@student.iqenglish.mx', '$2a$10$OT1TvVoDgUznULW48cmyX.r4NFnvCE3p0FIXZSFche7qlFpEwHrty', 'Miguel', 'Torres Trevino', '+522471002235', 'ACTIVE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel'),
(4, 'teacher.ana', 'ana.garcia@iqenglish.mx', '$2a$10$OT1TvVoDgUznULW48cmyX.r4NFnvCE3p0FIXZSFche7qlFpEwHrty', 'Ana', 'Garcia Lopez', '+522465551122', 'ACTIVE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'),
(5, 'teacher.roberto', 'roberto.sanchez@iqenglish.mx', '$2a$10$OT1TvVoDgUznULW48cmyX.r4NFnvCE3p0FIXZSFche7qlFpEwHrty', 'Roberto', 'Sanchez Palomo', '+522475551123', 'ACTIVE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto'),
(6, 'teacher.laura', 'laura.morales@iqenglish.mx', '$2a$10$OT1TvVoDgUznULW48cmyX.r4NFnvCE3p0FIXZSFche7qlFpEwHrty', 'Laura', 'Morales Nava', '+522415551124', 'ACTIVE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura'),
(7, 'supervisor.patricia', 'patricia.veloz@iqenglish.mx', '$2a$10$OT1TvVoDgUznULW48cmyX.r4NFnvCE3p0FIXZSFche7qlFpEwHrty', 'Patricia', 'Veloz Sanchez', '+522469998877', 'ACTIVE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia'),
(8, 'admin.alberto', 'alberto.rodriguez@iqenglish.mx', '$2a$10$OT1TvVoDgUznULW48cmyX.r4NFnvCE3p0FIXZSFche7qlFpEwHrty', 'Alberto', 'Rodriguez Gonzalez', '+522461776968', 'ACTIVE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alberto'),
(9, 'student.valeria', 'valeria.castillo@student.iqenglish.mx', '$2a$10$OT1TvVoDgUznULW48cmyX.r4NFnvCE3p0FIXZSFche7qlFpEwHrty', 'Valeria', 'Castillo Morales', '+522463334455', 'ACTIVE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Valeria');

-- 11. USER-ROLE ASSIGNMENTS
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- Carlos -> ROLE_STUDENT
(2, 1), -- Sofia -> ROLE_STUDENT
(3, 1), -- Miguel -> ROLE_STUDENT
(4, 2), -- Ana -> ROLE_TEACHER
(5, 2), -- Roberto -> ROLE_TEACHER
(6, 2), -- Laura -> ROLE_TEACHER
(7, 3), -- Patricia -> ROLE_SUPERVISOR
(8, 4), -- Alberto -> ROLE_ADMIN
(9, 1); -- Valeria -> ROLE_STUDENT

-- 12. STUDENTS
INSERT INTO students (id, user_id, student_number, campus_id, current_level_id, current_book_id, current_module_id, enrollment_date, status) VALUES
(1, 1, 'STU-2026-00101', 1, 2, 2, 8, '2026-01-15', 'ACTIVE'),
(2, 2, 'STU-2026-00102', 2, 1, 1, 3, '2026-02-01', 'ACTIVE'),
(3, 3, 'STU-2026-00103', 3, 3, 3, 11, '2026-01-10', 'ACTIVE'),
(4, 9, 'STU-2026-00104', 1, 2, 2, 8, '2026-03-01', 'ACTIVE');

-- 13. TEACHERS
INSERT INTO teachers (id, user_id, employee_number, campus_id, specialty, hire_date, status) VALUES
(1, 4, 'TEA-2026-01', 1, 'Intermediate Fluency & Speaking Workshops', '2024-03-01', 'ACTIVE'),
(2, 5, 'TEA-2026-02', 3, 'Advanced English, TOEFL Preparation & Technical Jargon', '2023-08-15', 'ACTIVE'),
(3, 6, 'TEA-2026-03', 2, 'Foundational Grammar, Phonics & Pronunciation', '2025-01-10', 'ACTIVE');

-- 14. TUTORING GROUPS
INSERT INTO tutoring_groups (id, code, name, campus_id, teacher_id, module_id, topic_id, capacity, current_enrollment, status, modality, created_by_user_id) VALUES
(1, 'TUT-B2-01', 'Tutoring Group Book 2 - Lesson 5B Requests & Excuses', 1, 1, 8, 3, 12, 2, 'PUBLISHED', 'PRESENTIAL', 7),
(2, 'TUT-B1-01', 'Tutoring Group Book 1 - Lesson 4B Clock Time & Daily Routines', 2, 3, 3, 2, 10, 1, 'PUBLISHED', 'PRESENTIAL', 7),
(3, 'TUT-B3-01', 'Tutoring Group Book 3 - Lesson 1A Engineering & Future Tech', 3, 2, 11, 5, 8, 1, 'PUBLISHED', 'ONLINE', 7),
(4, 'TUT-B2-02', 'Tutoring Group Book 2 - Lesson 5B Evening Session (Alternate)', 1, 1, 8, 3, 12, 0, 'PUBLISHED', 'PRESENTIAL', 7),
(5, 'TUT-B2-FULL-01', 'Tutoring Group Book 2 - Lesson 5B (Full Capacity Test Group)', 1, 1, 8, 3, 2, 2, 'PUBLISHED', 'PRESENTIAL', 7),
(6, 'TUT-B2-CLOSED-01', 'Tutoring Group Book 2 - Lesson 5B (Completed & Closed Session)', 1, 1, 8, 3, 12, 1, 'COMPLETED', 'PRESENTIAL', 7);

-- 15. GROUP SESSIONS
INSERT INTO group_sessions (id, group_id, session_date, start_time, end_time, duration_minutes, room_or_link, status) VALUES
(1, 1, '2026-10-02', '17:00:00', '18:00:00', 60, 'Salon 1 - Edificio Principal', 'SCHEDULED'),
(2, 1, '2026-10-05', '17:00:00', '18:00:00', 60, 'Salon 1 - Edificio Principal', 'SCHEDULED'),
(3, 2, '2026-10-03', '16:00:00', '17:00:00', 60, 'Salon A - Planta Baja', 'SCHEDULED'),
(4, 3, '2026-10-04', '18:00:00', '19:00:00', 60, 'https://meet.iqenglish.mx/tut-b3-01', 'SCHEDULED'),
(5, 4, '2026-10-06', '19:00:00', '20:00:00', 60, 'Salon 2 - Edificio Principal', 'SCHEDULED'),
(6, 6, '2026-09-20', '17:00:00', '18:00:00', 60, 'Salon 1 - Edificio Principal', 'COMPLETED'),
(7, 5, '2026-10-04', '11:00:00', '12:00:00', 60, 'Salon 3', 'SCHEDULED'),
(8, 6, '2026-09-27', '17:00:00', '18:00:00', 60, 'Salon 1 - Edificio Principal', 'COMPLETED');

-- 16. APPOINTMENTS
INSERT INTO appointments (id, appointment_number, student_id, session_id, status, booked_at) VALUES
(1, 'APT-2026-90001', 1, 1, 'CONFIRMED', '2026-09-24 10:00:00'),
(2, 'APT-2026-90002', 1, 6, 'COMPLETED', '2026-09-18 09:30:00'),
(3, 'APT-2026-90003', 2, 3, 'CONFIRMED', '2026-09-23 14:00:00'),
(4, 'APT-2026-90004', 3, 4, 'CONFIRMED', '2026-09-23 15:00:00'),
(5, 'APT-2026-90005', 4, 2, 'CONFIRMED', '2026-09-25 11:00:00'),
(6, 'APT-2026-90006', 1, 7, 'CONFIRMED', '2026-09-26 12:00:00'),
(7, 'APT-2026-90007', 4, 7, 'CONFIRMED', '2026-09-26 12:15:00'),
(8, 'APT-2026-90008', 4, 8, 'COMPLETED', '2026-09-20 09:00:00');

-- 17. ATTENDANCE
INSERT INTO attendance (id, appointment_id, session_id, student_id, status, grade, notes, recorded_by_teacher_id, recorded_at) VALUES
(1, 2, 6, 1, 'PRESENT', 94.00, 'Excelente participacion activa y solida fluidez verbal.', 1, '2026-09-20 18:05:00'),
(2, 8, 8, 4, 'PRESENT', 92.00, 'Buen dominio de vocabulario y estructuras intermedias.', 1, '2026-09-27 18:05:00');

-- 18. ACADEMIC PROGRESS
INSERT INTO academic_progress (id, student_id, module_id, status, completion_date, grade, attendance_count) VALUES
-- Carlos (Student 1) - Book 2
(1, 1, 6, 'COMPLETED', '2026-08-30', 95.00, 4),
(2, 1, 7, 'COMPLETED', '2026-09-15', 92.50, 4),
(3, 1, 8, 'IN_PROGRESS', NULL, NULL, 1),
-- Sofia (Student 2) - Book 1
(4, 2, 1, 'COMPLETED', '2026-08-25', 88.00, 4),
(5, 2, 2, 'COMPLETED', '2026-09-10', 90.00, 4),
(6, 2, 3, 'IN_PROGRESS', NULL, NULL, 0),
-- Miguel (Student 3) - Book 3
(7, 3, 11, 'IN_PROGRESS', NULL, NULL, 0),
-- Valeria (Student 4) - Book 2
(8, 4, 6, 'COMPLETED', '2026-08-28', 91.00, 4),
(9, 4, 7, 'COMPLETED', '2026-09-12', 89.50, 4),
(10, 4, 8, 'IN_PROGRESS', NULL, NULL, 1);

-- 19. NOTIFICATIONS
INSERT INTO notifications (id, user_id, title, message, type, is_read, related_entity_type, related_entity_id) VALUES
(1, 1, 'Tutoria Confirmada', 'Tu cita para Book 2 - Lesson 5B (Requests, Excuses & Apologies) con la docente Ana Garcia ha sido confirmada para el 02 de Octubre a las 17:00 hrs.', 'APPOINTMENT_CONFIRMED', FALSE, 'APPOINTMENT', 1),
(2, 1, 'Asistencia Registrada', 'Tu asistencia a la sesion del 20 de Septiembre fue registrada como: PRESENTE.', 'ATTENDANCE_RECORDED', TRUE, 'ATTENDANCE', 1),
(3, 4, 'Nuevo Estudiante Inscrito', 'El estudiante Carlos Mendoza se ha inscrito a tu grupo TUT-B2-01 para la sesion del 02 de Octubre.', 'STUDENT_ENROLLED', FALSE, 'GROUP_SESSION', 1),
(4, 7, 'Alerta de Capacidad de Grupo', 'El grupo TUT-B2-FULL-01 ha alcanzado el 100% de su capacidad (2/2 cupos ocupados).', 'GROUP_FULL', FALSE, 'TUTORING_GROUP', 5);

-- 20. AUDIT LOGS
INSERT INTO audit_logs (id, user_id, username, action, entity_name, entity_id, details, ip_address, trace_id) VALUES
(1, 8, 'admin.alberto', 'SYSTEM_INITIALIZATION', 'SYSTEM', 'ROOT', 'Initial schema created and consistent seed data loaded successfully', '127.0.0.1', 'init-trace-001'),
(2, 7, 'supervisor.patricia', 'GROUP_CREATED', 'TUTORING_GROUP', '1', 'Created tutoring group TUT-B2-01 for Book 2 Lesson 5B', '127.0.0.1', 'grp-trace-001'),
(3, 1, 'student.carlos', 'APPOINTMENT_CREATED', 'APPOINTMENT', '1', 'Booked session ID 1 in TUT-B2-01', '127.0.0.1', 'apt-trace-001');
