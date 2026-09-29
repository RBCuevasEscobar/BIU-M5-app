import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Appointment, GroupSession, DashboardSummary } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { CheckCircle, AlertCircle, Save, UserCheck, Calendar, Clock, MapPin, Users, Lock } from 'lucide-react';

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

  // 1. Load teacher sessions corresponding to their dashboard groups
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

  // 2. Load pending students for the selected session
  useEffect(() => {
    if (!selectedSessionId) return;

    async function loadSessionAppts() {
      setIsLoadingAppts(true);
      setSuccessMsg('');
      setErrorMsg('');
      try {
        const data = await api.get<Appointment[]>('/appointments/session/' + selectedSessionId);
        // Filter: Show only appointments that have NOT yet had attendance recorded
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
    setAttendanceRecords(prev => {
      const current = prev[apptId] || { status: 'PRESENT', grade: '', notes: '' };
      return {
        ...prev,
        [apptId]: {
          ...current,
          status,
          // When status is changed to ABSENT or EXCUSED, automatically wipe and block grade
          grade: status === 'PRESENT' ? current.grade : '',
          error: undefined
        }
      };
    });
  };

  const handleGradeChange = (apptId: number, gradeStr: string) => {
    setAttendanceRecords(prev => {
      const current = prev[apptId] || { status: 'PRESENT', grade: '', notes: '' };
      // If status is not PRESENT, do not permit setting any grade value
      if (current.status !== 'PRESENT') {
        return {
          ...prev,
          [apptId]: {
            ...current,
            grade: '',
            error: 'No se permite ingresar una nota cuando el estado es Ausente o Justificado. El campo nota debe permanecer vacio.'
          }
        };
      }
      return {
        ...prev,
        [apptId]: {
          ...current,
          grade: gradeStr,
          error: undefined
        }
      };
    });
  };

  const handleNotesChange = (apptId: number, notes: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [apptId]: { ...prev[apptId], notes }
    }));
  };

  // 3. Register individual student attendance with grade validation
  const handleSaveIndividual = async (appt: Appointment) => {
    const rec = attendanceRecords[appt.id];
    if (!rec) return;

    let parsedGrade: number | undefined = undefined;
    if (rec.status === 'PRESENT') {
      const num = parseFloat(rec.grade);
      if (isNaN(num) || num < 50 || num > 100) {
        setAttendanceRecords(prev => ({
          ...prev,
          [appt.id]: {
            ...prev[appt.id],
            error: 'La calificacion es obligatoria para alumnos Presentes (50.00 a 100.00).'
          }
        }));
        return;
      }
      parsedGrade = Math.round(num * 100) / 100;
    } else {
      if (rec.grade && rec.grade.trim() !== '') {
        setAttendanceRecords(prev => ({
          ...prev,
          [appt.id]: {
            ...prev[appt.id],
            grade: '',
            error: 'El campo de calificacion debe permanecer vacio cuando el estado es ' + (rec.status === 'ABSENT' ? 'Ausente' : 'Justificado') + '.'
          }
        }));
        return;
      }
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

      // Immediately remove the student from the active pending list
      setAppointments(prev => prev.filter(a => a.id !== appt.id));
      setSuccessMsg('Asistencia registrada exitosamente para ' + appt.studentName + ' (' + rec.status + (parsedGrade ? ' - Calificacion: ' + parsedGrade.toFixed(2) : '') + '). Si todos los alumnos de la sesion han sido evaluados, el grupo y la sesion han sido cerrados automaticamente.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar la asistencia del alumno.');
    } finally {
      setIsSavingApptId(null);
    }
  };

  // 4. Batch save all pending students
  const handleSaveAll = async () => {
    let hasValidationErrors = false;
    const updatedRecords = { ...attendanceRecords };

    for (const appt of appointments) {
      const rec = updatedRecords[appt.id];
      if (rec) {
        if (rec.status === 'PRESENT') {
          const num = parseFloat(rec.grade);
          if (isNaN(num) || num < 50 || num > 100) {
            updatedRecords[appt.id] = {
              ...rec,
              error: 'Nota requerida (50.00 - 100.00)'
            };
            hasValidationErrors = true;
          }
        } else {
          if (rec.grade && rec.grade.trim() !== '') {
            updatedRecords[appt.id] = {
              ...rec,
              grade: '',
              error: 'No se permite nota cuando el estado es Ausente o Justificado. Limpia el campo nota.'
            };
            hasValidationErrors = true;
          }
        }
      }
    }

    if (hasValidationErrors) {
      setAttendanceRecords(updatedRecords);
      setErrorMsg('Por favor verifica las notas: 50.00 - 100.00 para alumnos Presentes y vacio para Ausentes/Justificados.');
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

        {/* Dynamic Teacher Sessions Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={selectedSessionId}
            onChange={e => setSelectedSessionId(Number(e.target.value))}
            style={{ padding: '9px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontWeight: 600, fontSize: '13.5px', minWidth: '320px' }}
          >
            {sessions.map(s => (
              <option key={s.id} value={s.id}>
                {'[' + s.groupCode + '] ' + s.moduleCode + ' - ' + s.sessionDate + ' ' + s.startTime + ' hrs (' + s.campusName + ')'}
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#f8fafc',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={18} color="var(--iq-secondary)" />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Fecha y Turno</div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--iq-primary)' }}>{selectedSession.sessionDate}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={18} color="var(--iq-secondary)" />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Horario</div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--iq-primary)' }}>{selectedSession.startTime} - {selectedSession.endTime}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={18} color="var(--iq-secondary)" />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Plantel y Aula / Enlace</div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--iq-primary)' }}>{selectedSession.campusName} - {selectedSession.roomOrLink || 'Aula General'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={18} color="var(--iq-secondary)" />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Alumnos por Evaluar</div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--iq-primary)' }}>{appointments.length} / {selectedSession.capacity || 8}</div>
            </div>
          </div>
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#e6f4ea', color: 'var(--status-success)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', fontWeight: 600 }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fde8e8', color: 'var(--status-danger)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', fontWeight: 600 }}>
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
        <Card title={'Alumnos Inscritos Pendientes por Evaluar (' + appointments.length + ')'}>
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
                      {/* Attendance Status Radios / Buttons */}
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

                      {/* Grade Input - DISABLED and BLOCKED when status is ABSENT or EXCUSED */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 700, color: isPresent ? 'var(--text-main)' : 'var(--text-muted)' }}>
                            Nota:
                          </label>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <input
                              type="number"
                              min="50"
                              max="100"
                              step="0.01"
                              placeholder={isPresent ? '50-100' : 'N/A'}
                              value={isPresent ? currentRec.grade : ''}
                              disabled={!isPresent}
                              readOnly={!isPresent}
                              onChange={e => handleGradeChange(appt.id, e.target.value)}
                              style={{
                                width: '100px',
                                padding: '6px 8px',
                                borderRadius: 'var(--radius-md)',
                                border: currentRec.error ? '1px solid var(--status-danger)' : '1px solid var(--border-color)',
                                fontSize: '13px',
                                fontWeight: 700,
                                textAlign: 'center',
                                backgroundColor: isPresent ? '#ffffff' : '#f1f5f9',
                                color: isPresent ? 'var(--text-main)' : 'var(--text-muted)',
                                cursor: isPresent ? 'text' : 'not-allowed',
                                opacity: isPresent ? 1 : 0.7
                              }}
                            />
                            {!isPresent && (
                              <Lock size={12} style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                            )}
                          </div>
                        </div>
                      </div>

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
