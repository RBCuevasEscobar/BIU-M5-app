# IQ ENGLISH - TUTORING MANAGEMENT SYSTEM (FULLSTACK)

---

Plataforma Empresarial Fullstack de Gestion Academica de Tutorias, Grupos, Asistencia, Practica Oral con TalkIO, Avance y Gestion de Usuarios para IQ English.

## 1. Stack Tecnologico
- Java 21 y Spring Boot 3.3.4
- MySQL 8.0.36 / Flyway Migrations
- React 18 + TypeScript 5 + Vite 5 + TanStack Query v5
- Lucide-react + Tokens Corporativos IQ English (Pantone 294 C, Pantone 2915 C, Pantone 7544 C, Dorado)
- Spring Security 6.3 + JWT (HMAC-SHA256) + OpenAPI 3.0 / Swagger
- JUnit 5 + Mockito + Vitest + Playwright E2E

---

## 2. Modulos Implementados

1. **Autenticacion y Seguridad (Auth)**: JWT stateless, control de acceso RBAC, UserPrincipal con roles y permisos.
2. **Catalogo Academico**: Programas, niveles, libros (Books 1-3), modulos y temas autotextuales de IQ English.
3. **Planteles y Sucursales**: Gestion de planteles fisicos y modalidades (presencial / online).
4. **Grupos y Horarios**: Creacion y programacion de grupos de tutoria con capacidades y reglas de no-solapamiento.
5. **Reservas de Tutorias (Appointments)**: Reserva individual, validacion de prerrequisitos, cancelaciones y reagendamiento atomico (R10).
6. **Asistencia y Evaluacion**: Pase de lista docente (Presente, Ausente, Justificado) y control de avance.
7. **Practica Oral TalkIO**: Integracion de practica oral con IA, transcripcion, feedback fonetico y gramatical.
8. **Auditoria y Reportes**: Registro inmutable de eventos de seguridad y KPIs de ocupacion/rendimiento.
9. **Gestion de Usuarios (Phase 9)**: Administracion completa de cuentas de usuario, asignacion de roles, activacion/desactivacion, proteccion del ultimo administrador, reseteo de contrasenas, cambio de contrasena de autoservicio y exportacion a CSV.

---

## 3. Instrucciones de Ejecucion Local

### Modo A: Ejecucion Nativa (Dev Mode)
1. **Backend:**
   ```bash
   ./mvnw clean spring-boot:run -f backend/pom.xml
   ```
   - API REST: `http://localhost:8080`
   - Swagger UI: `http://localhost:8080/swagger-ui/index.html`

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   - Interfaz de Usuario: `http://localhost:5173`

### Modo B: Ejecucion con Docker Compose
```bash
docker-compose up --build
```
- Frontend: `http://localhost`
- Backend: `http://localhost:8080`

---

## 4. Credenciales de Prueba (Demo)

| Rol Master | Usuario | Correo Electronico | Contrasena | Nombre Oficial | Funcionalidad Clave |
|---|---|---|---|---|---|
| **Estudiante** | `student.carlos` | `carlos.estudiante@iqenglish.mx` | `Password123!` | Carlos Mendoza | Reservas de tutorias, TalkIO, cambiar contrasena |
| **Docente** | `teacher.ana` | `laura.teacher@iqenglish.mx` | `Password123!` | Laura Martinez | Pase de lista, evaluacion, agenda |
| **Supervisor** | `supervisor.patricia` | `supervisor@iqenglish.mx` | `Password123!` | Ricardo Soto | Creacion de grupos, supervisores |
| **Administrador** | `admin.alberto` | `admin@iqenglish.mx` | `Password123!` | Alejandro Mora | Gestion de usuarios, roles, auditoria, planteles |

---

## 5. Pruebas Automatizadas

- **Backend (JUnit 5 + Mockito + SpringBootTest)**:
  ```bash
  ./mvnw test -f backend/pom.xml
  ```
  *Resultado: 23 pruebas ejecutadas, 0 fallas, 0 errores (BUILD SUCCESS).*

- **Frontend (Vitest)**:
  ```bash
  cd frontend && npm test -- --run
  ```
  *Resultado: 9 pruebas ejecutadas, 100% pasando.*

- **End-to-End (Playwright)**:
  ```bash
  npx playwright test
  ```
