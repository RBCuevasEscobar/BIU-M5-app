import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Appointment, GroupSession } from '../../types';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Calendar, Clock, MapPin, AlertCircle, RefreshCw, XCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MyAppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Cancel Modal State
  const [cancelModalAppt, setCancelModalAppt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('Conflicto de horario personal');
  const [isCancelLoading, setIsCancelLoading] = useState(false);

  // Reschedule Modal State
  const [reschedModalAppt, setReschedModalAppt] = useState<Appointment | null>(null);
  const [availableSlots, setAvailableSlots] = useState<GroupSession[]>([]);
  const [selectedNewSessionId, setSelectedNewSessionId] = useState<number | ''>('');
  const [isReschedLoading, setIsReschedLoading] = useState(false);
  const [reschedError, setReschedError] = useState('');

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Appointment[]>('/appointments/my');
      setAppointments(data);
    } catch (err: any) {
      console.error('Failed to load appointments', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const handleOpenReschedule = async (appt: Appointment) => {
    setReschedModalAppt(appt);
    setReschedError('');
    setSelectedNewSessionId('');
    try {
      // Find other sessions for the same module
      const results = await api.get<GroupSession[]>(`/tutoring/sessions?moduleId=${appt.session.moduleId}`);
      setAvailableSlots(results.filter(s => s.id !== appt.session.id && !s.full));
    } catch (err: any) {
      console.error('Failed to load slots for rescheduling', err);
    }
  };

  const handleExecuteCancel = async () => {
    if (!cancelModalAppt) return;
    setIsCancelLoading(true);
    try {
      await api.post(`/appointments/${cancelModalAppt.id}/cancel`, { reason: cancelReason });
      setCancelModalAppt(null);
      loadAppointments();
    } catch (err: any) {
      alert(err.message || 'Error al cancelar la tutoría');
    } finally {
      setIsCancelLoading(false);
    }
  };

  const handleExecuteReschedule = async () => {
    if (!reschedModalAppt || !selectedNewSessionId) return;
    setIsReschedLoading(true);
    setReschedError('');
    try {
      await api.post(`/appointments/${reschedModalAppt.id}/reschedule`, {
        newSessionId: selectedNewSessionId,
        reason: 'Reprogramado por el estudiante',
      });
      setReschedModalAppt(null);
      loadAppointments();
    } catch (err: any) {
      setReschedError(err.message || 'Error durante la reprogramación. Tu cita original sigue segura.');
    } finally {
      setIsReschedLoading(false);
    }
  };

  const activeAppts = appointments.filter(a => a.status === 'CONFIRMED');
  const pastAppts = appointments.filter(a => a.status !== 'CONFIRMED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--iq-primary)' }}>Mis Tutorías Reservadas</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Historial y administración de tus sesiones académicas</p>
        </div>
        <Button onClick={() => navigate('/tutoring/search')}>+ Reservar Nueva Tutoría</Button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Cargando tus citas..." />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No tienes tutorías reservadas"
          description="Aún no has registrado ninguna sesión de tutoría. Explora los horarios disponibles para tu nivel actual."
          actionText="Buscar Tutoría"
          onAction={() => navigate('/tutoring/search')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Active Appointments */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--iq-primary)', marginBottom: '14px' }}>
              Tutorías Activas ({activeAppts.length})
            </h2>
            {activeAppts.length === 0 ? (
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No tienes tutorías activas pendientes.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '18px' }}>
                {activeAppts.map(appt => (
                  <Card key={appt.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <Badge status={appt.status} />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{appt.appointmentNumber}</span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--iq-primary)' }}>
                      {appt.session.moduleTitle}
                    </h3>
                    {appt.session.topicTitle && (
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{appt.session.topicTitle}</p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', margin: '14px 0', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={15} color="var(--iq-primary)" />
                        <span style={{ fontWeight: 600 }}>{appt.session.sessionDate}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={15} color="var(--iq-primary)" />
                        <span>{appt.session.startTime} - {appt.session.endTime} hrs</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={15} color="var(--iq-primary)" />
                        <span>{appt.session.campusName} ({appt.session.modality})</span>
                      </div>
                      <div>Docente: <strong>{appt.session.teacherName}</strong></div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" icon={<RefreshCw size={14} />} onClick={() => handleOpenReschedule(appt)}>
                        Reprogramar
                      </Button>
                      <Button size="sm" variant="danger" icon={<XCircle size={14} />} onClick={() => setCancelModalAppt(appt)}>
                        Cancelar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Past / Rescheduled Appointments */}
          {pastAppts.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--iq-primary)', marginBottom: '14px' }}>
                Historial de Tutorías Pasadas
              </h2>
              <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
                    <tr>
                      <th style={{ padding: '12px 16px' }}>Folio</th>
                      <th style={{ padding: '12px 16px' }}>Módulo</th>
                      <th style={{ padding: '12px 16px' }}>Fecha y Hora</th>
                      <th style={{ padding: '12px 16px' }}>Docente</th>
                      <th style={{ padding: '12px 16px' }}>Estado</th>
                      <th style={{ padding: '12px 16px' }}>Asistencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastAppts.map(appt => (
                      <tr key={appt.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{appt.appointmentNumber}</td>
                        <td style={{ padding: '12px 16px' }}>{appt.session.moduleTitle}</td>
                        <td style={{ padding: '12px 16px' }}>{appt.session.sessionDate} {appt.session.startTime}</td>
                        <td style={{ padding: '12px 16px' }}>{appt.session.teacherName}</td>
                        <td style={{ padding: '12px 16px' }}><Badge status={appt.status} size="sm" /></td>
                        <td style={{ padding: '12px 16px' }}>
                          {appt.attendanceStatus ? <Badge status={appt.attendanceStatus} size="sm" /> : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CANCEL MODAL */}
      <Modal isOpen={!!cancelModalAppt} onClose={() => setCancelModalAppt(null)} title="Confirmar Cancelación de Tutoría">
        {cancelModalAppt && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--status-danger-bg)', color: 'var(--status-danger)', borderRadius: 'var(--radius-md)', fontSize: '13.5px' }}>
              Al cancelar tu cita, el espacio será liberado inmediatamente para que otro estudiante pueda aprovecharlo.
            </div>
            <div style={{ fontSize: '13.5px' }}>
              <div><strong>Módulo:</strong> {cancelModalAppt.session.moduleTitle}</div>
              <div><strong>Fecha:</strong> {cancelModalAppt.session.sessionDate} a las {cancelModalAppt.session.startTime} hrs</div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>Motivo de Cancelación</label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '13.5px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <Button variant="ghost" onClick={() => setCancelModalAppt(null)}>Regresar</Button>
              <Button variant="danger" isLoading={isCancelLoading} onClick={handleExecuteCancel}>Confirmar Cancelación</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* TRANSACTIONAL RESCHEDULE MODAL (Rule R10) */}
      <Modal isOpen={!!reschedModalAppt} onClose={() => setReschedModalAppt(null)} title="Reprogramación Segura de Tutoría">
        {reschedModalAppt && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {reschedError && (
              <div style={{ padding: '12px', backgroundColor: 'var(--status-danger-bg)', color: 'var(--status-danger)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                {reschedError}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '14px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Tutoría Actual</span>
                <div style={{ fontWeight: 700, color: 'var(--iq-primary)', fontSize: '13.5px', marginTop: '2px' }}>{reschedModalAppt.session.sessionDate}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{reschedModalAppt.session.startTime} hrs con {reschedModalAppt.session.teacherName}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--iq-secondary-hover)', fontWeight: 700, textTransform: 'uppercase' }}>Nuevo Horario</span>
                <div style={{ fontWeight: 700, color: 'var(--iq-secondary-hover)', fontSize: '13.5px', marginTop: '2px' }}>
                  {selectedNewSessionId ? availableSlots.find(s => s.id === selectedNewSessionId)?.sessionDate : 'Selecciona una opción'}
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '8px' }}>
                Selecciona el nuevo horario disponible para {reschedModalAppt.session.moduleCode}:
              </label>
              {availableSlots.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No hay otros horarios alternativos con cupos disponibles para esta lección en este momento.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {availableSlots.map(slot => (
                    <label
                      key={slot.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: 'var(--radius-md)',
                        border: selectedNewSessionId === slot.id ? '2px solid var(--iq-primary)' : '1px solid var(--border-color)',
                        backgroundColor: selectedNewSessionId === slot.id ? 'var(--iq-primary-light)' : '#ffffff',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="radio"
                          name="newSession"
                          checked={selectedNewSessionId === slot.id}
                          onChange={() => setSelectedNewSessionId(slot.id)}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--iq-primary)' }}>{slot.sessionDate} • {slot.startTime} hrs</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Docente: {slot.teacherName} ({slot.campusName})</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--iq-secondary-hover)' }}>{slot.availableSeats} cupos</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button variant="ghost" onClick={() => setReschedModalAppt(null)}>Cancelar</Button>
              <Button disabled={!selectedNewSessionId} isLoading={isReschedLoading} onClick={handleExecuteReschedule}>
                Confirmar Reprogramación
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
