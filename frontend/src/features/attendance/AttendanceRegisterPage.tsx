import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Appointment, GroupSession, DashboardSummary } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { CheckCircle, AlertCircle, Save, CheckCircle2, UserCheck, Calendar, Clock, MapPin, Users } from 'lucide-react';

interface AttendanceRowState {
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED';
  grade: string;
  notes: string;
  error?: string;
}

export const AttendanceRegisterPage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | ''>('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<number, AttendanceRowState>>({});
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(true);
  const [isLoadingAppts, setIsLoadingAppts] = useState<boolean>(false);
  const [isSavingApptId, setIsSavingApptId] = useState<number | null>(null);
  const [isSavingAll, setIsSavingAll] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 1. Load teacher sessions corresponding to their dashboard groups (Requirement 4)
  useEffect(() => {
    async function loadTeacherSessions() {
      setIsLoadingSessions(true);
      setErrorMsg('');
      try {
        const dashboard = await api.get<DashboardSummary>('/reports/dashboard');
        let sessionList = dashboard.teacherSessions || [];

        // Fallback: If not in summary, fetch directly from sessions endpoint
        if (sessionList.length === 0) {
          sessionList = await api.get<GroupSession[]>('/tutoring/sessions');
        }

        setSessions(sessionList);
        if (sessionList.length > 0) {
          setSelectedSessionId(sessionList[0].id);
        }
      } catch (err: any) {
        console.error('Failed to load teacher sessions', err);
        setErrorMsg('Error al cargar las sesiones asignadas al docente.');
      } finally {
        setIsLoadingSessions(false);
      }
    }
    loadTeacherSessions();
  }, [user]);

  // 2. Load pending students for the selected session (Requirement 3)
  useEffect(() => {
    if (!selectedSessionId) return;

    async function loadSessionAppts() {
      setIsLoadingAppts(true);
      setSuccessMsg('');
      setErrorMsg('');
      try {
        const data = await api.get<Appointment[]>(`/appointments/session/${selectedSessionId}`);
        // Filter: Show only appointments that have NOT yet had attendance recorded (Requirement 3)
        const pendingAppts = (data || []).filter(a => !a.attendanceStatus && a.status === 'CONFIRMED');
        setAppointments(pendingAppts);

        const initialMap: Record<number, AttendanceRowState> = {};
        pendingAppts.forEach(a => {
          initialMap[a.id] = {
            status: 'PRESENT',
            grade: '',
            notes: ''
          };
        });
        setAttendanceRecords(initialMap);
      } catch (err: any) {
        console.error('Failed to load session appointments', err);
        setErrorMsg('Error al cargar la lista de alumnos de la sesion.');
      } finally {
        setIsLoadingAppts(false);
      }
    }
    loadSessionAppts();
  }, [selectedSessionId]);

  const handleStatusChange = (apptId: number, status: 'PRESENT' | 'ABSENT' | 'EXCUSED') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [apptId]: {
        ...prev[apptId],
        status,
        grade: status === 'PRESENT' ? prev[apptId]?.grade || '' : '',
        error: undefined
      }
    }));
  };

  const handleGradeChange = (apptId: number, gradeStr: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [apptId]: {
        ...prev[apptId],
        grade: gradeStr,
        error: undefined
      }
    }));
  };

  const handleNotesChange = (apptId: number, notes: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [apptId]: { ...prev[apptId], notes }
    }));
  };

  // 3. Register individual student attendance with grade validation (Requirement 3)
  const handleSaveIndividual = async (appt: Appointment) => {
    const rec = attendanceRecords[appt.id];
    if (!rec) return;

    // Validation for PRESENT status (Requirement 3)
    let parsedGrade: number | undefined = undefined;
    if (rec.status === 'PRESENT') {
      const num = parseFloat(rec.grade);
      if (isNaN(num) || num < 50 || num > 100) {
        setAttendanceRecords(prev => ({
          ...prev,
          [appt.id]: {
            ...prev[appt.id],
            error: 'La nota es obligatoria y debe ser un valor entre 50.00 y 100.00 con hasta dos decimales.'
          }
        }));
        return;
      }
      parsedGrade = Math.round(num * 100) / 100;
    }

    setIsSavingApptId(appt.id);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await api.post('/attendance', {
        appointmentId: appt.id,
        status: rec.status,
        grade: parsedGrade,
        notes: rec.notes || undefined,
      });

      // Requirement 3: Immediately remove the student from the active pending list
      setAppointments(prev => prev.filter(a => a.id !== appt.id));
      setSuccessMsg(`Asistencia registrada exitosamente para ${appt.studentName} (${rec.status}${parsedGrade ? ` - Nota: ${parsedGrade.toFixed(2)}` : ''}).`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar la asistencia del alumno.');
    } finally {
      setIsSavingApptId(null);
    }
  };

  // 4. Batch save all pending students
  const handleSaveAll = async () => {
    // Validate all rows first
    let hasValidationErrors = false;
    const updatedRecords = { ...attendanceRecords };

    for (const appt of appointments) {
      const rec = updatedRecords[appt.id];
      if (rec && rec.status === 'PRESENT') {
        const num = parseFloat(rec.grade);
        if (isNaN(num) || num < 50 || num > 100) {
          updatedRecords[appt.id] = {
            ...rec,
            error: 'Nota requerida (50.00 - 100.00)'
          };
          hasValidationErrors = true;
        }
      }
    }

    if (hasValidationErrors) {
      setAttendanceRecords(updatedRecords);
      setErrorMsg('Por favor ingresa una nota valida (50.00 - 100.00) para todos los alumnos marcados como Presente.');
      return;
    }

    setIsSavingAll(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      for (const appt of appointments) {
        const rec = updatedRecords[appt.id];
        if (rec) {
          const num = rec.status === 'PRESENT' ? Math.round(parseFloat(rec.grade) * 100) / 100 : undefined;
          await api.post('/attendance', {
            appointmentId: appt.id,
            status: rec.status,
            grade: num,
            notes: rec.notes || undefined,
          });
        }
      }

      setAppointments([]);
      setSuccessMsg('Se ha registrado la asistencia de todos los alumnos y su progreso academico ha sido actualizado.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la asistencia masiva.');
    } finally {
      setIsSavingAll(false);
    }
  };

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--iq-primary)' }}>Registro de Asistencia de Sesion</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Pasa lista y califica el desempeno academico de los alumnos inscritos</p>
        </div>

        {/* Dynamic Teacher Sessions Dropdown (Requirement 4) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={selectedSessionId}
            onChange={e => setSelectedSessionId(Number(e.target.value))}
            style={{ padding: '9px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontWeight: 600, fontSize: '13.5px', minWidth: '320px' }}
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                [{s.groupCode}] {s.moduleCode} - {s.sessionDate} {s.startTime} hrs ({s.campusName})
              </option>
            ))}
          </select>

          {appointments.length > 0 && (
            <Button icon={<Save size={16} />} isLoading={isSavingAll} onClick={handleSaveAll}>
              Guardar Todos ({appointments.length})
            </Button>
          )}
        </div>
      </div>

      {selectedSession && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '14px 20px', backgroundColor: 'var(--iq-primary-light)', borderRadius: 'var(--radius-md)', fontSize: '13.5px', color: 'var(--iq-primary)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={16} /><span>Grupo: <strong>{selectedSession.groupName} ({selectedSession.groupCode})</strong></span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /><span>Fecha: <strong>{selectedSession.sessionDate}</strong></span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /><span>Horario: <strong>{selectedSession.startTime} - {selectedSession.endTime} hrs</strong></span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /><span>Plantel: <strong>{selectedSession.campusName}</strong></span></div>
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: 'var(--status-danger-bg)', color: 'var(--status-danger)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {isLoadingSessions || isLoadingAppts ? (
        <LoadingSpinner message="Cargando alumnos de la sesion..." />
      ) : appointments.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={40} color="var(--status-success)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--iq-primary)' }}>
              Todos los alumnos de esta sesion han sido evaluados
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '480px' }}>
              No hay asistencias pendientes por registrar para este horario. Si necesitas revisar asistencias previas, puedes consultar el modulo de reportes.
            </p>
          </div>
        </Card>
      ) : (
        <Card title={`Alumnos Inscritos Pendientes por Evaluar (${appointments.length})`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {appointments.map(appt => {
              const currentRec = attendanceRecords[appt.id] || { status: 'PRESENT', grade: '', notes: '' };
              const isPresent = currentRec.status === 'PRESENT';

              return (
                <div
                  key={appt.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-app)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--iq-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px' }}>
                        {appt.studentName?.[0] || 'S'}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--iq-primary)' }}>{appt.studentName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Matricula: <strong>{appt.studentNumber}</strong> | Folio: <strong>{appt.appointmentNumber}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      {/* Attendance Status Radios / Buttons (Requirement 3) */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(appt.id, 'PRESENT')}
                          style={{
                            padding: '6px 14px', borderRadius: 'var(--radius-md)', border: '1px solid #10b981',
                            backgroundColor: currentRec.status === 'PRESENT' ? '#10b981' : '#ffffff',
                            color: currentRec.status === 'PRESENT' ? '#ffffff' : '#10b981',
                            fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
                          }}
                        >
                          Presente
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(appt.id, 'ABSENT')}
                          style={{
                            padding: '6px 14px', borderRadius: 'var(--radius-md)', border: '1px solid #ef4444',
                            backgroundColor: currentRec.status === 'ABSENT' ? '#ef4444' : '#ffffff',
                            color: currentRec.status === 'ABSENT' ? '#ffffff' : '#ef4444',
                            fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
                          }}
                        >
                          Ausente
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(appt.id, 'EXCUSED')}
                          style={{
                            padding: '6px 14px', borderRadius: 'var(--radius-md)', border: '1px solid #f59e0b',
                            backgroundColor: currentRec.status === 'EXCUSED' ? '#f59e0b' : '#ffffff',
                            color: currentRec.status === 'EXCUSED' ? '#ffffff' : '#f59e0b',
                            fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
                          }}
                        >
                          Justificado
                        </button>
                      </div>

                      {/* Grade Input - MANDATORY IF PRESENT (Requirement 3) */}
                      {isPresent ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)' }}>Nota (50-100):</label>
                            <input
                              type="number"
                              min="50"
                              max="100"
                              step="0.01"
                              placeholder="Ej. 95.00"
                              value={currentRec.grade}
                              onChange={e => handleGradeChange(appt.id, e.target.value)}
                              style={{
                                width: '100px',
                                padding: '6px 8px',
                                borderRadius: 'var(--radius-md)',
                                border: currentRec.error ? '1px solid var(--status-danger)' : '1px solid var(--border-color)',
                                fontSize: '13px',
                                fontWeight: 700,
                                textAlign: 'center'
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div style={{ width: '100px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Sin nota
                        </div>
                      )}

                      {/* Notes Input */}
                      <input
                        type="text"
                        placeholder="Observaciones de desempeno o fluidez..."
                        value={currentRec.notes}
                        onChange={e => handleNotesChange(appt.id, e.target.value)}
                        style={{ width: '240px', padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '12.5px' }}
                      />

                      {/* Individual Save Button */}
                      <Button
                        size="sm"
                        isLoading={isSavingApptId === appt.id}
                        onClick={() => handleSaveIndividual(appt)}
                      >
                        Registrar
                      </Button>
                    </div>
                  </div>

                  {currentRec.error && (
                    <div style={{ fontSize: '12px', color: 'var(--status-danger)', fontWeight: 600, paddingLeft: '56px' }}>
                      * {currentRec.error}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};