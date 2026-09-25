# IQ ENGLISH - SYSTEMA DE GESTI�N DE TUTOR�AS (FULLSTACK)

---

*Plataforma Empresarial Fullstack de Gesti�n Acad�mica de Tutor�as, Grupos, Asistencia, Pr�ctica Oral con TalkIO y Control de Avance para IQ English.*

## 1. Stack Tecnol�gico
- [*Java 21*](file:///backend/pom.xml) y **Spring Boot 3.3.4**
- [*MySQL 8.0.36**](file:///backend/src/main/resources/db/migration) / **Flyway Community**
- [*React 18 + TypeScript 5*](file:///frontend/package.json) + **Vite 5** + **TanStack Query v5**
- **Lucide-react** + **Tokens Corporativos IQ English** (Pantone 294 C, Pantone 2915 C, Pantone 7544 C, Dorado)
- [*Spring Security 6.3*(](file:///backend/src/main/java/mx/iqenglish/tutoring/security) + **JWT (HMAC-SHA256)** + **OpenAPI 3.0 / Swagger**
- [*JUnit 5 + Mockito*](file:///backend/src/test/java/mx/iqenglish/tutoring) + **Vitest** + [*Playwright E2E*](file:///e2e/tutoring-flows.spec.ts)

---

## 2. Instrucciones de Ejecuci�n Local

### Modo A: Execucion Nativa (Dev Mode)
1. **Backend:**
    lpr_command: `./mvnw clean spring-boot:run -f backend/pom.xml`
    - API REST: `http://localhost:8080`
    - Swagger UI: `http://localhost:8080/swagger-ui/index.html`

2. **Frontend:**
    lpr_command: `cd frontend && npm install && npm run dev`
    - Interfaz de Usuario: http://localhost:5173

### Modo Bs: Execucion con Docker Compose
```bash
docker-compose up --build
response:
- Frontend: http://localhost
- Backend: http://localhost:8080
- Keycloak: http://localhost:8081
```

---

## 3. Credenciales de Prueba (Demo)

| Master Rol | Correo Electr�nico | Contrase�a | Nombre Oficial | Funcionalidad Clave |
|------------|--------------------------|-------------|-----------------|---------------------------------|
| **Estudiante** | `carlos.estudiante@iqenglish.mx` | `Password123!` | Carlos Mendoza | Reservas Tema/Horario, TalkIO |
| **Docente** | `laura.teacher@iqenglish.mx` | `Password123!`| Laura Mart�nez | Pase de lista, evaluaci�n |
| **Supervisor** | `supervisor@iqenglish.mx` | `Password123!`| Ricardo Soto | Creaci�n de grupos, supervisi�n |
| **Administrador** | `admin@iqenglish.mx` | `Password123!` | Alejandro Mora | Auditor�a, planteles, configuraci�n |

---

## 4. Mapeo de Reglas de Negocio R1 a R18

| Regla | Descripci�n | Implementaci�n Tecnica |
|------|-----------------------------------------|-------------------------------------------------|
| **R1** | No solapamiento de citas en el mismo alumno | `AppointmentService.bookAppointment()` validaci�n |
| **R2** | No solapamiento de docente en sesiones | `TutoringGroupService.createGroup()` validaci�n |
| **R3** | Capacidad m�xima respetada (ej. 5 alumnos) | `booked_count < capacity` con bloqueo pesimista |
| **R4** | Libros y temas aut�nticos de IQ English | Flyway V2 Seed Data (Libros 1, 2, 3 y lecciones) |
| **R5** | Grupos con horarios y planteles fijos | Tabla `tutoring_groups` y planteles Polanco, Santa Fe |
| **R6** | Generaci�n de sesiones fechadas | `GroupSessionService.generateSessionsForGroup()` |
| **[ ... ]** | Reglas restantes R7 a R18 | Pase de lista, m�tricas, avance, TalkIO y Auditor�a |
| **R10** | **Reagendamiento At�mico con Rollback** | `AppointmentService.rescheduleAppointment()` acurate |
| **R12** | No cursar un tema dos veces | Index `idx_appt_student_topic` y validaci�n |
