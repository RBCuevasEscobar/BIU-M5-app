import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Appointment } from '../../types';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { CheckCircle2, XCircle, Clock, AlertCircle, Save } from 'lucide-react';

export const AttendanceRegisterPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number>(1);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<number, { status: string; notes: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadSessionAppts() {
      setIsLoading(true);
      try {
        const data = await api.get<Appointment[]>(`/appointments/session/${selectedSessionId}`);
        setAppointments(data);
        const map: Record<number, { status: string; notes: string }> = {};
        data.forEach(a => {
          map[a.id] = { status: a.attendanceStatus || 'PRESENT', notes: a.attendanceNotes || '' };
        });
        setAttendanceRecords(map);
      } catch (err) {
        console.error('Failed to load session appointments', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSessionAppts();
  }, [selectedSessionId]);

  const handleStatusChange = (apptId: number, status: 'PRESENT' | 'ABSENT' | 'EXCUSED') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [apptId]: { ...prev[apptId], status }
    }));
  };

  const handleNotesChange = (apptId: number, notes: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [apptId]: { ...prev[apptId], notes }
    }));
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    setSuccessMsg('');
    try {
      for (const appt of appointments) {
        const rec = attendanceRecords[appt.id];
        if (rec) {
          await api.post('/attendance', {
            appointmentId: appt.id,
            status: rec.status,
            notes: rec.notes,
          });
        }
      }
      setSuccessMsg('Asistencia guardada y progreso académico actualizado correctamente.');
    } catch (err: any) {
      alert(err.message || 'Error al guardar asistencia');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--iq-primary)' }}>Registro de Asistencia de Sesión</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Pasa lista y registra el desempeño de los alumnos inscritos</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={selectedSessionId}
            onChange={e => setSelectedSessionId(Number(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontWeight: 600 }}
          >
            <option value={1}>Sesión 1: TUT-B2-01 (Book 2 - Lesson 5B)</option>
            <option value={3}>Sesión 3: TUT-B1-01 (Book 1 - Lesson 4B)</option>
            <option value={4}>Sesión 4: TUT-B3-01 (Book 3 - Lesson 1A)</option>
            <option value={7}>Sesión 7: TUT-B2-FULL-01 (Full Group Test)</option>
          </select>
          <Button icon={<Save size={16} />} isLoading={isSaving} onClick={handleSaveAttendance}>
            Guardar Asistencia
          </Button>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner message="Cargando alumnos de la sesión..." />
      ) : appointments.length === 0 ? (
        <Card>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
            No hay alumnos inscritos en esta sesión actualmente.
          </p>
        </Card>
      ) : (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {appointments.map(appt => {
              const currentRec = attendanceRecords[appt.id] || { status: 'PRESENT', notes: '' };
              return (
                <div
                  key={appt.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-app)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--iq-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {appt.studentName?.[0] || 'S'}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--iq-primary)' }}>{appt.studentName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Matrícula: {appt.studentNumber} • Folio: {appt.appointmentNumber}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Status Buttons */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(appt.id, 'PRESENT')}
                        style={{
                          padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #10b981',
                          backgroundColor: currentRec.status === 'PRESENT' ? '#10b981' : '#ffffff',
                          color: currentRec.status === 'PRESENT' ? '#ffffff' : '#10b981',
                          fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        Presente
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(appt.id, 'ABSENT')}
                        style={{
                          padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #ef4444',
                          backgroundColor: currentRec.status === 'ABSENT' ? '#ef4444' : '#ffffff',
                          color: currentRec.status === 'ABSENT' ? '#ffffff' : '#ef4444',
                          fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        Ausente
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(appt.id, 'EXCUSED')}
                        style={{
                          padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid #f59e0b',
                          backgroundColor: currentRec.status === 'EXCUSED' ? '#f59e0b' : '#ffffff',
                          color: currentRec.status === 'EXCUSED' ? '#ffffff' : '#f59e0b',
                          fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                        }}
                      >
                        Justificado
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Notas de desempeño / pronunciación..."
                      value={currentRec.notes}
                      onChange={e => handleNotesChange(appt.id, e.target.value)}
                      style={{ width: '260px', padding: '6px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '12.5px' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
