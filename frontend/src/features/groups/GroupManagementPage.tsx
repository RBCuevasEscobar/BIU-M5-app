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
      api.get<ModuleItem[]>(`/modules?bookId=${bookId}`).then(setModules);
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
      await api.post(`/tutoring/groups/${duplicateTarget.id}/duplicate`, {
        newName: dupName || `${duplicateTarget.name} (Horario Alterno)`,
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
