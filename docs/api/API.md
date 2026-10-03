# ESPECIFICACION TECNICA DE LA API REST - IQ ENGLISH TUTORING SYSTEM

La API REST de IQ English Tutoring Management System constituye la plataforma central de servicios backend para la gestion academica de tutorias de ingles.
Su proposito primordial es articular de manera sincronica, segura y altamente disponible los flujos de programacion curricular, reservas y control escolar.
El alcance de esta interfaz incluye la gestion integral de programas academicos, libros oficiales, niveles formativos, modulos y unidades tematicas de aprendizaje.
Asimismo, administra la estructura fisica y virtual de la institucion mediante el control de planteles, modalidades presenciales y remotas de ensenanza.
Permite la calendarizacion precisa de grupos de tutoria y sesiones individuales o colectivas con bloqueo concurrente de capacidades maximas de alumnos.
Garantiza la asignacion docente eficiente, previniendo solapamientos de horarios y conflictos de agenda entre instructores y salones de clase.
Proporciona a los estudiantes un ecosistema integral de autogestion para busqueda de horarios, reservaciones y cancelaciones con validaciones rigurosas.
Incorpora el mecanismo de reagendamiento atomico bajo la regla R10, asegurando la liberacion y reserva simultanea de cupos sin riesgo de perdida de cupo.
Facilita el pase de lista y evaluacion continua del avance pedagogico mediante el registro docente de asistencia con estados formalizados.
Integra capacidades avanzadas de practica oral autonoma mediante el modulo TalkIO potenciado por inteligencia artificial para analisis de pronunciacion.
Implementa un modulo exhaustivo de administracion de usuarios, soporte de perfiles diferenciados y control de ciclo de vida de cuentas institucionales.
Asegura el principio de minimo privilegio mediante un modelo estricto de control de acceso basado en roles y permisos individuales del sistema.
Protege la continuidad operativa aplicando salvaguardas que impiden la desactivacion, eliminacion o degradacion del ultimo administrador activo del padron.
Brinda trazabilidad forense integral mediante el registro inmutable de auditoria para cada operacion administrativa, transaccional o de acceso.
Provee mecanismos automatizados de reportes estadisticos en tiempo real sobre ocupacion, asistencia, distribucion de roles y retencion academica.
Facilita la interoperabilidad y exportacion masiva de datos mediante descargas normalizadas en formato CSV compatibles con el estandar RFC 4180.
La comunicacion cliente servidor se efectua exclusivamente a traves del protocolo HTTPS utilizando representaciones estructuradas en formato JSON.
La autenticacion se fundamenta en estandares abiertos de la industria mediante tokens JWT firmados digitalmente bajo algoritmos criptograficos seguros.
Las operaciones HTTP validas en esta API corresponden a los verbos semanticos estandar GET, POST, PUT, PATCH, DELETE y OPTIONS segun corresponda.
Cada invocacion retorna codigos de estado HTTP estandarizados acompanados de un payload uniforme con indicadores de exito, mensaje y carga util.

---

## CONVENCIONES GLOBALES Y PROTOCOLO DE COMUNICACION

### Formato de Direccionamiento Base
- URL Base de Desarrollo Local: `http://localhost:8080/api/v1`
- URL Base de Produccion: `https://api.iqenglish.mx/api/v1`
- Protocolo: HTTP/1.1 y HTTP/2 sobre TLS 1.3
- Formato de intercambio de datos: `application/json; charset=UTF-8`
- Formato de intercambio de exportaciones: `text/csv; charset=UTF-8`

### Encabezados Estandar Requeridos
- `Content-Type: application/json` (Requerido en peticiones con cuerpo POST, PUT, PATCH)
- `Accept: application/json`
- `Authorization: Bearer <token_jwt>` (Requerido para todo endpoint protegido por RBAC)

### Estructura Estandar de Respuesta Exitosa (`ApiResponse<T>`)
```json
{
  "success": true,
  "message": "Operacion completada exitosamente.",
  "data": { }
}
```

### Estructura Estandar de Respuesta de Error (`ErrorResponse`)
```json
{
  "status": 400,
  "code": "INVALID_INPUT",
  "message": "Descripcion detallada del error de validacion o regla de negocio.",
  "path": "/api/v1/resource",
  "timestamp": "2026-09-25T18:00:00Z",
  "traceId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```

---

## 1. ENDPOINTS DE AUTENTICACION Y CONTEXTO DE USUARIO (/api/v1/auth)
Tag Swagger: `Authentication & User Context`
Descripcion: Servicios de inicio de sesion, emision de credenciales JWT e inspeccion del contexto del usuario autenticado.

### 1.1 Iniciar Sesion y Obtener Token JWT
- **Metodo HTTP**: `POST`
- **Ruta**: `/api/v1/auth/login`
- **Autorizacion**: Acceso publico (`permitAll`)
- **Descripcion**: Autentica credenciales de usuario (username o email) y contrasena. Retorna token Bearer JWT con vigencia de 24 horas junto a los roles y perfil especifico.
- **Cuerpo de Peticion (JSON)**:
```json
{
  "username": "student.carlos",
  "password": "Password123!"
}
```
- **Respuestas HTTP**:
  - `200 OK`: Autenticacion exitosa.
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdHVkZW50LmNhcmxvcyIsImlhdCI6MTY5NTY0ODAwMH0...",
    "type": "Bearer",
    "userId": 1,
    "username": "student.carlos",
    "email": "carlos.estudiante@iqenglish.mx",
    "fullName": "Carlos Mendoza",
    "roles": ["ROLE_STUDENT"],
    "permissions": ["TUTORING_SEARCH", "TUTORING_BOOK", "TUTORING_CANCEL", "TUTORING_RESCHEDULE"],
    "expiresIn": 86400000,
    "profile": {
      "id": 1,
      "studentNumber": "STU-2026-00001",
      "campusName": "Plantel Tlaxcala",
      "currentBookTitle": "Book 1 - Beginner",
      "currentModuleTitle": "Lesson 1A - Greetings"
    }
  }
}
```
  - `400 BAD REQUEST`: Parametros invalidos o vacios.
  - `401 UNAUTHORIZED`: Credenciales incorrectas (`BAD_CREDENTIALS`).
  - `403 FORBIDDEN`: Cuenta inactiva o suspendida.

### 1.2 Consultar Perfil y Permisos del Usuario en Sesion
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/auth/me`
- **Autorizacion**: Requiere autenticacion (`isAuthenticated()`)
- **Descripcion**: Retorna la entidad de usuario completa correspondiente al token JWT suministrado en el encabezado Authorization.
- **Respuestas HTTP**:
  - `200 OK`: Perfil del usuario activo.
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {
    "id": 1,
    "username": "student.carlos",
    "email": "carlos.estudiante@iqenglish.mx",
    "firstName": "Carlos",
    "lastName": "Mendoza",
    "fullName": "Carlos Mendoza",
    "phone": "+52 246 123 4567",
    "status": "ACTIVE",
    "roles": ["ROLE_STUDENT"],
    "permissions": ["TUTORING_SEARCH", "TUTORING_BOOK", "TUTORING_CANCEL", "TUTORING_RESCHEDULE"],
    "createdAt": "2026-09-01T08:00:00"
  }
}
```
  - `401 UNAUTHORIZED`: Token no proporcionado o invalido.

---

## 2. ENDPOINTS DE CATALOGO CURRICULAR ACADEMICO (/api/v1)
Tag Swagger: `Academic Curriculum Catalog`
Descripcion: Consulta jerarquica de programas academicos, niveles, libros, modulos y temas oficiales del metodo IQ English.

### 2.1 Listar Programas Academicos
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/academic-programs`
- **Autorizacion**: Requiere `ACADEMIC_PROGRAM_READ` o roles `STUDENT`, `TEACHER`, `SUPERVISOR`, `ADMIN`
- **Descripcion**: Obtiene el catalogo de programas formativos activos con su arbol de niveles asociados.
- **Respuestas HTTP**:
  - `200 OK`: Lista de programas academicos.

### 2.2 Listar Niveles Academicos por Programa
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/academic-levels`
- **Parametros Query**: `programId` (Long, Opcional)
- **Autorizacion**: Requiere `ACADEMIC_PROGRAM_READ` o roles `STUDENT`, `TEACHER`, `SUPERVISOR`, `ADMIN`
- **Respuestas HTTP**:
  - `200 OK`: Lista de niveles estructurados en orden secuencial.

### 2.3 Listar Libros de Texto IQ English
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/books`
- **Parametros Query**: `levelId` (Long, Opcional)
- **Autorizacion**: Requiere `ACADEMIC_PROGRAM_READ` o roles `STUDENT`, `TEACHER`, `SUPERVISOR`, `ADMIN`
- **Descripcion**: Retorna los libros oficiales (Book 1, Book 2, Book 3) con sus modulos pedagogicos correspondientes.
- **Respuestas HTTP**:
  - `200 OK`: Lista de libros con detalles de modulos.

### 2.4 Listar Modulos Academicos
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/modules`
- **Parametros Query**: `bookId` (Long, Opcional)
- **Autorizacion**: Requiere `ACADEMIC_PROGRAM_READ` o roles `STUDENT`, `TEACHER`, `SUPERVISOR`, `ADMIN`
- **Respuestas HTTP**:
  - `200 OK`: Lista de lecciones y modulos academicos.

### 2.5 Obtener Detalle de un Modulo por ID
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/modules/{id}`
- **Parametros Path**: `id` (Long, Requerido)
- **Autorizacion**: Requiere `ACADEMIC_PROGRAM_READ` o roles `STUDENT`, `TEACHER`, `SUPERVISOR`, `ADMIN`
- **Respuestas HTTP**:
  - `200 OK`: Modulo con lista de temas y focos de gramatica, vocabulario y conversacion.
  - `404 NOT FOUND`: Modulo inexistente.

### 2.6 Listar Temas Academicos
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/topics`
- **Parametros Query**: `moduleId` (Long, Opcional)
- **Autorizacion**: Requiere `ACADEMIC_PROGRAM_READ` o roles `STUDENT`, `TEACHER`, `SUPERVISOR`, `ADMIN`
- **Respuestas HTTP**:
  - `200 OK`: Lista de temas pedagogicos.

---

## 3. ENDPOINTS DE PLANTELES Y SUCURSALES (/api/v1/campuses)
Tag Swagger: `Campuses`
Descripcion: Administracion y consulta de sedes fisicas y virtuales de IQ English.

### 3.1 Listar Todos los Planteles Activos
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/campuses`
- **Autorizacion**: Requiere autenticacion (`isAuthenticated()`)
- **Descripcion**: Retorna todas las sucursales activas con direccion, ciudad, estado y datos de contacto.
- **Respuestas HTTP**:
  - `200 OK`: Lista de planteles.

### 3.2 Consultar Plantel por ID
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/campuses/{id}`
- **Parametros Path**: `id` (Long, Requerido)
- **Autorizacion**: Requiere autenticacion (`isAuthenticated()`)
- **Respuestas HTTP**:
  - `200 OK`: Datos detallados del plantel solicitado.
  - `404 NOT FOUND`: Plantel no encontrado.

---

## 4. ENDPOINTS DE GESTION DE GRUPOS DE TUTORIA (/api/v1/tutoring/groups)

### 4.1 Filtrar Grupos de Tutoria
- **Metodo HTTP:** `GET`
- **Ruta:** `/api/v1/tutoring/groups`
- **Descripcion:** Consulta el listado de grupos de tutoria con filtros combinables por campus, modulo, docente, libro y estado.
- **Seguridad / RBAC:** Publico / Autenticado (`ROLE_ADMIN`, `ROLE_SUPERVISOR`, `ROLE_TEACHER`, `ROLE_STUDENT`)
- **Parametros de Consulta:**
  - `campusId` (Long, opcional): Filtrar por plantel.
  - `moduleId` (Long, opcional): Filtrar por modulo/leccion.
  - `teacherId` (Long, opcional): Filtrar por docente asignado.
  - `bookId` (Long, opcional): Filtrar por libro.
  - `status` (GroupStatus, opcional): `PUBLISHED`, `INACTIVE`, `CANCELLED`.
- **Respuesta Exitosa (`200 OK`):**
```json
{
  "success": true,
  "message": "Operacion completada exitosamente.",
  "data": [
    {
      "id": 1,
      "code": "TUT-B2-01",
      "name": "Tutoring Book 2 - Lesson 5B Speaking Practice",
      "campusId": 1,
      "campusName": "Campus Tlaxcala Centro",
      "teacherId": 1,
      "teacherName": "Ana Garcia",
      "bookId": 2,
      "bookNumber": 2,
      "bookTitle": "Book 2 Elementary",
      "moduleId": 8,
      "moduleCode": "MOD-05B",
      "moduleTitle": "Lesson 5B: Daily Routine",
      "capacity": 12,
      "currentEnrollment": 6,
      "availableSeats": 6,
      "full": false,
      "status": "PUBLISHED",
      "modality": "PRESENTIAL",
      "createdAt": "2026-09-20T10:00:00"
    }
  ]
}
```

### 4.2 Obtener Grupo por ID
- **Metodo HTTP:** `GET`
- **Ruta:** `/api/v1/tutoring/groups/{id}`
- **Descripcion:** Obtiene la ficha tecnica y configuracion completa de un grupo de tutoria por su ID primario.
- **Seguridad / RBAC:** Requiere autenticacion valida.
- **Respuesta Exitosa (`200 OK`):** Retorna el objeto `TutoringGroupDTO`.
- **Codigos de Error:** `404 Not Found` (si el grupo no existe).

### 4.3 Crear Nuevo Grupo de Tutoria
- **Metodo HTTP:** `POST`
- **Ruta:** `/api/v1/tutoring/groups`
- **Descripcion:** Crea y publica una nueva cohorte de tutoria. Valida la no colision horaria del docente asignado y la coherencia del modulo academico.
- **Seguridad / RBAC:** `hasAuthority('GROUP_CREATE') or hasRole('SUPERVISOR') or hasRole('ADMIN')`
- **Cuerpo de Peticion (`application/json`):**
```json
{
  "name": "Tutoring Book 2 - Lesson 5B Speaking",
  "campusId": 1,
  "teacherId": 1,
  "moduleId": 8,
  "capacity": 12,
  "modality": "PRESENTIAL",
  "initialSessionDate": "2026-09-30",
  "initialStartTime": "16:00",
  "durationMinutes": 60,
  "roomOrLink": "Aula 204"
}
```
- **Respuesta Exitosa (`201 Created`):** Retorna el `TutoringGroupDTO` creado y la sesion inicial generada.
- **Codigos de Error:** `400 Bad Request` (datos incompletos o capacidad <= 0), `409 Conflict` (docente con horario solapado).

### 4.4 Actualizar Grupo (Modificacion - Fase 10)
- **Metodo HTTP:** `PUT`
- **Ruta:** `/api/v1/tutoring/groups/{id}`
- **Descripcion:** Modifica los atributos de un grupo (nombre, plantel, docente, modulo, capacidad, modalidad, estado). Valida que la nueva capacidad no sea inferior al numero actual de estudiantes inscritos.
- **Seguridad / RBAC:** `hasAuthority('GROUP_UPDATE') or hasRole('SUPERVISOR') or hasRole('ADMIN')`
- **Cuerpo de Peticion (`application/json`):**
```json
{
  "name": "Tutoring Book 2 - Lesson 5B Extended",
  "campusId": 1,
  "teacherId": 1,
  "moduleId": 8,
  "capacity": 15,
  "modality": "PRESENTIAL",
  "status": "PUBLISHED"
}
```
- **Respuesta Exitosa (`200 OK`):** Retorna el `TutoringGroupDTO` actualizado.
- **Codigos de Error:** `404 Not Found` (grupo inexistente), `409 Conflict` (si capacity < currentEnrollment).

### 4.5 Duplicar Grupo Existente
- **Metodo HTTP:** `POST`
- **Ruta:** `/api/v1/tutoring/groups/{id}/duplicate`
- **Descripcion:** Duplica la configuracion curricular de un grupo existente generando un nuevo codigo e identificador independiente.
- **Seguridad / RBAC:** `hasAuthority('GROUP_CREATE') or hasRole('SUPERVISOR') or hasRole('ADMIN')`
- **Cuerpo de Peticion (`application/json`):**
```json
{
  "newName": "Tutoring Book 2 - Lesson 5B (Copia Sabatina)",
  "newTeacherId": 1,
  "newSessionDate": "2026-10-03",
  "newStartTime": "10:00",
  "newEndTime": "11:00"
}
```
- **Respuesta Exitosa (`201 Created`):** Retorna el nuevo `TutoringGroupDTO` duplicado.

### 4.6 Modificar Estado de Grupo
- **Metodo HTTP:** `PATCH`
- **Ruta:** `/api/v1/tutoring/groups/{id}/status?status={status}`
- **Descripcion:** Actualiza exclusivamente el estado operativo de un grupo (`PUBLISHED`, `INACTIVE`, `CANCELLED`).
- **Seguridad / RBAC:** `hasAuthority('GROUP_UPDATE') or hasRole('SUPERVISOR') or hasRole('ADMIN')`
- **Respuesta Exitosa (`200 OK`):** Retorna el grupo con el estado actualizado.

### 4.7 Eliminar o Cancelar Grupo (Fase 10)
- **Metodo HTTP:** `DELETE`
- **Ruta:** `/api/v1/tutoring/groups/{id}`
- **Descripcion:** Elimina el grupo si no cuenta con historial o ejecuta eliminacion logica (marcando estado CANCELLED y cancelando sesiones agendadas) si tiene registros historicos para salvaguardar la integridad referencial.
- **Seguridad / RBAC:** `hasAuthority('GROUP_DEACTIVATE') or hasAuthority('GROUP_DELETE') or hasRole('SUPERVISOR') or hasRole('ADMIN')`
- **Respuesta Exitosa (`200 OK`):**
```json
{
  "success": true,
  "message": "Group deleted or cancelled successfully",
  "data": null
}
```

### 4.8 Reporte Operativo de Grupos de Tutoria (Fase 10)
- **Metodo HTTP:** `GET`
- **Ruta:** `/api/v1/tutoring/groups/report`
- **Descripcion:** Genera el reporte operativo consolidado de grupos de tutoria, incluyendo metricas de ocupacion, cupos y balance por estado. ADMIN y SUPERVISOR consultan el padron general; TEACHER consulta estrictamente sus grupos asignados.
- **Seguridad / RBAC:** `hasAuthority('GROUP_READ') or hasRole('TEACHER') or hasRole('SUPERVISOR') or hasRole('ADMIN')`
- **Parametros de Consulta:** `campusId`, `moduleId`, `teacherId` (ignorado para rol TEACHER en favor de su propio ID), `bookId`, `status`.
- **Respuesta Exitosa (`200 OK`):**
```json
{
  "success": true,
  "message": "Operacion completada exitosamente.",
  "data": {
    "generatedAt": "2026-09-25T19:30:00",
    "generatedBy": "admin.alberto",
    "scope": "ALL_GROUPS",
    "totalGroups": 12,
    "totalCapacity": 144,
    "totalEnrolled": 98,
    "totalAvailableSeats": 46,
    "averageOccupancyPercentage": 68.05,
    "publishedCount": 10,
    "inactiveCount": 1,
    "cancelledCount": 1,
    "items": [
      {
        "groupId": 1,
        "code": "TUT-B2-01",
        "name": "Tutoring Book 2 - Lesson 5B",
        "campusName": "Campus Tlaxcala Centro",
        "teacherName": "Ana Garcia",
        "teacherEmail": "ana.garcia@iqenglish.mx",
        "bookTitle": "Book 2 Elementary",
        "bookNumber": 2,
        "moduleCode": "MOD-05B",
        "moduleTitle": "Lesson 5B: Daily Routine",
        "capacity": 12,
        "currentEnrollment": 8,
        "availableSeats": 4,
        "occupancyPercentage": 66.67,
        "status": "PUBLISHED",
        "modality": "PRESENTIAL",
        "sessionsCount": 4,
        "createdAt": "2026-09-20T10:00:00"
      }
    ]
  }
}
```

### 4.9 Exportar Reporte de Grupos a CSV (Fase 10)
- **Metodo HTTP:** `GET`
- **Ruta:** `/api/v1/tutoring/groups/export/csv`
- **Descripcion:** Descarga el reporte operativo y padron de grupos en formato estandar RFC 4180 CSV codificado en UTF-8.
- **Seguridad / RBAC:** `hasAuthority('GROUP_READ') or hasRole('TEACHER') or hasRole('SUPERVISOR') or hasRole('ADMIN')`
- **Respuesta Exitosa (`200 OK`):** Archivo binario con encabezado `Content-Type: text/csv; charset=UTF-8` y `Content-Disposition: attachment; filename=tutoring_groups_report.csv`.

## 5. ENDPOINTS DE SESIONES DE GRUPO Y DISPONIBILIDAD (/api/v1/tutoring/sessions)
Tag Swagger: `Tutoring Sessions & Availability`
Descripcion: Busqueda en tiempo real de horarios disponibles y administracion de sesiones individuales fechadas.

### 5.1 Buscar Sesiones Disponibles con Filtros
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/tutoring/sessions`
- **Parametros Query**:
  - `campusId` (Long, Opcional)
  - `bookId` (Long, Opcional)
  - `startDate` (LocalDate, Opcional: YYYY-MM-DD)
  - `endDate` (LocalDate, Opcional: YYYY-MM-DD)
  - `status` (String, Opcional: `SCHEDULED`, `COMPLETED`, `CANCELLED`)
  - `modality` (String, Opcional: `PRESENTIAL`, `ONLINE`)
- **Autorizacion**: Requiere `TUTORING_SEARCH` o roles `STUDENT`, `SUPERVISOR`, `ADMIN`
- **Respuestas HTTP**:
  - `200 OK`: Lista de sesiones disponibles con cupos libres y detalles tematicos.

### 5.2 Obtener Sesion por ID
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/tutoring/sessions/{id}`
- **Parametros Path**: `id` (Long, Requerido)
- **Autorizacion**: Requiere autenticacion (`isAuthenticated()`)
- **Respuestas HTTP**:
  - `200 OK`: Detalle de sesion con lista de participantes y estatus.

### 5.3 Crear Sesion Individual
- **Metodo HTTP**: `POST`
- **Ruta**: `/api/v1/tutoring/sessions`
- **Autorizacion**: Requiere `GROUP_CREATE` o roles `SUPERVISOR`, `ADMIN`
- **Respuestas HTTP**:
  - `200 OK`: Sesion programada registrada.

### 5.4 Cancelar Sesion de Tutoria
- **Metodo HTTP**: `POST`
- **Ruta**: `/api/v1/tutoring/sessions/{id}/cancel`
- **Parametros Path**: `id` (Long, Requerido)
- **Parametros Query**: `reason` (String, Requerido)
- **Autorizacion**: Requiere `SESSION_CANCEL` o roles `SUPERVISOR`, `ADMIN`
- **Respuestas HTTP**:
  - `200 OK`: Sesion cancelada y notificaciones generadas para los alumnos inscritos.

---

## 6. ENDPOINTS DE RESERVAS DE TUTORIAS (/api/v1/appointments)
Tag Swagger: `Tutoring Appointments`
Descripcion: Reservaciones estudiantiles, cancelaciones y reagendamiento atomico bajo regla de negocio R10.

### 6.1 Listar Mis Tutorias (Estudiante en Sesion)
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/appointments/my`
- **Autorizacion**: Requiere `TUTORING_READ` o rol `STUDENT`
- **Respuestas HTTP**:
  - `200 OK`: Lista de citas reservadas activas, pasadas y reagendadas del alumno.

### 6.2 Listar Citas por Alumno
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/appointments/student/{studentId}`
- **Parametros Path**: `studentId` (Long, Requerido)
- **Autorizacion**: Requiere `APPOINTMENT_READ` o roles `TEACHER`, `SUPERVISOR`, `ADMIN`
- **Respuestas HTTP**:
  - `200 OK`: Historial completo de reservaciones del estudiante indicado.

### 6.3 Listar Citas por Sesion de Grupo
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/appointments/session/{sessionId}`
- **Parametros Path**: `sessionId` (Long, Requerido)
- **Autorizacion**: Requiere `APPOINTMENT_READ` o roles `TEACHER`, `SUPERVISOR`, `ADMIN`
- **Respuestas HTTP**:
  - `200 OK`: Lista de alumnos matriculados en la sesion indicada.

### 6.4 Obtener Cita por ID
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/appointments/{id}`
- **Parametros Path**: `id` (Long, Requerido)
- **Autorizacion**: Requiere autenticacion (`isAuthenticated()`)
- **Respuestas HTTP**:
  - `200 OK`: Informacion detallada de la cita.

### 6.5 Reservar Nueva Tutoria
- **Metodo HTTP**: `POST`
- **Ruta**: `/api/v1/appointments`
- **Autorizacion**: Requiere `TUTORING_BOOK` o roles `STUDENT`, `SUPERVISOR`, `ADMIN`
- **Cuerpo de Peticion (JSON)**:
```json
{
  "studentId": 1,
  "sessionId": 5
}
```
- **Respuestas HTTP**:
  - `200 OK`: Cita confirmada con numero de confirmacion unico.
  - `400 BAD REQUEST`: Regla R1 violada (solapamiento horario) o R12 (tema ya cursado).
  - `409 CONFLICT`: Regla R3 violada (capacidad maxima de 5 alumnos alcanzada).

### 6.6 Cancelar Tutoria Reservada
- **Metodo HTTP**: `POST`
- **Ruta**: `/api/v1/appointments/{id}/cancel`
- **Parametros Path**: `id` (Long, Requerido)
- **Cuerpo de Peticion (JSON)**:
```json
{
  "reason": "Compromiso laboral imprevisto"
}
```
- **Autorizacion**: Requiere `TUTORING_CANCEL` o roles `STUDENT`, `SUPERVISOR`, `ADMIN`
- **Respuestas HTTP**:
  - `200 OK`: Cita cancelada y cupo liberado en la sesion.

### 6.7 Reagendamiento Atomico de Tutoria (Regla R10)
- **Metodo HTTP**: `POST`
- **Ruta**: `/api/v1/appointments/{id}/reschedule`
- **Parametros Path**: `id` (Long, Requerido)
- **Cuerpo de Peticion (JSON)**:
```json
{
  "newSessionId": 8,
  "reason": "Cambio de turno laboral"
}
```
- **Autorizacion**: Requiere `TUTORING_RESCHEDULE` o roles `STUDENT`, `SUPERVISOR`, `ADMIN`
- **Descripcion**: Ejecuta transaccion atomica con rollback integral que libera la cita original, reserva el nuevo cupo y actualiza el puntero de reagendamiento sin riesgo de inconsistencia.
- **Respuestas HTTP**:
  - `200 OK`: Reagendamiento exitoso con nueva cita confirmada.
  - `409 CONFLICT`: Nueva sesion sin cupos disponibles.

---

## 7. ENDPOINTS DE REGISTRO Y GESTION DE ASISTENCIA (/api/v1/attendance)
Tag Swagger: `Attendance Management`
Descripcion: Registro docente de asistencia, evaluacion de participacion y consulta de historial.

### 7.1 Registrar Asistencia de Sesion
- **Metodo HTTP**: `POST`
- **Ruta**: `/api/v1/attendance`
- **Autorizacion**: Requiere `ATTENDANCE_CREATE` o roles `TEACHER`, `SUPERVISOR`, `ADMIN`
- **Cuerpo de Peticion (JSON)**:
```json
{
  "appointmentId": 12,
  "sessionId": 5,
  "studentId": 1,
  "status": "PRESENT",
  "notes": "Excelente fluidez y dominio del vocabulario de la leccion."
}
```
- **Respuestas HTTP**:
  - `200 OK`: Asistencia registrada y progreso academico actualizado si aplica.

### 7.2 Consultar Asistencia por Sesion de Grupo
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/attendance/session/{sessionId}`
- **Parametros Path**: `sessionId` (Long, Requerido)
- **Autorizacion**: Requiere `ATTENDANCE_READ` o roles `TEACHER`, `SUPERVISOR`, `ADMIN`
- **Respuestas HTTP**:
  - `200 OK`: Lista de registros de asistencia de la sesion.

### 7.3 Consultar Asistencia por Estudiante
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/attendance/student/{studentId}`
- **Parametros Path**: `studentId` (Long, Requerido)
- **Autorizacion**: Requiere `ATTENDANCE_READ` o roles `STUDENT`, `TEACHER`, `SUPERVISOR`, `ADMIN`
- **Respuestas HTTP**:
  - `200 OK`: Historial completo de asistencias, faltas y justificaciones del alumno.

---

## 8. ENDPOINTS DE PRACTICA ORAL CON IA TALKIO (/api/v1/talkio)
Tag Swagger: `TalkIO AI Oral Practice`
Descripcion: Interaccion simulada con avatares pedagogicos impulsados por IA y analisis fonetico de audio.

### 8.1 Ejecutar Sesion de Practica Oral
- **Metodo HTTP**: `POST`
- **Ruta**: `/api/v1/talkio/practice`
- **Autorizacion**: Requiere autenticacion (`isAuthenticated()`)
- **Cuerpo de Peticion (JSON)**:
```json
{
  "topicId": 1,
  "moduleCode": "MOD-B1-01",
  "promptText": "Introduce yourself and describe your daily routine in three full sentences.",
  "audioBase64": "UklGRi4AAABXQVZFZm10IBAAAAABAAEA..."
}
```
- **Respuestas HTTP**:
  - `200 OK`: Evaluacion con transcripcion, puntajes foneticos y retroalimentacion gramatical.
```json
{
  "success": true,
  "message": "Practice evaluated successfully",
  "data": {
    "sessionId": "talkio-session-88231",
    "studentName": "Carlos Mendoza",
    "moduleCode": "MOD-B1-01",
    "topicTitle": "Self Introduction and Daily Routines",
    "avatarName": "Emma - AI Tutor",
    "promptText": "Introduce yourself and describe your daily routine in three full sentences.",
    "feedbackText": "Great grammatical accuracy. Focus on the intonation of closed questions.",
    "pronunciationScore": 92,
    "grammarScore": 95,
    "vocabularyScore": 88
  }
}
```

---

## 9. ENDPOINTS DE AUDITORIA Y SEGURIDAD (/api/v1/audit)
Tag Swagger: `Audit & Compliance`
Descripcion: Inspeccion inmutable de eventos de seguridad, cambios de estado y transacciones administrativas.

### 9.1 Obtener Registros Recientes de Auditoria
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/audit/logs`
- **Autorizacion**: Requiere `AUDIT_READ` o rol `ADMIN`
- **Descripcion**: Retorna los ultimos 50 registros de auditoria con identificador de usuario, direccion IP, traza UUID y descripcion de la accion.
- **Respuestas HTTP**:
  - `200 OK`: Lista cronologica descendente de logs de auditoria.

---

## 10. ENDPOINTS DE NOTIFICACIONES DEL SISTEMA (/api/v1/notifications)
Tag Swagger: `Notifications`
Descripcion: Mensajeria y alertas operativas dirigidas a usuarios de la plataforma.

### 10.1 Listar Notificaciones del Usuario en Sesion
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/notifications`
- **Parametros Query**: `unreadOnly` (Boolean, Opcional, por defecto false)
- **Autorizacion**: Requiere `NOTIFICATION_READ` o autenticacion (`isAuthenticated()`)
- **Respuestas HTTP**:
  - `200 OK`: Lista de notificaciones recibidas.

### 10.2 Marcar Notificacion como Leida
- **Metodo HTTP**: `PATCH`
- **Ruta**: `/api/v1/notifications/{id}/read`
- **Parametros Path**: `id` (Long, Requerido)
- **Autorizacion**: Requiere autenticacion (`isAuthenticated()`)
- **Respuestas HTTP**:
  - `200 OK`: Notificacion actualizada a estado leido.

---

## 11. ENDPOINTS DE METRICAS Y REPORTES OPERATIVOS (/api/v1/reports)
Tag Swagger: `Reports & Analytics`
Descripcion: Dashboard analitico con resumenes de ocupacion de planteles, grupos activos y citas del dia.

### 11.1 Obtener Resumen General del Dashboard
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/reports/dashboard`
- **Autorizacion**: Requiere autenticacion (`isAuthenticated()`)
- **Descripcion**: Retorna un resumen contextualizado segun el rol del usuario conectado (citas proximas, tasa de ocupacion, grupos activos y perfil asociado).
- **Respuestas HTTP**:
  - `200 OK`: Metricas agregadas del dashboard.

---

## 12. ENDPOINTS DE GESTION DE USUARIOS Y RBAC (/api/v1/users) - FASE 9
Tag Swagger: `User Management`
Descripcion: Administracion completa del padron de usuarios, ciclo de vida, asignacion de roles, salvaguardas de seguridad y exportaciones.

### 12.1 Consultar Perfil Propio
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/users/me`
- **Autorizacion**: Requiere autenticacion (`isAuthenticated()`)
- **Respuestas HTTP**:
  - `200 OK`: Informacion del perfil del usuario en sesion.

### 12.2 Listar Usuarios con Paginacion y Filtros
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/users`
- **Parametros Query**:
  - `page` (Integer, Opcional, por defecto 0)
  - `size` (Integer, Opcional, por defecto 10)
  - `sort` (String, Opcional, por defecto "id,asc")
  - `search` (String, Opcional: coincidencia en username, nombre, apellido, email o telefono)
  - `role` (String, Opcional: ROLE_ADMIN, ROLE_SUPERVISOR, ROLE_TEACHER, ROLE_STUDENT)
  - `status` (String, Opcional: ACTIVE, INACTIVE, SUSPENDED)
- **Autorizacion**: Requiere `USER_READ` o roles `ADMIN`, `SUPERVISOR`
- **Respuestas HTTP**:
  - `200 OK`: Pagina de usuarios encapsulada en `PageResponse<UserDTO>`.
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {
    "content": [
      {
        "id": 1,
        "username": "admin.alberto",
        "email": "admin@iqenglish.mx",
        "firstName": "Alberto",
        "lastName": "Castillo",
        "fullName": "Alberto Castillo",
        "phone": "+52 246 111 2233",
        "status": "ACTIVE",
        "roles": ["ROLE_ADMIN"],
        "permissions": ["USER_CREATE", "USER_READ", "USER_UPDATE", "USER_DISABLE"],
        "createdAt": "2026-09-01T08:00:00",
        "updatedAt": "2026-09-25T16:00:00"
      }
    ],
    "pageNumber": 0,
    "pageSize": 10,
    "totalElements": 25,
    "totalPages": 3,
    "last": false
  }
}
```

### 12.3 Listar Todos los Usuarios sin Paginar
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/users/all`
- **Autorizacion**: Requiere `USER_READ` o roles `ADMIN`, `SUPERVISOR`
- **Respuestas HTTP**:
  - `200 OK`: Lista completa de usuarios.

### 12.4 Consultar Usuario por ID
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/users/{id}`
- **Parametros Path**: `id` (Long, Requerido)
- **Autorizacion**: Requiere `USER_READ` o roles `ADMIN`, `SUPERVISOR`
- **Respuestas HTTP**:
  - `200 OK`: Detalle completo del usuario.
  - `404 NOT FOUND`: Usuario no encontrado.

### 12.5 Crear Nuevo Usuario
- **Metodo HTTP**: `POST`
- **Ruta**: `/api/v1/users`
- **Autorizacion**: Requiere `USER_CREATE` o rol `ADMIN`
- **Cuerpo de Peticion (JSON)**:
```json
{
  "username": "teacher.valeria",
  "email": "valeria.morales@iqenglish.mx",
  "password": "SecurePassword123!",
  "firstName": "Valeria",
  "lastName": "Morales",
  "phone": "+52 246 555 1234",
  "role": "ROLE_TEACHER",
  "status": "ACTIVE",
  "campusId": 1,
  "specialty": "Business English & IELTS"
}
```
- **Respuestas HTTP**:
  - `200 OK`: Usuario y perfil auxiliar creados exitosamente.
  - `400 BAD REQUEST`: Formato invalido o contrasena menor a 6 caracteres.
  - `409 CONFLICT`: Nombre de usuario (`USERNAME_ALREADY_EXISTS`) o correo (`EMAIL_ALREADY_EXISTS`) duplicado.

### 12.6 Actualizar Perfil de Usuario
- **Metodo HTTP**: `PUT`
- **Ruta**: `/api/v1/users/{id}`
- **Parametros Path**: `id` (Long, Requerido)
- **Autorizacion**: Requiere `USER_UPDATE` o rol `ADMIN`
- **Cuerpo de Peticion (JSON)**:
```json
{
  "firstName": "Valeria Sofia",
  "lastName": "Morales Ruiz",
  "email": "valeria.morales@iqenglish.mx",
  "phone": "+52 246 555 9999",
  "status": "ACTIVE"
}
```
- **Respuestas HTTP**:
  - `200 OK`: Perfil actualizado.
  - `400 BAD REQUEST`: Intento de desactivar al unico administrador activo (`CANNOT_DISABLE_LAST_ADMIN`).

### 12.7 Actualizar Estado de Usuario (Activar / Desactivar)
- **Metodo HTTP**: `PATCH`
- **Ruta**: `/api/v1/users/{id}/status`
- **Parametros Path**: `id` (Long, Requerido)
- **Autorizacion**: Requiere `USER_UPDATE` o rol `ADMIN`
- **Cuerpo de Peticion (JSON)**:
```json
{
  "status": "INACTIVE"
}
```
- **Respuestas HTTP**:
  - `200 OK`: Estado modificado exitosamente.
  - `400 BAD REQUEST`: Violacion de salvaguarda de ultimo administrador activo.

### 12.8 Actualizar Roles de Usuario
- **Metodo HTTP**: `PATCH`
- **Ruta**: `/api/v1/users/{id}/role`
- **Parametros Path**: `id` (Long, Requerido)
- **Autorizacion**: Requiere `ROLE_MANAGE` o rol `ADMIN`
- **Cuerpo de Peticion (JSON)**:
```json
{
  "role": "ROLE_SUPERVISOR"
}
```
- **Respuestas HTTP**:
  - `200 OK`: Roles actualizados.
  - `400 BAD REQUEST`: Intento de remover el rol de administrador al unico administrador activo.

### 12.9 Desactivar / Soft-Delete de Cuenta de Usuario
- **Metodo HTTP**: `DELETE`
- **Ruta**: `/api/v1/users/{id}`
- **Parametros Path**: `id` (Long, Requerido)
- **Autorizacion**: Requiere `USER_DISABLE` o rol `ADMIN`
- **Descripcion**: Desactiva la cuenta estableciendo su estado en INACTIVE para preservar la integridad referencial historica de asistencias y tutorias.
- **Respuestas HTTP**:
  - `200 OK`: Cuenta desactivada exitosamente.
  - `400 BAD REQUEST`: Intento de auto-eliminacion (`CANNOT_DELETE_SELF`) o eliminacion del ultimo administrador (`CANNOT_DELETE_LAST_ADMIN`).

### 12.10 Cambiar Contrasena Propia (Autoservicio)
- **Metodo HTTP**: `POST`
- **Ruta**: `/api/v1/users/change-password`
- **Autorizacion**: Requiere autenticacion (`isAuthenticated()`)
- **Cuerpo de Peticion (JSON)**:
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewSecurePassword456!",
  "confirmPassword": "NewSecurePassword456!"
}
```
- **Respuestas HTTP**:
  - `200 OK`: Contrasena actualizada exitosamente.
  - `400 BAD REQUEST`: Contrasena actual incorrecta (`INVALID_CURRENT_PASSWORD`) o confirmacion no coincidente (`PASSWORDS_DO_NOT_MATCH`).

### 12.11 Restablecer Contrasena por Administrador
- **Metodo HTTP**: `POST`
- **Ruta**: `/api/v1/users/{id}/password-reset`
- **Parametros Path**: `id` (Long, Requerido)
- **Autorizacion**: Requiere `USER_UPDATE` o rol `ADMIN`
- **Cuerpo de Peticion (JSON)**:
```json
{
  "newPassword": "AdminAssignedPass789!"
}
```
- **Respuestas HTTP**:
  - `200 OK`: Contrasena restablecida por el administrador.

### 12.12 Obtener Reporte Estadistico de Usuarios
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/users/report`
- **Autorizacion**: Requiere `USER_READ` o roles `ADMIN`, `SUPERVISOR`
- **Respuestas HTTP**:
  - `200 OK`: Metricas de conteo total, activos, inactivos, distribucion por rol y registros de los ultimos 30 dias.
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {
    "totalUsers": 25,
    "activeUsers": 23,
    "inactiveUsers": 2,
    "suspendedUsers": 0,
    "roleDistribution": {
      "ADMIN": 2,
      "SUPERVISOR": 3,
      "TEACHER": 8,
      "STUDENT": 12
    },
    "statusDistribution": {
      "ACTIVE": 23,
      "INACTIVE": 2,
      "SUSPENDED": 0
    },
    "recentRegistrations30Days": 5
  }
}
```

### 12.13 Exportar Padron de Usuarios a CSV
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/users/export/csv`
- **Parametros Query**:
  - `search` (String, Opcional)
  - `role` (String, Opcional)
  - `status` (String, Opcional)
- **Autorizacion**: Requiere `USER_READ` o roles `ADMIN`, `SUPERVISOR`
- **Encabezados de Respuesta**:
  - `Content-Type: text/csv; charset=UTF-8`
  - `Content-Disposition: attachment; filename="iq_users_export.csv"`
- **Respuestas HTTP**:
  - `200 OK`: Archivo CSV codificado en UTF-8 conforme al estandar RFC 4180.

### 12.14 Consultar Historial de Auditoria de un Usuario
- **Metodo HTTP**: `GET`
- **Ruta**: `/api/v1/users/{id}/audit`
- **Parametros Path**: `id` (Long, Requerido)
- **Autorizacion**: Requiere `AUDIT_READ` o rol `ADMIN`
- **Respuestas HTTP**:
  - `200 OK`: Lista cronologica de acciones de auditoria realizadas sobre la cuenta del usuario.
