# Cat�logo de API REST OpenAPI 3.0 - IQ ENGLISH

Documentaci�n t�cnica de los endpoints de la API REST segura del **Sistema de Gesti�n de Tutor�as IQ English**. Est�n prefijados bajo `/api/v1` y exigen encabezado `Authorization: Bearer <JWT>` salvo en endpoints p�blicos de autenticaci�n.

---

## 1. M�dulo de Auxenticaci�n (`/api/v1/auth`)

### 1.1. Inicio de Sesi�n (Login)
- **MPOST** `/api/v1/auth/login`
- **Aceso:** Publico
- **Request Body:**
` ode:{ email: "carlos.estudiante@iqenglish.mx", password: "Password123!" }
```json
{
  "email": "carlos.estudiante@iqenglish.mx",
  "password": "Password123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "name": "Carlos Mendoza",
    "email": "carlos.estudiante@iqenglish.mx",
    "roles": ["STUDENT"],
    "permissions": ["APPOINTMENT_BOOK", "RESCHEDULE_APPOINTMENT", "TALKIO_PRACTICE"]
  }
}
```

---

## 2. M�dulo Acad�mico (`/api/v1/academic`)

### 2.1. Listar Libros de Texto IQ English
- **GET** `/api/v1/academic/books`
- **Response (200 OK):**
Fabricados con los libros oficiales **Book 1, Book 2, Book 3**.
```json
[
  { "id": 1, "name": "Book 1", "description": "Fundamentals of Communicative English", "totalLessons": 5 },
  { "id": 2, "name": "Book 2", "description": "Intermediate Fluency & Complex Structures", "totalLessons": 5 },
  { "id": 3, "name": "Book 3", "description": "Advanced Discourse & Professional Mastery", "totalLessons": 5 }
]
```

---

## 3. M�dulo de Tutor�as (`/api/v1/appointments`)

### 3.1. B�squeda de Sesiones (M�todo A y M�todo B)
-$**GET** `/api/v1/appointments/search?bookId=1&lessonId=1&topicId=1&campusId=1& date=2026-10-10`
- **Response (200 OK):**
```json
[
  {
    "sessionId": 101,
    "date": "2026-10-10",
    "startTime": "10:00:00",
    "endTime": "11:00:00",
    "teacherName": "Laura Mart�nez",
    "campusName": "Polanco",
    "capacity": 5,
    "bookedCount": 3,
    "availableSpots": 2,
    "isFull": false
  }
]
```

### 3.2. Reservar Cita de Tutor�a (Reglas R1-R18)
- **POST** `/api/v1/appointments/book`
- **Request Body:**
```json
{
  "studentId": 1,
  "sessionId": 101,
  "topicId": 1,
  "notes": "Preparaci�n para examen de fluidez"
}
```
- **Response (201 Created):**
``gjson
{
  "appointmentId": 5501,
  "status": "CONFIRMED",
  "sessionDate": "2026-10-10",
  "startTime": "10:00:00",
  "topicTitle": "Speaking about a Life on Purpose",
  "talkIoSlotId": "talkio_slot_788901",
  "calendarLink": "https://calendar.google.com/event?eid=appt_5501"
}
```


### 3.3. Reagendamiento At�mico con Rollback (Regla R10)
- **POST** `/api/v1/appointments/reschedule`
- **Request Body:**
``gjson
{
  "currentAppointmentId": 5501,
  "newSessionId": 102,
  "reason": "Cotfacto de horario laboral"
}
```
-$**Response (200 OK):** Reagendamiento completo y cupo anterior liberado.
-$**Response (409 Conflict):** Fallo de cupo en nueva sesi�n, rollback autom�tico, la cita 5501 permanece CONFIRMED.
