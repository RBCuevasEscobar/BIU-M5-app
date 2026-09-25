-- IQ ENGLISH - SEED DATA SCRIPT
-- Version: V2__seed_data.sql

-- 1. ROLES
INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_STUDENT', 'IQ English Student with tutoring booking access'),
(2, 'ROLE_TEACHER', 'Academic Instructor managing classes and attendance'),
(3, 'ROLE_SUPERVISOR', 'Academic Supervisor managing groups, schedules, and teachers'),
(4, 'ROLE_ADMIN', 'System Administrator with full operational management');

-- 2. PERMISSIONS
INSERT INTO permissions (id, name, description, module) VALUES
-- Student Permissions
(1, 'PROFILE_READ', 'Read own user profile', 'USER'),
(2, 'PROFILE_UPDATE', 'Update own user profile', 'USER'),
(3, 'ACADEMIC_PROGRAM_READ', 'View academic curriculum and syllabus', 'ACADEMIC'),
(4, 'PROGRESS_READ', 'View personal academic progress', 'ACADEMIC'),
(5, 'TUTORING_SEARCH', 'Search available tutoring sessions', 'TUTORING'),
(6, 'TUTORING_BOOK', 'Book tutoring appointment slots', 'TUTORING'),
(7, 'TUTORING_READ', 'View booked tutoring appointments', 'TUTORING'),
(8, 'TUTORING_CANCEL', 'Cancel booked tutoring appointments', 'TUTORING'),
(9, 'TUTORING_RESCHEDULE', 'Reschedule tutoring appointments', 'TUTORING'),
(10, 'ATTENDANCE_READ', 'View attendance history', 'ATTENDANCE'),
(11, 'NOTIFICATION_READ', 'View received notifications', 'NOTIFICATION'),

-- Teacher Permissions
(12, 'GROUP_READ', 'View tutoring groups', 'TUTORING'),
(13, 'SCHEDULE_READ', 'View teaching calendar and schedules', 'TUTORING'),
(14, 'STUDENT_READ_ASSIGNED', 'View students enrolled in assigned groups', 'STUDENT'),
(15, 'ATTENDANCE_CREATE', 'Record attendance for group sessions', 'ATTENDANCE'),
(16, 'ATTENDANCE_UPDATE', 'Modify recorded attendance', 'ATTENDANCE'),
(17, 'RESOURCE_READ', 'Access teaching resources and guides', 'ACADEMIC'),
(18, 'PROGRESS_UPDATE', 'Update student module progress', 'ACADEMIC'),

-- Supervisor Permissions
(19, 'GROUP_CREATE', 'Create tutoring groups', 'TUTORING'),
(20, 'GROUP_UPDATE', 'Modify tutoring groups and capacities', 'TUTORING'),
(21, 'GROUP_DEACTIVATE', 'Deactivate or cancel tutoring groups', 'TUTORING'),
(22, 'GROUP_ASSIGN_TEACHER', 'Assign teachers to tutoring groups', 'TUTORING'),
(23, 'GROUP_ASSIGN_MODULE', 'Assign academic module to tutoring groups', 'TUTORING'),
(24, 'GROUP_ASSIGN_SCHEDULE', 'Assign and edit group schedules', 'TUTORING'),
(25, 'GROUP_CAPACITY_UPDATE', 'Update group capacity', 'TUTORING'),
(26, 'APPOINTMENT_READ', 'View all student appointments', 'TUTORING'),
(27, 'APPOINTMENT_RELOCATE', 'Relocate students to different groups', 'TUTORING'),
(28, 'SESSION_CANCEL', 'Cancel group sessions and trigger student alerts', 'TUTORING'),
(29, 'REPORT_READ', 'Access occupancy and performance reports', 'REPORT'),
(30, 'TEACHER_SUPERVISION', 'Supervise teaching performance and hours', 'TEACHER'),
(31, 'STUDENT_READ', 'View all students directory', 'STUDENT'),

-- Admin Permissions
(32, 'USER_CREATE', 'Create user accounts', 'ADMIN'),
(33, 'USER_READ', 'View all system users', 'ADMIN'),
(34, 'USER_UPDATE', 'Edit user profiles and roles', 'ADMIN'),
(35, 'USER_DISABLE', 'Disable or archive user accounts', 'ADMIN'),
(36, 'ROLE_MANAGE', 'Manage roles and role-permission mappings', 'ADMIN'),
(37, 'PERMISSION_MANAGE', 'Manage system permissions', 'ADMIN'),
(38, 'CAMPUS_MANAGE', 'Manage campus branches and facilities', 'CAMPUS'),
(39, 'ACADEMIC_PROGRAM_MANAGE', 'Manage programs, books, modules, and topics', 'ACADEMIC'),
(40, 'NOTIFICATION_MANAGE', 'Manage global notification templates', 'NOTIFICATION'),
(41, 'SYSTEM_CONFIGURATION', 'Configure global application parameters', 'ADMIN'),
(42, 'AUDIT_READ', 'View system security audit logs', 'ADMIN'),
(43, 'INTEGRATION_MANAGE', 'Manage Google Calendar and TalkIO integration settings', 'INTEGRATION');

-- 3. ROLE-PERMISSION MAPPINGS
-- Student mappings
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11);

-- Teacher mappings
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 2), (2, 3), (2, 4), (2, 10), (2, 11), (2, 12), (2, 13), (2, 14), (2, 15), (2, 16), (2, 17), (2, 18);

-- Supervisor mappings
INSERT INTO role_permissions (role_id, permission_id) VALUES
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 7), (3, 10), (3, 11), (3, 12), (3, 13), (3, 14), (3, 17),
(3, 19), (3, 20), (3, 21), (3, 22), (3, 23), (3, 24), (3, 25), (3, 26), (3, 27), (3, 28), (3, 29), (3, 30), (3, 31);

-- Admin mappings (All permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions;

-- 4. CAMPUSES (Planteles IQ English)
INSERT INTO campuses (id, code, name, address, city, state, postal_code, phone, email, is_active) VALUES
(1, 'CAMP-TLX-01', 'Plantel Tlaxcala Ocotlán', 'Calle San Pablo No. 4 Interior 2, Ocotlán', 'Tlaxcala', 'Tlaxcala', '90100', '+522414182800', 'tlaxcala@iqenglish.mx', TRUE),
(2, 'CAMP-API-01', 'Plantel Apizaco Centro', '2 de Abril 101, 2do Piso, Centro', 'Apizaco', 'Tlaxcala', '90300', '+522414182870', 'apizaco@iqenglish.mx', TRUE),
(3, 'CAMP-TOR-01', 'Plantel Torreón Hidalgo', 'Av. Miguel Hidalgo No. 225 Int F, Centro', 'Torreón', 'Coahuila', '27000', '+528711137343', 'torreon@iqenglish.mx', TRUE);

-- 5. ACADEMIC PROGRAM & LEVELS
INSERT INTO academic_programs (id, code, name, description, is_active) VALUES
(1, 'PROG-ENG-INT', 'IQ English Natural Immersion & Fluency Program', 'Accelerated English acquisition program focused on speaking, listening and professional mastery', TRUE);

INSERT INTO academic_levels (id, program_id, code, name, sequence_order, description) VALUES
(1, 1, 'LVL-1', 'Level 1 - Fundamental Foundations (A1-A2)', 1, 'Core grammatical structures, daily life vocabulary and direct interaction'),
(2, 1, 'LVL-2', 'Level 2 - Interactive Fluency (B1-B2)', 2, 'Complex conversational situations, excuses, opinions, travel, and cultural communication'),
(3, 1, 'LVL-3', 'Level 3 - Professional & Academic English (C1-C2)', 3, 'Specialized jargon, executive communication, debate, and TOEFL-like reading');

-- 6. BOOKS
INSERT INTO books (id, level_id, book_number, title, description, cover_image) VALUES
(1, 1, 1, 'Book 1 - Foundations of English', 'Essential grammar, alphabet, numbers, routines, food and city places', '/images/books/book1.png'),
(2, 2, 2, 'Book 2 - Interactive Fluency', 'Conversational mastery, requests, apologies, travel, media and technology', '/images/books/book2.png'),
(3, 3, 3, 'Book 3 - Professional & Advanced Mastery', 'Specialized domain vocabulary, engineering, medicine, law, business and debate', '/images/books/book3.png');

-- 7. MODULES (Lessons)
-- Book 1 Modules
INSERT INTO modules (id, book_id, module_code, title, description, sequence_order) VALUES
(1, 1, 'B1-L01A', 'Lesson 1A: Professions and Places', 'Professions, occupations, buildings and places in a city, alphabet and numbers 0 to 10', 1),
(2, 1, 'B1-L01B', 'Lesson 1B: Food and Animals', 'Fruit, food, beverages, animals and numbers from 11 to 20', 2),
(3, 1, 'B1-L04B', 'Lesson 4B: Clock Time and Daily Moments', 'Clock time, times of the day, asking and telling time, current activities', 3),
(4, 1, 'B1-L05A', 'Lesson 5A: Daily Routines and Family', 'Time expressions, daily activities, family members and routines', 4),
(5, 1, 'B1-L10A', 'Lesson 10A: Invitations and Excuses', 'Making, accepting, and declining invitations with verb + to', 5);

-- Book 2 Modules
INSERT INTO modules (id, book_id, module_code, title, description, sequence_order) VALUES
(6, 2, 'B2-L01A', 'Lesson 1A: Food and Restaurants', 'Expressing likes/dislikes, ordering meals with would and will', 1),
(7, 2, 'B2-L02A', 'Lesson 2A: Free-time Activities & Messages', 'Future with present continuous and be going to, telephone messages', 2),
(8, 2, 'B2-L05B', 'Lesson 5B: Requests, Excuses and Apologies', 'Two-part verbs, responding to requests with modals and Would you mind', 3),
(9, 2, 'B2-L06A', 'Lesson 6A: Technology Instructions & Suggestions', 'Infinitives and gerunds for uses, giving technology advice', 4),
(10, 2, 'B2-L07B', 'Lesson 7B: Abilities, Skills and Career Traits', 'Describing personality traits, job preferences and clauses with because', 5);

-- Book 3 Modules
INSERT INTO modules (id, book_id, module_code, title, description, sequence_order) VALUES
(11, 3, 'B3-L01A', 'Lesson 1A: Engineering & Future Milestones', 'Referring to time in past and predicting future with future perfect and continuous', 1),
(12, 3, 'B3-L02A', 'Lesson 2A: Medicine & Success Qualities', 'Describing qualities for success, job interview strategies and technical jargon', 2),
(13, 3, 'B3-L03A', 'Lesson 3A: Administration & Production Processes', 'Describing processes with passive voice and relative clauses in corporate settings', 3),
(14, 3, 'B3-L09A', 'Lesson 9A: Computer Science & Complex Problem Solving', 'Handling irritating situations, indirect questions, debugging scenarios', 4),
(15, 3, 'B3-L14A', 'Lesson 14A: Marketing Ethics & Consumer Strategies', 'Direct/indirect objects, subjunctive mood, evaluating marketing campaigns', 5);

-- 8. TOPICS
INSERT INTO topics (id, module_id, topic_code, title, grammar_focus, vocabulary_focus, speaking_focus) VALUES
(1, 1, 'TOP-B1-1A-1', 'Naming City Places & Careers', 'Articles a/an/the, Demonstratives this/that', 'Professions, occupations, buildings', 'This is / Is this? These are / Are these?'),
(2, 3, 'TOP-B1-4B-1', 'Asking for and Telling the Time', 'Time expressions, Present continuous Wh-questions', 'Clock time, A.M./P.M., noon, midnight', 'Asking about and describing current activities'),
(3, 8, 'TOP-B2-5B-1', 'Requests, Excuses and Apologies', 'Two-part verbs, Would you mind + gerund', 'Household complaints, polite refusals', 'Making requests and giving reasonable excuses'),
(4, 9, 'TOP-B2-6A-1', 'Describing Technology & Giving Advice', 'Infinitives & gerunds for purposes', 'Smart devices, troubleshooting terms', 'Giving suggestions for electronic devices'),
(5, 11, 'TOP-B3-1A-1', 'Engineering Breakthroughs & Innovations', 'Past adverbs, Future continuous & Future perfect', 'Engineering terminology, timelines', 'Debating future technological milestones');

-- 9. USERS (Pass: Password123! -> BCrypt hashed)
-- Dev Hash: $2a$10$OT1TvVoDgUznULW48cmyX.r4NFnvCE3p0FIXZSFche7qlFpEwHrty
INSERT INTO users (id, username, email, password_hash, first_name, last_name, phone, status, avatar_url) VALUES
(1, 'student.carlos', 'carlos.mendoza@student.iqenglish.mx', '$2a$10$OT1TvVoDgUznULW48cmyX.r4NFnvCE3p0FIXZSFche7qlFpEwHrty', 'Carlos', 'Mendoza Ramos', '+522411002233', 'ACTIVE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'),
(2, 'student.sofia', 'sofia.ramirez@student.iqenglish.mx', '$2a$10$OT1TvVoDgUznULW48cmyX.r4NFnvCE3p0FIXZSFche7qlFpEwHrty', 'Sofía', 'Ramírez Castro', '+522411002234', 'ACTIVE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia'),
(3, 'student.miguel', 'miguel.torres@student.iqenglish.mx', '$2a$10$OT1TvVoDgUznULW48cmyX.r4NFnvCE3p0FIXZSFche7qlFpEwHrty', 'Miguel', 'Torres Treviño', '+528711002235', 'ACTIVE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel'),
(4, 'teacher.ana', 'ana.garcia@iqenglish.mx', '$2a$10$OT1TvVoDgUznULW48cmyX.r4NFnvCE3p0FIXZSFche7qlFpEwHrty', 'Ana', 'García López', '+522415551122', 'ACTIVE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'),
(5, 'teacher.roberto', 'roberto.sanchez@iqenglish.mx', '$2a$10$OT1TvVoDgUznULW48cmyX.r4NFnvCE3p0FIXZSFche7qlFpEwHrty', 'Roberto', 'Sánchez Palomo', '+528715551123', 'ACTIVE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto'),
(6, 'teacher.laura', 'laura.morales@iqenglish.mx', '$2a$10$OT1TvVoDgUznULW48cmyX.r4NFnvCE3p0FIXZSFche7qlFpEwHrty', 'Laura', 'Morales Nava', '+522415551124', 'ACTIVE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura'),
(7, 'supervisor.patricia', 'patricia.veloz@iqenglish.mx', '$2a$10$OT1TvVoDgUznULW48cmyX.r4NFnvCE3p0FIXZSFche7qlFpEwHrty', 'Patricia', 'Veloz Sánchez', '+522419998877', 'ACTIVE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia'),
(8, 'admin.alberto', 'alberto.rodriguez@iqenglish.mx', '$2a$10$OT1TvVoDgUznULW48cmyX.r4NFnvCE3p0FIXZSFche7qlFpEwHrty', 'Alberto', 'Rodríguez González', '+527351776968', 'ACTIVE', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alberto');

-- 10. USER-ROLE ASSIGNMENTS
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- Carlos -> ROLE_STUDENT
(2, 1), -- Sofia -> ROLE_STUDENT
(3, 1), -- Miguel -> ROLE_STUDENT
(4, 2), -- Ana -> ROLE_TEACHER
(5, 2), -- Roberto -> ROLE_TEACHER
(6, 2), -- Laura -> ROLE_TEACHER
(7, 3), -- Patricia -> ROLE_SUPERVISOR
(8, 4); -- Alberto -> ROLE_ADMIN

-- 11. STUDENTS
INSERT INTO students (id, user_id, student_number, campus_id, current_level_id, current_book_id, current_module_id, enrollment_date, status) VALUES
(1, 1, 'STU-2026-00101', 1, 2, 2, 8, '2026-01-15', 'ACTIVE'),
(2, 2, 'STU-2026-00102', 2, 1, 1, 3, '2026-02-01', 'ACTIVE'),
(3, 3, 'STU-2026-00103', 3, 3, 3, 11, '2026-01-10', 'ACTIVE');

-- 12. TEACHERS
INSERT INTO teachers (id, user_id, employee_number, campus_id, specialty, hire_date, status) VALUES
(1, 4, 'TEA-2026-01', 1, 'Intermediate Fluency & Speaking Workshops', '2024-03-01', 'ACTIVE'),
(2, 5, 'TEA-2026-02', 3, 'Advanced English, TOEFL Preparation & Technical Jargon', '2023-08-15', 'ACTIVE'),
(3, 6, 'TEA-2026-03', 2, 'Foundational Grammar, Phonics & Pronunciation', '2025-01-10', 'ACTIVE');

-- 13. TUTORING GROUPS
INSERT INTO tutoring_groups (id, code, name, campus_id, teacher_id, module_id, topic_id, capacity, current_enrollment, status, modality, created_by_user_id) VALUES
(1, 'TUT-B2-01', 'Tutoring Group Book 2 - Lesson 5B Requests & Excuses', 1, 1, 8, 3, 12, 1, 'PUBLISHED', 'PRESENTIAL', 7),
(2, 'TUT-B1-01', 'Tutoring Group Book 1 - Lesson 4B Clock Time & Daily Routines', 2, 3, 3, 2, 10, 0, 'PUBLISHED', 'PRESENTIAL', 7),
(3, 'TUT-B3-01', 'Tutoring Group Book 3 - Lesson 1A Engineering & Future Tech', 3, 2, 11, 5, 8, 0, 'PUBLISHED', 'ONLINE', 7),
(4, 'TUT-B2-02', 'Tutoring Group Book 2 - Lesson 5B Evening Session (Alternate)', 1, 1, 8, 3, 12, 0, 'PUBLISHED', 'PRESENTIAL', 7),
(5, 'TUT-B2-FULL-01', 'Tutoring Group Book 2 - Lesson 5B (Full Capacity Test Group)', 1, 1, 8, 3, 2, 2, 'PUBLISHED', 'PRESENTIAL', 7);

-- 14. GROUP SESSIONS
INSERT INTO group_sessions (id, group_id, session_date, start_time, end_time, duration_minutes, room_or_link, status) VALUES
(1, 1, '2026-09-28', '17:00:00', '18:00:00', 60, 'Salón 1 - Edificio Principal', 'SCHEDULED'),
(2, 1, '2026-09-30', '17:00:00', '18:00:00', 60, 'Salón 1 - Edificio Principal', 'SCHEDULED'),
(3, 2, '2026-09-29', '16:00:00', '17:00:00', 60, 'Salón A - Planta Baja', 'SCHEDULED'),
(4, 3, '2026-09-29', '18:00:00', '19:00:00', 60, 'https://meet.iqenglish.mx/tut-b3-01', 'SCHEDULED'),
(5, 4, '2026-10-01', '19:00:00', '20:00:00', 60, 'Salón 2 - Edificio Principal', 'SCHEDULED'),
(6, 1, '2026-09-20', '17:00:00', '18:00:00', 60, 'Salón 1 - Edificio Principal', 'COMPLETED'),
(7, 5, '2026-09-28', '11:00:00', '12:00:00', 60, 'Salón 3', 'SCHEDULED');

-- 15. APPOINTMENTS
INSERT INTO appointments (id, appointment_number, student_id, session_id, status, booked_at) VALUES
(1, 'APT-2026-90001', 1, 1, 'CONFIRMED', '2026-09-24 10:00:00'),
(2, 'APT-2026-90002', 1, 6, 'CONFIRMED', '2026-09-18 09:30:00'),
(3, 'APT-2026-90003', 2, 7, 'CONFIRMED', '2026-09-23 14:00:00'),
(4, 'APT-2026-90004', 3, 7, 'CONFIRMED', '2026-09-23 15:00:00');

-- 16. ATTENDANCE
INSERT INTO attendance (id, appointment_id, session_id, student_id, status, notes, recorded_by_teacher_id, recorded_at) VALUES
(1, 2, 6, 1, 'PRESENT', 'Excellent active participation and solid pronunciation during speaking exercises.', 1, '2026-09-20 18:05:00');

-- 17. ACADEMIC PROGRESS
INSERT INTO academic_progress (id, student_id, module_id, status, completion_date, grade, attendance_count) VALUES
(1, 1, 6, 'COMPLETED', '2026-08-30', 95.00, 4),
(2, 1, 7, 'COMPLETED', '2026-09-15', 92.50, 4),
(3, 1, 8, 'IN_PROGRESS', NULL, NULL, 1),
(4, 2, 1, 'COMPLETED', '2026-08-25', 88.00, 4),
(5, 2, 2, 'COMPLETED', '2026-09-10', 90.00, 4),
(6, 2, 3, 'IN_PROGRESS', NULL, NULL, 0),
(7, 3, 11, 'IN_PROGRESS', NULL, NULL, 0);

-- 18. NOTIFICATIONS
INSERT INTO notifications (id, user_id, title, message, type, is_read, related_entity_type, related_entity_id) VALUES
(1, 1, 'Tutoría Confirmada', 'Tu cita para Book 2 – Lesson 5B (Requests, Excuses & Apologies) con la docente Ana García ha sido confirmada para el 28 de Septiembre a las 17:00 hrs.', 'APPOINTMENT_CONFIRMED', FALSE, 'APPOINTMENT', 1),
(2, 1, 'Asistencia Registrada', 'Tu asistencia a la sesión del 20 de Septiembre fue registrada como: PRESENTE.', 'ATTENDANCE_RECORDED', TRUE, 'ATTENDANCE', 1),
(3, 4, 'Nuevo Estudiante Inscrito', 'El estudiante Carlos Mendoza se ha inscrito a tu grupo TUT-B2-01 para la sesión del 28 de Septiembre.', 'STUDENT_ENROLLED', FALSE, 'GROUP_SESSION', 1),
(4, 7, 'Alerta de Capacidad de Grupo', 'El grupo TUT-B2-FULL-01 ha alcanzado el 100% de su capacidad (2/2 cupos ocupados).', 'GROUP_FULL', FALSE, 'TUTORING_GROUP', 5);

-- 19. AUDIT LOGS
INSERT INTO audit_logs (id, user_id, username, action, entity_name, entity_id, details, ip_address, trace_id) VALUES
(1, 8, 'admin.alberto', 'SYSTEM_INITIALIZATION', 'SYSTEM', 'ROOT', 'Initial schema created and seed data loaded successfully', '127.0.0.1', 'init-trace-001'),
(2, 7, 'supervisor.patricia', 'GROUP_CREATED', 'TUTORING_GROUP', '1', 'Created tutoring group TUT-B2-01 for Book 2 Lesson 5B', '127.0.0.1', 'grp-trace-001'),
(3, 1, 'student.carlos', 'APPOINTMENT_CREATED', 'APPOINTMENT', '1', 'Booked session ID 1 in TUT-B2-01', '127.0.0.1', 'apt-trace-001');

