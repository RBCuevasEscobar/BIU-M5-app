import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DashboardSummary, StudentModuleItem } from '../../types';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, BookOpen, Users, CheckCircle, AlertTriangle, Sparkles, CalendarCheck, TrendingUp, ArrowRight, Award, CheckCircle2, Clock3 } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, studentProfile, teacherProfile, hasRole } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const loadSummary = async () => {
    try {
      const data = await api.get<DashboardSummary>('/reports/dashboard');
      setSummary(data);
    } catch (err) {
      console.error('Failed to load dashboard summary', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [user]);

  if (isLoading) return <LoadingSpinner message="Cargando tu panel de control..." />;

  const isStudent = hasRole('STUDENT');
  const isTeacher = hasRole('TEACHER');
  const isSupervisor = hasRole('SUPERVISOR');
  const isAdmin = hasRole('ADMIN');

  // Academic progress calculations (Requirement 2)
  const attendanceCount = summary?.currentModuleAttendanceCount || 0;
  const totalRequired = summary?.currentModuleTotalRequired || 4;
  const progressPercent = Math.min(100, Math.round((attendanceCount / totalRequired) * 100));

  // Next confirmed appointment or suggested tutoring (Requirement 1)
  const confirmedAppointments = summary?.upcomingAppointments || [];
  const nextConfirmedAppt = confirmedAppointments.length > 0 ? confirmedAppointments[0] : null;
  const suggested = summary?.suggestedTutoring;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="iq-texture-bg" style={{ borderRadius: 'var(--radius-lg)', padding: '28px 32px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-md)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--iq-secondary)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            <Sparkles size={16} />
            <span>Portal Academico IQ English</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px' }}>Hola, {user?.firstName || 'Usuario'}!</h1>
          <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '4px', maxWidth: '600px' }}>
            {isStudent && 'Continua desarrollando tu fluidez comunicativa con tus sesiones de tutoria personalizada y practica de IA.'}
            {isTeacher && 'Bienvenido a tu panel docente. Revisa tus sesiones programadas y gestiona la asistencia de tus alumnos.'}
            {(isSupervisor || isAdmin) && 'Panel de control operativo: supervision de planteles, grupos activos, docentes y cupos.'}
          </p>
        </div>
        {isStudent && (
          <Button onClick={() => navigate('/tutoring/search')} variant="secondary" size="lg" icon={<CalendarCheck size={18} />}>
            Buscar Tutoria
          </Button>
        )}
      </div>

      {isStudent && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Academic Context & Updated Progress Bar (Requirement 2) */}
            <Card title="Tu Contexto Academico Actual" subtitle="Basado en tu avance en el programa de ingles natural">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', backgroundColor: 'var(--iq-primary-light)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'var(--iq-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--iq-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {studentProfile?.currentLevelName || 'Level 2 - Intermedio'}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--iq-primary)' }}>
                      {studentProfile?.currentBookTitle || 'Book 2: Interactive Fluency'}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      Modulo Actual: <strong>{studentProfile?.currentModuleTitle || 'Lesson 5B: Requests, Excuses & Apologies'}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Progreso en Modulo Actual:</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--iq-primary)' }}>
                    {attendanceCount} de {totalRequired} tutorias ({progressPercent}%)
                  </span>
                </div>

                <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--iq-secondary)', transition: 'width 0.4s ease' }} />
                </div>

                {summary?.currentModuleGrade != null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <Award size={15} color="var(--iq-secondary-hover)" />
                    <span>Ultima Calificacion Registrada: <strong>{summary.currentModuleGrade.toFixed(2)} / 100.00</strong></span>
                  </div>
                )}
              </div>
            </Card>

            {/* Next Confirmed Appointment or Suggested Tutoring (Requirement 1) */}
            <Card
              title={nextConfirmedAppt ? "Proxima Tutoria Confirmada" : "Siguiente Tutoria Sugerida"}
              subtitle={nextConfirmedAppt ? "Tu siguiente cita programada en plantel" : "No tienes citas confirmadas activas"}
            >
              {nextConfirmedAppt ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Badge status={nextConfirmedAppt.status} />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Folio: {nextConfirmedAppt.appointmentNumber}</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--iq-primary)' }}>{nextConfirmedAppt.session.moduleTitle}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Tema: {nextConfirmedAppt.session.topicTitle || 'Practica comunicativa y fluidez'}</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={15} color="var(--iq-primary)" /><span>{nextConfirmedAppt.session.sessionDate}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={15} color="var(--iq-primary)" /><span>{nextConfirmedAppt.session.startTime} hrs</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={15} color="var(--iq-primary)" /><span>Docente: {nextConfirmedAppt.session.teacherName}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={15} color="var(--iq-primary)" /><span>{nextConfirmedAppt.session.campusName}</span></div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => navigate('/tutoring/my-appointments')}>
                    Ver Mis Tutorias / Reprogramar
                  </Button>
                </div>
              ) : suggested ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {suggested.hasGroup ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309' }}>
                          <Clock3 size={13} /> PENDIENTE POR AGENDAR
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Grupo: {suggested.groupCode}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--iq-secondary-hover)', fontWeight: 700, textTransform: 'uppercase' }}>
                          {suggested.bookTitle} - {suggested.moduleCode}
                        </div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--iq-primary)', marginTop: '2px' }}>
                          {suggested.moduleTitle}
                        </h4>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px', backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={15} color="var(--iq-primary)" /><span>{suggested.sessionDate}</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={15} color="var(--iq-primary)" /><span>{suggested.startTime} hrs</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={15} color="var(--iq-primary)" /><span>Docente: {suggested.teacherName}</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={15} color="var(--iq-primary)" /><span>{suggested.campusName}</span></div>
                      </div>
                      <Button size="sm" onClick={() => navigate(`/tutoring/search`)}>
                        Reservar Cita Ahora
                      </Button>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569' }}>
                          <AlertTriangle size={13} /> GRUPO PENDIENTE
                        </span>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                          Siguiente Contenido a Cursar
                        </div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--iq-primary)', marginTop: '2px' }}>
                          {suggested.moduleCode} - {suggested.moduleTitle}
                        </h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
                          Actualmente la coordinacion academica no ha aperturado un grupo para esta leccion. El horario sera publicado proximamente.
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => navigate('/tutoring/search')}>
                        Explorar Otras Fechas
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '14px' }}>No tienes tutorias programadas actualmente.</p>
                  <Button size="sm" onClick={() => navigate('/tutoring/search')}>Reservar una Tutoria</Button>
                </div>
              )}
            </Card>
          </div>

          {/* Curriculum Modules Breakdown (Requirements 5 & 6) */}
          <Card
            title="Plan Curricular y Estado de Tutorias de tu Nivel"
            subtitle="Seguimiento en tiempo real de lecciones completadas, confirmadas y pendientes"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {summary?.studentCurriculumProgress && summary.studentCurriculumProgress.length > 0 ? (
                summary.studentCurriculumProgress.map((item: StudentModuleItem) => {
                  return (
                    <div
                      key={item.moduleId}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '14px 18px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: item.status === 'COMPLETED' ? '#f0fdf4' : item.status === 'CONFIRMED' ? '#f0f9ff' : 'var(--bg-app)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor:
                              item.status === 'COMPLETED' ? '#dcfce7' :
                              item.status === 'CONFIRMED' ? '#e0f2fe' :
                              item.status === 'PENDING' ? '#fef3c7' : '#f1f5f9',
                            color:
                              item.status === 'COMPLETED' ? '#166534' :
                              item.status === 'CONFIRMED' ? '#0369a1' :
                              item.status === 'PENDING' ? '#b45309' : '#64748b',
                            fontWeight: 700,
                            fontSize: '13px'
                          }}
                        >
                          {item.sequenceOrder}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--iq-primary)' }}>
                            {item.moduleCode} - {item.moduleTitle}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {item.status === 'COMPLETED' && (
                              <span style={{ color: '#166534', fontWeight: 600 }}>
                                Completada el {item.completionDate || 'Recientemente'} {item.grade != null ? `(Nota: ${item.grade.toFixed(2)})` : ''}
                              </span>
                            )}
                            {item.status === 'CONFIRMED' && (
                              <span style={{ color: '#0369a1', fontWeight: 600 }}>
                                Cita agendada para el {item.appointmentDate} a las {item.appointmentTime} hrs con {item.teacherName} ({item.campusName})
                              </span>
                            )}
                            {item.status === 'PENDING' && (
                              <span style={{ color: '#b45309' }}>
                                Grupos disponibles en plantel. Pendiente de agendar por el estudiante.
                              </span>
                            )}
                            {item.status === 'GROUP_PENDING' && (
                              <span style={{ color: '#64748b' }}>
                                Grupo pendiente de apertura por coordinacion academica.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.status === 'COMPLETED' && (
                          <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 700, backgroundColor: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={13} /> COMPLETADA
                          </span>
                        )}
                        {item.status === 'CONFIRMED' && (
                          <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 700, backgroundColor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={13} /> CONFIRMADA
                          </span>
                        )}
                        {item.status === 'PENDING' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock3 size={13} /> PENDIENTE
                            </span>
                            <Button size="sm" variant="outline" onClick={() => navigate('/tutoring/search')}>
                              Agendar
                            </Button>
                          </div>
                        )}
                        {item.status === 'GROUP_PENDING' && (
                          <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '11.5px', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={13} /> GRUPO PENDIENTE
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Cargando plan curricular del alumno...</p>
              )}
            </div>
          </Card>
        </>
      )}

      {isTeacher && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <Card title="Tus Grupos Asignados" subtitle="Grupos academicos de tutoria a tu cargo">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {summary?.activeGroups && summary.activeGroups.length > 0 ? (
                summary.activeGroups.map(group => (
                  <div key={group.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--iq-primary)' }}>{group.code} - {group.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{group.moduleTitle} | {group.modality}</div>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: group.full ? 'var(--status-danger)' : 'var(--iq-primary)' }}>
                      {group.currentEnrollment} / {group.capacity} Alumnos
                    </span>
                  </div>
                ))
              ) : <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No hay grupos asignados.</p>}
            </div>
          </Card>

          <Card title="Acceso Rapido Docente" subtitle="Herramientas operativas de clase">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button onClick={() => navigate('/attendance')} icon={<CheckCircle size={16} />}>Registrar Asistencia de Sesion</Button>
              <Button onClick={() => navigate('/academic')} variant="outline" icon={<BookOpen size={16} />}>Consultar Contenidos y Vocabulario (Books 1, 2, 3)</Button>
            </div>
          </Card>
        </div>
      )}

      {(isSupervisor || isAdmin) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--iq-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--iq-primary)' }}><Users size={24} /></div>
              <div><div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Grupos Activos</div><div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--iq-primary)' }}>{summary?.totalActiveGroups || 5}</div></div>
            </div>
          </Card>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--iq-secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--iq-secondary-hover)' }}><TrendingUp size={24} /></div>
              <div><div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Ocupacion de Planteles</div><div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--iq-primary)' }}>{summary?.campusOccupancyRate || 42}%</div></div>
            </div>
          </Card>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}><AlertTriangle size={24} /></div>
              <div><div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Capacidad Critica</div><div style={{ fontSize: '24px', fontWeight: 800, color: '#b45309' }}>1 Grupo Lleno</div></div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};