import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DashboardSummary } from '../../types';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, BookOpen, Users, CheckCircle, AlertTriangle, Sparkles, CalendarCheck, TrendingUp } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, studentProfile, teacherProfile, hasRole } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadSummary() {
      try {
        const data = await api.get<DashboardSummary>('/reports/dashboard');
        setSummary(data);
      } catch (err) {
        console.error('Failed to load dashboard summary', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSummary();
  }, [user]);

  if (isLoading) return <LoadingSpinner message="Cargando tu panel de control..." />;

  const isStudent = hasRole('STUDENT');
  const isTeacher = hasRole('TEACHER');
  const isSupervisor = hasRole('SUPERVISOR');
  const isAdmin = hasRole('ADMIN');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="iq-texture-bg" style={{ borderRadius: 'var(--radius-lg)', padding: '28px 32px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-md)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--iq-secondary)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            <Sparkles size={16} />
            <span>Portal Académico IQ English</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px' }}>¡Hola, {user?.firstName || 'Estudiante'}!</h1>
          <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '4px', maxWidth: '600px' }}>
            {isStudent && 'Continúa desarrollando tu fluidez comunicativa con tus sesiones de tutoría personalizada y práctica de IA.'}
            {isTeacher && 'Bienvenido a tu panel docente. Revisa tus sesiones programadas de hoy y gestiona la asistencia de tus alumnos.'}
            {(isSupervisor || isAdmin) && 'Panel de control operativo: supervisión de planteles, grupos activos, docentes y cupos.'}
          </p>
        </div>
        {isStudent && (
          <Button onClick={() => navigate('/tutoring/search')} variant="secondary" size="lg" icon={<CalendarCheck size={18} />}>
            Buscar Tutoría
          </Button>
        )}
      </div>

      {isStudent && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <Card title="Tu Contexto Académico Actual" subtitle="Basado en tu avance en el programa de inglés natural">
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
                    Módulo Actual: {studentProfile?.currentModuleTitle || 'Lesson 5B: Requests, Excuses & Apologies'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Progreso en Módulo:</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--iq-primary)' }}>1 de 4 tutorías</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--iq-gray-light)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '25%', height: '100%', backgroundColor: 'var(--iq-secondary)' }} />
              </div>
            </div>
          </Card>

          <Card title="Próxima Tutoría Confirmada" subtitle="Tu siguiente cita programada en plantel">
            {summary?.upcomingAppointments && summary.upcomingAppointments.length > 0 ? (
              (() => {
                const appt = summary.upcomingAppointments[0];
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Badge status={appt.status} />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Folio: {appt.appointmentNumber}</span>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--iq-primary)' }}>{appt.session.moduleTitle}</h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Tema: {appt.session.topicTitle || 'Práctica comunicativa'}</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={15} color="var(--iq-primary)" /><span>{appt.session.sessionDate}</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={15} color="var(--iq-primary)" /><span>{appt.session.startTime} hrs</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={15} color="var(--iq-primary)" /><span>Docente: {appt.session.teacherName}</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={15} color="var(--iq-primary)" /><span>{appt.session.campusName}</span></div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate('/tutoring/my-appointments')}>
                      Ver Mis Tutorías / Reprogramar
                    </Button>
                  </div>
                );
              })()
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '14px' }}>No tienes tutorías programadas para esta semana.</p>
                <Button size="sm" onClick={() => navigate('/tutoring/search')}>Reservar una Tutoría</Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {isTeacher && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <Card title="Tus Grupos Asignados" subtitle="Grupos académicos de tutoría a tu cargo">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {summary?.activeGroups && summary.activeGroups.length > 0 ? (
                summary.activeGroups.map(group => (
                  <div key={group.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--iq-primary)' }}>{group.code} - {group.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{group.moduleTitle} • {group.modality}</div>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: group.full ? 'var(--status-danger)' : 'var(--iq-primary)' }}>
                      {group.currentEnrollment} / {group.capacity} Alumnos
                    </span>
                  </div>
                ))
              ) : <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No hay grupos asignados.</p>}
            </div>
          </Card>

          <Card title="Acceso Rápido Docente" subtitle="Herramientas operativas de clase">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button onClick={() => navigate('/attendance')} icon={<CheckCircle size={16} />}>Registrar Asistencia de Sesión</Button>
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
              <div><div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Ocupación de Planteles</div><div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--iq-primary)' }}>{summary?.campusOccupancyRate || 42}%</div></div>
            </div>
          </Card>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}><AlertTriangle size={24} /></div>
              <div><div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Capacidad Crítica</div><div style={{ fontSize: '24px', fontWeight: 800, color: '#b45309' }}>1 Grupo Lleno</div></div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
