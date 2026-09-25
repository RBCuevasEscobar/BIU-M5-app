const fs = require('fs');
const path = require('path');
const base = path.resolve('frontend/src');
function w(relPath, content) {
  const full = path.join(base, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n', 'utf8');
  console.log('Generated:', relPath);
}

// 1. GroupManagementPage
w('features/groups/GroupManagementPage.tsx', `
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TutoringGroup, Campus, Book, ModuleItem, TeacherProfile } from '../../types';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Users, Plus, Copy, Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';

export const GroupManagementPage: React.FC = () => {
  const [groups, setGroups] = useState<TutoringGroup[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [campusId, setCampusId] = useState<number>(1);
  const [teacherId, setTeacherId] = useState<number>(1);
  const [bookId, setBookId] = useState<number>(2);
  const [moduleId, setModuleId] = useState<number>(8);
  const [capacity, setCapacity] = useState<number>(12);
  const [sessionDate, setSessionDate] = useState('');
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('18:00');

  // Duplicate Modal State
  const [duplicateTarget, setDuplicateTarget] = useState<TutoringGroup | null>(null);
  const [dupName, setDupName] = useState('');
  const [dupDate, setDupDate] = useState('');
  const [dupTime, setDupTime] = useState('19:00');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [gData, cData, bData] = await Promise.all([
        api.get<TutoringGroup[]>('/tutoring/groups'),
        api.get<Campus[]>('/campuses'),
        api.get<Book[]>('/books'),
      ]);
      setGroups(gData);
      setCampuses(cData);
      setBooks(bData);
    } catch (err) {
      console.error('Failed to load groups data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (bookId) {
      api.get<ModuleItem[]>(\`/modules?bookId=\${bookId}\`).then(setModules);
    }
  }, [bookId]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tutoring/groups', {
        name: groupName,
        campusId,
        teacherId,
        moduleId,
        capacity,
        initialSessionDate: sessionDate || undefined,
        initialStartTime: sessionDate ? startTime : undefined,
        initialEndTime: sessionDate ? endTime : undefined,
      });
      setIsCreateOpen(false);
      setGroupName('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al crear el grupo');
    }
  };

  const handleDuplicateGroup = async () => {
    if (!duplicateTarget) return;
    try {
      await api.post(\`/tutoring/groups/\${duplicateTarget.id}/duplicate\`, {
        newName: dupName || \`\${duplicateTarget.name} (Horario Alterno)\`,
        newSessionDate: dupDate || undefined,
        newStartTime: dupDate ? dupTime : undefined,
      });
      setDuplicateTarget(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al duplicar la configuración del grupo');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--iq-primary)' }}>Gestión de Grupos y Horarios</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Administración de oferta académica, asignación de docentes y control de cupos</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setIsCreateOpen(true)}>+ Crear Nuevo Grupo</Button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Cargando grupos académicos..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {groups.map(group => (
            <Card key={group.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--iq-primary)' }}>{group.code}</span>
                <Badge status={group.full ? 'FULL' : 'PUBLISHED'} size="sm" />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--iq-primary)' }}>{group.name}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{group.moduleTitle}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '14px 0', padding: '10px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                <div>Plantel: <strong>{group.campusName}</strong></div>
                <div>Docente: <strong>{group.teacherName}</strong></div>
                <div>Modalidad: <strong>{group.modality}</strong></div>
                <div>Ocupación: <strong style={{ color: group.full ? 'var(--status-danger)' : 'var(--iq-primary)' }}>{group.currentEnrollment} / {group.capacity} cupos</strong></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <Button size="sm" variant="outline" icon={<Copy size={13} />} onClick={() => { setDuplicateTarget(group); setDupName(group.name + ' (Turno 2)'); }}>
                  Duplicar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Crear Nuevo Grupo de Tutoría">
        <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Nombre del Grupo</label>
            <input type="text" required value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Ej. Tutoring Book 2 - Lesson 5B Speaking" style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Plantel</label>
              <select value={campusId} onChange={e => setCampusId(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Docente</label>
              <select value={teacherId} onChange={e => setTeacherId(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <option value={1}>Ana García (Intermedio)</option>
                <option value={2}>Roberto Sánchez (Avanzado)</option>
                <option value={3}>Laura Morales (Básico)</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Libro</label>
              <select value={bookId} onChange={e => setBookId(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                {books.map(b => <option key={b.id} value={b.id}>Book {b.bookNumber}: {b.title}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Módulo / Lección</label>
              <select value={moduleId} onChange={e => setModuleId(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                {modules.map(m => <option key={m.id} value={m.id}>{m.moduleCode} - {m.title}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Fecha de Primera Sesión</label>
              <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Hora de Inicio</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button type="submit">Publicar Grupo</Button>
          </div>
        </form>
      </Modal>

      {/* DUPLICATE MODAL */}
      <Modal isOpen={!!duplicateTarget} onClose={() => setDuplicateTarget(null)} title="Duplicar Configuración de Grupo">
        {duplicateTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>Crea rápidamente una réplica de este grupo para horarios recurrentes.</p>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Nombre del Nuevo Grupo</label>
              <input type="text" value={dupName} onChange={e => setDupName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Nueva Fecha</label>
                <input type="date" value={dupDate} onChange={e => setDupDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Nueva Hora</label>
                <input type="time" value={dupTime} onChange={e => setDupTime(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button variant="ghost" onClick={() => setDuplicateTarget(null)}>Cancelar</Button>
              <Button onClick={handleDuplicateGroup}>Confirmar Duplicación</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
`);

// 2. AttendanceRegisterPage
w('features/attendance/AttendanceRegisterPage.tsx', `
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
        const data = await api.get<Appointment[]>(\`/appointments/session/\${selectedSessionId}\`);
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
`);

console.log('GroupManagement & AttendanceRegister generated');
