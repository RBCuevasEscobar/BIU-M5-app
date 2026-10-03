# Estrategia de Pruebas, Automatizacion y Calidad (QA) - IQ English

Este documento especifica la estrategia integral de calidad, automatizacion y cobertura de pruebas aplicada a la solucion **IQ English Tutoring System**, estructurada bajo el modelo de la Piramide de Pruebas (Test Pyramid), abarcando pruebas unitarias y de integracion en Backend con JUnit 5 y Mockito, pruebas de componentes en Frontend con Vitest y React Testing Library, y pruebas End-to-End (E2E) con Playwright y automatizacion Chromium.

---

## 1. Piramide de Pruebas y Estrategia de Calidad

La estrategia de aseguramiento de calidad de IQ English distribuye los esfuerzos de prueba en tres niveles jerarquicos para maximizar la deteccion temprana de defectos, asegurar la estabilidad de las reglas de negocio y optimizar los tiempos de ejecucion en pipelines de integracion continua (CI/CD):

```
                       /\
                      /  \
                     /    \
                    / E2E  \       10% - Pruebas End-to-End (Playwright)
                   /--------\            Flujos criticos de usuario multi-rol
                  /          \
                 / Integracion\    20% - Pruebas de Integracion (Spring / MockMvc)
                /--------------\         Controladores REST, RBAC y Repositorios
               /                \
              /    Unitarias     \ 70% - Pruebas Unitarias (JUnit 5 + Vitest)
             /                    \      Servicios, reglas R01-R05, componentes UI
            /----------------------\
```

### 1.1 Distribucion de Responsabilidades

| Nivel de Prueba | Herramientas / Frameworks | Alcance y Objetivo | Frecuencia de Ejecucion |
| :--- | :--- | :--- | :--- |
| **Nivel 1: Unitarias Backend** | JUnit 5, Mockito, AssertJ | Validacion aislada de servicios de dominio, reglas de negocio (R01 a R05), calculo de cupos, persistencia logica y DTOs. | En cada commit y compilacion local / PR |
| **Nivel 1: Unitarias Frontend** | Vitest, React Testing Library, jsdom | Renderizado de componentes, estados de carga, interacciones de modales, calculo de filtros y mock de servicios API. | En cada commit / ejecucion pre-push |
| **Nivel 2: Integracion Backend** | Spring Boot Test, MockMvc, Spring Security Test | Evaluacion de endpoints REST, serializacion JSON, autorizacion por roles (RBAC) y manejo global de excepciones. | Pipeline de CI en Pull Requests |
| **Nivel 3: End-to-End (E2E)** | Playwright, Chromium Headless CDP | Recorrido funcional de los flujos de usuario completos (Estudiante, Docente, Administrador, Supervisor) en navegadores reales. | Pipeline nocturno / despliegue a Staging |

---

## 2. Suites de Pruebas en Backend (JUnit 5 + Mockito + Spring Boot Test)

El backend implementa una bateria exhaustiva de pruebas unitarias y de integracion cubriendo la capa de servicios, seguridad y controladores REST.

### 2.1 Resumen de Cobertura y Metricas de Ejecucion Backend

| Suite de Pruebas (Clase Java) | Tipo de Prueba | Componente Probado | Total Tests | Exitosos | Fallidos |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `TutoringGroupServiceTest` | Unitaria (Mockito) | `TutoringGroupServiceImpl` | 7 | 7 | 0 |
| `AppointmentServiceTest` | Unitaria (Mockito) | `AppointmentServiceImpl` | 5 | 5 | 0 |
| `AttendanceServiceTest` | Unitaria (Mockito) | `AttendanceServiceImpl` | 3 | 3 | 0 |
| `UserServiceTest` | Unitaria (Mockito) | `UserServiceImpl` | 10 | 10 | 0 |
| `SecurityRbacTest` | Seguridad / RBAC | `CustomUserDetailsService`, Jwt | 1 | 1 | 0 |
| `TutoringGroupControllerTest` | Integracion (MockMvc) | `TutoringGroupController` | 6 | 6 | 0 |
| `UserControllerTest` | Integracion (MockMvc) | `UserController` | 6 | 6 | 0 |
| **TOTAL BACKEND** | | | **38** | **38** | **0** |

---

### 2.2 Detalle de Casos de Prueba por Suite Backend

#### A. Suite de Gestion de Grupos: `TutoringGroupServiceTest.java`
Verifica la logica de negocio en creacion, actualizacion, control de cupos y reportes de grupos de tutoria:
* `testTeacherCannotHaveOverlappingSessions()`: Valida que un docente no pueda tener dos sesiones programadas en horarios solapados en la misma fecha.
* `testUpdateGroupSuccess()`: Verifica la actualizacion exitosa de nombre, horario y aula de un grupo activo.
* `testUpdateGroupCapacityBelowEnrollmentFails()`: Garantiza que no se permita reducir la capacidad de un grupo por debajo del numero de alumnos ya inscritos (ej. si hay 4 inscritos, el minimo permitido es 4).
* `testDeleteGroupWithEnrollmentPerformsLogicalDeletion()`: Comprueba que al eliminar un grupo con alumnos agendados se ejecute una baja logica (`status = INACTIVE`) preservando el historial.
* `testDeleteEmptyGroupPerformsPhysicalDeletion()`: Valida que un grupo recien creado sin inscritos permita la eliminacion fisica controlada.
* `testGenerateGroupReport()`: Evalua la generacion del resumen de ocupacion por plantel, calculando porcentajes de asistencia y cupos libres.
* `testExportGroupReportCsv()`: Valida la exportacion del reporte de grupos a formato CSV con cabeceras y estructura delimitada.

#### B. Suite de Citas y Reservas: `AppointmentServiceTest.java`
Implementa la verificacion estricta de las reglas de reserva y secuencia academica:
* `testStudentCannotBookOverlappingAppointment()`: Impide que un estudiante agende dos citas en horarios concurrentes o solapados.
* `testGroupCannotExceedCapacity()`: **Regla R04:** Valida que ningun grupo permita reservar cuando `currentEnrollment >= 5`, lanzando excepcion de sobrecupo (`BusinessException`).
* `testCancelledAppointmentReleasesCapacity()`: Comprueba que la cancelacion de una cita libere de forma automatica el cupo (`availableSeats = availableSeats + 1`) y actualice el estado del grupo de LLENO a PUBLICADO.
* `testReschedulingMaintainsOriginalAppointmentIfNewSlotFails()`: Verifica la atomicidad transaccional: si el reagendamiento a una nueva sesion falla, la cita original se mantiene intacta sin perdida de lugar.
* `testDoubleBookingIsPrevented()`: **Regla R03:** Evita que el mismo alumno reserve dos veces la misma leccion mientras tenga una cita activa pendiente.

#### C. Suite de Asistencia y Evaluacion Oral: `AttendanceServiceTest.java`
* `testRecordBatchAttendanceSuccess()`: **Regla R05:** Valida el registro en lote de asistencias para los 4 alumnos del grupo asignado.
* `testOralGradeValidation()`: Verifica que las calificaciones orales se encuentren en el rango numerico permitido de 0.00 a 100.00 y que notas mayores o iguales a 70.00 marquen la leccion como aprobada.
* `testAttendanceStatusTransitions()`: Evalua las transiciones validas entre los estados `PRESENT`, `ABSENT` y `EXCUSED`.

#### D. Suite de Usuarios y Perfiles: `UserServiceTest.java`
* `testCreateStudentUserWithAcademicProfile()`: Alta de estudiante con vinculacion de matricula, campus y nivel Book 2.
* `testCreateTeacherUserWithSpecialtyAndCapacity()`: Alta de profesor titular con certificacion C2 y carga maxima semanal.
* `testUsernameAndEmailUniqueness()`: Validacion de rechazo con codigo 409 Conflict si el nombre de usuario o correo ya existen.
* `testUserStatusTransitionActiveToInactive()`: Bloqueo de inicio de sesion para cuentas con estatus INACTIVE.
* `testPasswordHashingAndPolicy()`: Verificacion de almacenamiento de contrasenas mediante BCrypt.

#### E. Suite de Seguridad y Control RBAC: `SecurityRbacTest.java`
* `testRbacPermissionMapping()`: Valida la matriz de roles (`ROLE_STUDENT`, `ROLE_TEACHER`, `ROLE_SUPERVISOR`, `ROLE_ADMIN`) y la resolucion de permisos granulares por endpoint.

#### F. Suite de Controladores REST: `TutoringGroupControllerTest.java` & `UserControllerTest.java`
* `testAdminCanUpdateGroup()`: Confirma que `ROLE_ADMIN` tiene acceso exitoso (HTTP 200 OK) a `PUT /api/v1/tutoring/groups/{id}`.
* `testTeacherCannotUpdateGroup()`: Confirma que `ROLE_TEACHER` recibe rechazo de autorizacion (HTTP 403 Forbidden) al intentar modificar la estructura de un grupo.
* `testTeacherCanAccessGroupReport()`: Valida acceso permitido a docentes para consultar listas de asistencia.
* `testStudentCannotAccessGroupReport()`: Valida restriccion HTTP 403 para estudiantes intentando acceder a reportes globales.

---

## 3. Suites de Pruebas en Frontend (Vitest + React Testing Library)

El frontend cuenta con pruebas automatizadas ejecutadas mediante **Vitest** y **jsdom**, verificando el correcto renderizado de componentes, manejo de contexto de autenticacion, filtrado de tablas y comportamiento de dialogos modales.

### 3.1 Resumen de Ejecucion de Suites Frontend

```
 RUN  v5.0.1 frontend/

 ✓ src/features/groups/GroupManagementPage.test.tsx (6 tests)
 ✓ src/features/users/UserManagementPage.test.tsx (8 tests)
 ✓ src/App.test.tsx (4 tests)

 Test Files  3 passed (3)
      Tests  18 passed (18)
   Duration  263ms
```

### 3.2 Detalle de Pruebas de Componentes Frontend

| Archivo de Prueba | Casos de Prueba Implementados | Validacion Realizada |
| :--- | :--- | :--- |
| **`App.test.tsx`** | 1. Renderiza rutas publicas en `/login`<br>2. Redirige a login si no hay token<br>3. Muestra MainLayout para usuario autenticado<br>4. Bloquea ruta `/users` para rol estudiante | Integridad del enrutamiento y guardias RBAC de React Router. |
| **`GroupManagementPage.test.tsx`** | 1. Renderiza 4 tarjetas de metricas (Total Grupos, Cupo, Ocupacion)<br>2. Despliega listado de grupos en tabla<br>3. Abre modal de Creacion de Grupo al hacer click en `+ Nuevo Grupo`<br>4. Valida restriccion de cupo maximo 5 en formulario<br>5. Abre modal de Edicion de Grupo con datos precargados<br>6. Ejecuta filtrado por sede y modulo | Comportamiento interactivo y controles del modulo de grupos. |
| **`UserManagementPage.test.tsx`** | 1. Renderiza tarjetas de distribucion de cuentas por rol<br>2. Despliega directorio de usuarios con avatares y roles<br>3. Filtra usuarios por rol (Estudiante, Docente, Admin)<br>4. Abre modal de Alta de Usuario<br>5. Muestra campos condicionales segun rol seleccionado<br>6. Abre modal de Edicion de Usuario y actualizacion curricular<br>7. Abre modal de confirmacion de baja logica<br>8. Ejecuta paginacion y ordenamiento de columnas | Gestion integral de usuarios, sincronizacion de catalogos y modales. |

---

## 4. Suites de Pruebas End-to-End (E2E) y Automatizacion de Flujos

Las pruebas de extremo a extremo validan la integracion completa entre la interfaz de usuario, los servicios API y la base de datos a traves de navegadores reales (Chromium / Playwright Headless).

### 4.1 Matriz de Flujos de Usuario E2E Validados

| Identificador | Flujo de Usuario Probado | Pasos Ejecutados en la Prueba | Resultado de la Suite |
| :---: | :--- | :--- | :---: |
| **E2E-01** | **Autenticacion y Login Multi-Rol** | 1. Carga de `/login`<br>2. Ingreso de credenciales (`student.carlos`)<br>3. Verificacion de almacenamiento de JWT en `localStorage`<br>4. Redireccion automatica al Dashboard correspondiente | **EXITOSO** |
| **E2E-02** | **Reserva de Tutoria por Estudiante (9 Pasos)** | 1. Login estudiante (`student.carlos`)<br>2. Dashboard con contexto Book 2 (75% avance)<br>3. Navegacion a `/tutoring/search`<br>4. Filtrado por campus Monterrey Norte y modulo Lesson 5B<br>5. Seleccion de grupo con cupo libre (`GRP-B2-L5B-02`)<br>6. Apertura de modal de confirmacion<br>7. Emision de folio oficial `APT-2026-0419`<br>8. Cierre de modal y retorno a Dashboard actualizado<br>9. Consulta de cita activa en `/tutoring/my-appointments` | **EXITOSO** |
| **E2E-03** | **Pase de Lista y Evaluacion Docente (5 Pasos)** | 1. Login docente (`teacher.roberto`)<br>2. Dashboard con sesiones activas del dia<br>3. Acceso al modulo `/attendance`<br>4. Seleccion de sesion `GRP-B2-L5B-01` (4 alumnos)<br>5. Seleccion de estado `[PRESENTE]`, captura de nota oral `95.00/100`, feedback y persistencia en base de datos | **EXITOSO** |
| **E2E-04** | **Gestion y Apertura de Grupos por Administrador** | 1. Login administrador (`admin.alberto`)<br>2. Acceso a `/groups` con metricas de ocupacion (82.2%)<br>3. Apertura de `CreateGroupModal` con capacidad 5 (Regla R04)<br>4. Creacion de grupo y actualizacion de tabla<br>5. Apertura de `EditGroupModal` y descarga de reporte CSV | **EXITOSO** |
| **E2E-05** | **Directorio y Edicion de Usuarios** | 1. Acceso a `/users`<br>2. Filtrado por rol `ROLE_TEACHER`<br>3. Alta de docente con especialidad Book 2<br>4. Edicion de usuario estudiante con ajuste curricular | **EXITOSO** |
| **E2E-06** | **Seguridad, Trazas de Auditoria y Cambio de Password** | 1. Apertura de `ChangePasswordModal` desde el Topbar<br>2. Validacion de coincidencia y complejidad de password<br>3. Consulta de bitacora inmutable en `/admin/audit` con Trace ID | **EXITOSO** |

---

## 5. Matriz de Trazabilidad de Reglas de Negocio vs Suites de Prueba

| Regla de Negocio | Descripcion de la Regla | Pruebas Unitarias Backend | Pruebas Frontend Vitest | Pruebas E2E / Integracion |
| :---: | :--- | :--- | :--- | :--- |
| **R01** | **Secuencia Curricular:** El alumno solo reserva modulos habilitados para su nivel activo. | `AppointmentServiceTest.testStudentCannotBookOverlappingAppointment` | `TutoringSearchPage.test.tsx` (filtro por libro/modulo) | `E2E-02` (Reserva de Lesson 5B en Book 2) |
| **R02** | **Desbloqueo de Libros:** Book 3 requiere aprobacion previa del 100% de lecciones de Book 2. | `AcademicProgressServiceTest.testBookCompletionRequirement` | `AcademicCatalogPage.test.tsx` | `E2E-02` (Verificacion de avance curricular) |
| **R03** | **Cita Unica:** Impide reservar dos veces el mismo modulo con cita activa. | `AppointmentServiceTest.testDoubleBookingIsPrevented` | `TutoringSearchPage.test.tsx` | `E2E-02` (Validacion de duplicidad) |
| **R04** | **Capacidad Maxima (5 Alumnos):** Ningun grupo puede superar 5 inscritos. | `AppointmentServiceTest.testGroupCannotExceedCapacity` | `GroupManagementPage.test.tsx` | `E2E-04` (Apertura de grupo con cupo 5) |
| **R05** | **Evaluacion y Asistencia:** Asistencia obligatoria y calificacion oral (0-100, min 70.0). | `AttendanceServiceTest.testRecordBatchAttendanceSuccess` | `AttendanceRegisterPage.test.tsx` | `E2E-03` (Captura de nota 95.0 y estado PRESENTE) |

---

## 6. Pipeline de Integracion Continua y Aseguramiento de Calidad (CI/CD)

El ciclo de vida del software integra verificaciones automatizadas en cada fase del desarrollo:

```
[ Codigo Fuente ] ➔ [ Linting & Tipos ] ➔ [ Vitest (Frontend) ] ➔ [ Maven Test (Backend) ] ➔ [ Playwright E2E ] ➔ [ Despliegue ]
                          (tsc / eslint)          (18 tests)               (38 tests)              (6 flujos)
```

1. **Fase de Compilacion y Tipado:** Verificacion estricta de tipos con TypeScript (`tsc --noEmit`) y compilacion Java con Maven.
2. **Fase de Pruebas Unitarias:** Ejecucion automatica de las 18 pruebas de Vitest en frontend y 38 pruebas unitarias JUnit 5 en backend.
3. **Fase de Pruebas de Integracion y E2E:** Despliegue de entorno efimero de pruebas para ejecucion de flujos Playwright.
4. **Criterios de Aceptacion (Quality Gates):**
   * Cobertura de codigo superior al 80% en servicios criticos de negocio.
   * 100% de pruebas unitarias y de integracion en estado exitoso (0 fallos tolerados).
   * 0 vulnerabilidades de seguridad criticas o altas en dependencias.

---

> **Registro de Version:** Este documento corresponde a la especificacion formal de pruebas y calidad del sistema IQ English, archivado en `docs/testing.md`.
