const fs = require('fs');
const path = require('path');

function makeReq(name, method, pathStr, bodyObj, authType) {
  const pathArr = pathStr.split('/').filter(Boolean);
  return {
    name,
    request: {
      auth: authType ? { type: authType } : undefined,
      method,
      header: bodyObj ? [{ key: 'Content-Type', value: 'application/json' }] : [],
      body: bodyObj ? { mode: 'raw', raw: JSON.stringify(bodyObj, null, 2) } : undefined,
      url: {
        raw: `http://localhost:8080/api/v1${pathStr}`,
        host: ['d{{baseUrl}}'],
        path: ['api', 'v1', ...pathArr]
      }
    }
  };
}

const coll = {
  info: {
    name: 'IQ English - Tutoring Management System API',
    _postman_id: 'iq-english-tutoring-api-v1',
    description: 'Coleccion de endpoints REST para el Sistema de Gestion de Tutorias IQ English.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:8080', type: 'string' },
    { key: 'jwtToken', value: '', type: 'string' }
  ],
  auth: {
    type: 'bearer',
    bearer: [{ key: 'token', value: '{{jwtToken}}', type: 'string' }]
  },
  item: [
    {
      name: '1. Autenticacion (Auth)',
      item: [
        makeReq('1.1 Login - Estudiante', 'POST', '/auth/login', { email: 'carlos.estudiante@iqenglish.mx', password: 'Password123!' }, 'noauth'),
        makeReq('1.2 Login - Docente', 'POST', '/auth/login', { email: 'laura.teacher@iqenglish.mx', password: 'Password123!' }, 'noauth'),
        makeReq('1.3 Login - Supervisor', 'POST', '/auth/login', { email: 'supervisor@iqenglish.mx', password: 'Password123!' }, 'noauth'),
        makeReq('1.4 Login - Administrador', 'POST', '/auth/login', { email: 'admin@iqenglish.mx', password: 'Password123!' }, 'noauth'),
        makeReq('1.5 Obtener Perfil Actual', 'GET', '/auth/me')
      ]
    },
    {
      name: '2. Catalogo Academico',
      item: [
        makeReq('2.1 Listar Programas', 'GET', '/academic/programs'),
        makeReq('2.2 Listar Niveles', 'GET', '/academic/levels'),
        makeReq('2.3 Listar Libros (Book 1, 2, 3)', 'GET', '/academic/books'),
        makeReq('2.4 Lecciones de Book 1', 'GET', '/academic/books/1/modules'),
        makeReq('2.5 Temas de Lesson 1', 'GET', '/academic/modules/1/topics'),
        makeReq('2.6 Progreso Academico del Alumno', 'GET', '/academic/progress/1')
      ]
    },
    {
      name: '3. Planteles',
      item: [
        makeReq('3.1 Listar Planteles', 'GET', '/campuses'),
        makeReq('3.2 Crear Nuevo Plantel', 'POST', '/campuses', { name: 'Plantel Coyoacan', code: 'COY', address: 'Av. Miguel Angel 450', city: 'CDMX', phone: '+52 55 5555 0000', email: 'coyoacan@iqenglish.mx', active: true })
      ]
    },
    {
      name: '4. Grupos y Horarios',
      item: [
        makeReq('4.1 Listar Grupos', 'GET', '/groups'),
        makeReq('4.2 Crear Grupo Recurrente', 'POST', '/groups', { name: 'Grupo B1 Matutino', campusId: 1, teacherId: 1, bookId: 1, dayOfWeek: 'SATURDAY', startTime: '09:00:00', endTime: '10:00:00', capacity: 5, startDate: '2026-10-01', weeksCount: 12 }),
        makeReq('4.3 Actualizar Capacidad', 'PUT', '/groups/1/capacity', { capacity: 6 })
      ]
    },
    {
      name: '5. Reservas de Tutorias (Appointments)',
      item: [
        makeReq('5.1 Busqueda por Tema (Metodo A', 'GET', '/appointments/search?bookId=1&lessonId=1&topicId=1&campusId=1'),
        makeReq('5.2 Busqueda por Horario (Metodo B', 'GET', '/appointments/search?campusId=1&date=2026-10-10&startTime=10:00:00'),
        makeReq('5.3 Reservar Cita (Reglas R1-R18)', 'POST', '/appointments/book', { studentId: 1, sessionId: 1, topicId: 1, notes: 'Practica del Tema 1' }),
        makeReq('5.4 Reagendar con Rollback (R10)', 'POST', '/appointments/reschedule', { currentAppointmentId: 1, newSessionId: 2, reason: 'Conflicto de horario' }),
        makeReq('5.5 Cancelar Cita y Liberar Cupo (R8)', 'POST', '/appointments/1/cancel', { reason: 'Enfermedad' }),
        makeReq('5.6 Listar Mis Citas', 'GET', '/appointments/my-bookings')
      ]
    },
    {
      name: '6. Asistencia y Evaluacion',
      item: [
        makeReq('6.1 Registrar Pase de Lista', 'POST', '/attendance/register', { sessionId: 1, records: [{ studentId: 1, appointmentId: 1, status: 'PRESENT', score: 95.0, teacherFeedback: 'Excelente fluidez' }] }),
        makeReq('6.2 Asistencias de una Sesion', 'GET', '/attendance/session/1'),
        makeReq('6.3 Historial de Asistencia del Alumno', 'GET', '/attendance/student/1')
      ]
    },
    {
      name: '7. Practica Oral TalkIO',
      item: [
        makeReq('7.1 Iniciar Sesion TalkIO', 'POST', '/talkik/sessions', { studentId: 1, topicId: 1 }),
        makeReq('7.2 Enviar Respuesta y Calificar', 'POST', '/talkik/sessions/talkio_sess_101/submit', { userAudioTranscript: 'My goal in life is to achieve personal fulfillment.', expectedGrammarPattern: 'Infinitive of purpose' })
      ]
    },
    {
      name: '8. Auditoria y Reportes',
      item: [
        makeReq('8.1 Consultar Logs de Auditoria', 'GET', '/audit/logs?page=0&size=50'),
        makeReq('8.2 Reporte de Tasa de Asistencia', 'GET', '/reports/attendance-rate?campusId=1'),
        makeReq('8.3 Reporte de Ocupacion de Planteles', 'GET', '/reports/campus-occupancy')
      ]
    }
  ]
};

fs.writeFileSync('postman/IQ_English_Tutoring_API.postman_collection.json', JSON.stringify(coll, null, 2), 'utf8');
console.log('Postman Collection built successfully.');
