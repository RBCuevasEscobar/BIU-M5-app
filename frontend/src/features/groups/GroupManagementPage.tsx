import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TutoringGroup, Campus, Book, ModuleItem, GroupReport, Appointment } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { 
  Users, 
  Plus, 
  Copy, 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  Download, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  Layers,
  School,
  UserCheck,
  RefreshCw,
  GraduationCap
} from 'lucide-react';

export const GroupManagementPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const isAdminOrSupervisor = hasRole('ROLE_ADMIN') || hasRole('ROLE_SUPERVISOR');
  const isTeacher = hasRole('ROLE_TEACHER') && !isAdminOrSupervisor;

  // State
  const [groups, setGroups] = useState<TutoringGroup[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampus, setSelectedCampus] = useState<number | ''>('');
  const [selectedBook, setSelectedBook] = useState<number | ''>('');
  const [selectedModule, setSelectedModule] = useState<number | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TutoringGroup | null>(null);
  const [duplicateTarget, setDuplicateTarget] = useState<TutoringGroup | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TutoringGroup | null>(null);
  const [detailTarget, setDetailTarget] = useState<TutoringGroup | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState<GroupReport | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enrolled Students Modal State (Requirement: Teacher enrolled students report)
  const [enrolledGroupTarget, setEnrolledGroupTarget] = useState<TutoringGroup | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<Appointment[]>([]);
  const [isEnrolledLoading, setIsEnrolledLoading] = useState(false);

  // Form states (Create)
  const [createForm, setCreateForm] = useState({
    name: '',
    campusId: 1,
    teacherId: 1,
    moduleId: 1,
    capacity: 12,
    modality: 'PRESENTIAL',
    sessionDate: '',
    startTime: '10:00',
    durationMinutes: 60,
    roomOrLink: 'Aula 101'
  });

  // Form states (Edit)
  const [editForm, setEditForm] = useState({
    name: '',
    campusId: 1,
    teacherId: 1,
    moduleId: 1,
    capacity: 12,
    modality: 'PRESENTIAL',
    status: 'PUBLISHED'
  });

  // Form states (Duplicate)
  const [dupForm, setDupForm] = useState({
    newName: '',
    newTeacherId: 1,
    newSessionDate: '',
    newStartTime: '10:00',
    newEndTime: '11:00'
  });

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [groupsData, campusData, booksData, modulesData] = await Promise.all([
        api.get<TutoringGroup[]>('/tutoring/groups'),
        api.get<Campus[]>('/campuses').catch(() => []),
        api.get<Book[]>('/books').catch(() => []),
        api.get<ModuleItem[]>('/modules').catch(() => [])
      ]);

      let groupList = groupsData || [];
      if (isTeacher && user) {
        groupList = groupList.filter(g => 
          (g.teacherName && user.fullName && g.teacherName.toLowerCase().includes(user.firstName.toLowerCase())) ||
          (g.teacherName && user.lastName && g.teacherName.toLowerCase().includes(user.lastName.toLowerCase())) ||
          g.teacherId === user.id
        );
      }

      setGroups(groupList);
      setCampuses(campusData || []);
      setBooks(booksData || []);
      setModules(modulesData || []);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar los grupos de tutoria');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Groups
  const filteredGroups = useMemo(() => {
    return groups.filter(g => {
      const matchesSearch = !searchTerm || 
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.teacherName && g.teacherName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCampus = !selectedCampus || g.campusId === selectedCampus;
      const matchesBook = !selectedBook || g.bookId === selectedBook;
      const matchesModule = !selectedModule || g.moduleId === selectedModule;
      const matchesStatus = !selectedStatus || g.status === selectedStatus;

      return matchesSearch && matchesCampus && matchesBook && matchesModule && matchesStatus;
    });
  }, [groups, searchTerm, selectedCampus, selectedBook, selectedModule, selectedStatus]);

  // Metrics
  const metrics = useMemo(() => {
    const totalGroups = filteredGroups.length;
    const totalCapacity = filteredGroups.reduce((acc, g) => acc + (g.capacity || 0), 0);
    const totalEnrolled = filteredGroups.reduce((acc, g) => acc + (g.currentEnrollment || 0), 0);
    const avgOccupancy = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;
    return { totalGroups, totalCapacity, totalEnrolled, avgOccupancy };
  }, [filteredGroups]);

  // Handle Create Group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await api.groups.create({
        name: createForm.name,
        campusId: Number(createForm.campusId),
        teacherId: Number(createForm.teacherId),
        moduleId: Number(createForm.moduleId),
        capacity: Number(createForm.capacity),
        modality: createForm.modality,
        initialSessionDate: createForm.sessionDate || undefined,
        initialStartTime: createForm.startTime || undefined,
        durationMinutes: Number(createForm.durationMinutes),
        roomOrLink: createForm.roomOrLink
      });
      setSuccessMessage('Grupo creado y publicado exitosamente');
      setIsCreateOpen(false);
      setCreateForm({
        name: '',
        campusId: campuses[0]?.id || 1,
        teacherId: 1,
        moduleId: modules[0]?.id || 1,
        capacity: 12,
        modality: 'PRESENTIAL',
        sessionDate: '',
        startTime: '10:00',
        durationMinutes: 60,
        roomOrLink: 'Aula 101'
      });
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Error al crear el grupo');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (group: TutoringGroup) => {
    setEditTarget(group);
    setEditForm({
      name: group.name,
      campusId: group.campusId || 1,
      teacherId: group.teacherId || 1,
      moduleId: group.moduleId || 1,
      capacity: group.capacity || 12,
      modality: group.modality || 'PRESENTIAL',
      status: group.status || 'PUBLISHED'
    });
  };

  // Handle Update Group
  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await api.groups.update(editTarget.id, {
        name: editForm.name,
        campusId: Number(editForm.campusId),
        teacherId: Number(editForm.teacherId),
        moduleId: Number(editForm.moduleId),
        capacity: Number(editForm.capacity),
        modality: editForm.modality,
        status: editForm.status
      });
      setSuccessMessage('Grupo ' + editTarget.code + ' actualizado correctamente');
      setEditTarget(null);
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar el grupo');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Duplicate Modal
  const handleOpenDuplicate = (group: TutoringGroup) => {
    setDuplicateTarget(group);
    setDupForm({
      newName: group.name + ' (Copia)',
      newTeacherId: group.teacherId || 1,
      newSessionDate: '',
      newStartTime: '10:00',
      newEndTime: '11:00'
    });
  };

  // Handle Duplicate Group
  const handleDuplicateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicateTarget) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await api.groups.duplicate(duplicateTarget.id, {
        newName: dupForm.newName,
        newTeacherId: Number(dupForm.newTeacherId),
        newSessionDate: dupForm.newSessionDate || undefined,
        newStartTime: dupForm.newStartTime || undefined,
        newEndTime: dupForm.newEndTime || undefined
      });
      setSuccessMessage('Grupo duplicado con exito a partir de ' + duplicateTarget.code);
      setDuplicateTarget(null);
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Error al duplicar el grupo');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete / Cancel Group
  const handleDeleteGroup = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await api.groups.delete(deleteTarget.id);
      setSuccessMessage('Grupo ' + deleteTarget.code + ' procesado (eliminado/cancelado)');
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar el grupo');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Load Report
  const handleOpenReport = async () => {
    setIsReportOpen(true);
    setIsReportLoading(true);
    try {
      const data = await api.groups.getReport({
        campusId: selectedCampus || undefined,
        moduleId: selectedModule || undefined,
        bookId: selectedBook || undefined,
        status: selectedStatus || undefined
      });
      setReportData(data);
    } catch (err: any) {
      setError(err?.message || 'Error al generar el reporte de grupos');
    } finally {
      setIsReportLoading(false);
    }
  };

  // Handle Download Groups Summary CSV
  const handleDownloadCsv = async () => {
    try {
      await api.groups.downloadCsv({
        campusId: selectedCampus || undefined,
        moduleId: selectedModule || undefined,
        bookId: selectedBook || undefined,
        status: selectedStatus || undefined
      });
      setSuccessMessage('Reporte CSV de grupos descargado exitosamente');
    } catch (err: any) {
      setError(err?.message || 'Error al descargar el archivo CSV');
    }
  };

  // Open Enrolled Students Report Modal for a Group (Requirement: Teacher enrolled students report)
  const handleOpenEnrolledStudents = async (group: TutoringGroup) => {
    setEnrolledGroupTarget(group);
    setIsEnrolledLoading(true);
    try {
      const data = await api.groups.getEnrolledStudents(group.id);
      setEnrolledStudents(data || []);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar los alumnos inscritos del grupo');
      setEnrolledStudents([]);
    } finally {
      setIsEnrolledLoading(false);
    }
  };

  // Download Enrolled Students CSV (for a single group or all teacher groups)
  const handleDownloadEnrolledStudentsCsv = async (groupId?: number) => {
    try {
      await api.groups.downloadEnrolledStudentsCsv(groupId, {
        campusId: selectedCampus || undefined,
        moduleId: selectedModule || undefined
      });
      setSuccessMessage('Reporte de alumnos inscritos descargado exitosamente en formato CSV');
    } catch (err: any) {
      setError(err?.message || 'Error al exportar el reporte de alumnos');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '30px' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary, #002e6d)', margin: '0 0 6px 0' }}>
            {isTeacher ? 'Mis Grupos de Tutoria' : 'Gestion de Grupos de Tutoria'}
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--color-gray, #758592)', margin: 0 }}>
            {isTeacher 
              ? 'Consulta la asignacion de tus grupos academicos, alumnos inscritos y reportes operativos.' 
              : 'Administracion integral de cohortes, asignacion docente, control de cupos y generacion de reportes.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button variant="ghost" onClick={loadData} disabled={isLoading}>
            <RefreshCw size={15} style={{ marginRight: '6px' }} /> Refrescar
          </Button>
          
          <Button variant="outline" onClick={handleOpenReport}>
            <FileText size={15} style={{ marginRight: '6px' }} />
            {isTeacher ? 'Reporte de Mis Grupos' : 'Reporte Operativo'}
          </Button>

          {/* Enrolled Students CSV Export Button */}
          <Button variant="outline" onClick={() => handleDownloadEnrolledStudentsCsv()}>
            <GraduationCap size={15} style={{ marginRight: '6px' }} />
            {isTeacher ? 'Reporte Alumnos Inscritos (CSV)' : 'Alumnos Inscritos (CSV)'}
          </Button>

          <Button variant="outline" onClick={handleDownloadCsv}>
            <Download size={15} style={{ marginRight: '6px' }} /> Exportar Grupos CSV
          </Button>

          {isAdminOrSupervisor && (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus size={16} style={{ marginRight: '6px' }} /> Nuevo Grupo
            </Button>
          )}
        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md, 8px)', backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} />
            <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{error}</span>
          </div>
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b' }}>×</button>
        </div>
      )}

      {successMessage && (
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md, 8px)', backgroundColor: '#dcfce7', border: '1px solid #22c55e', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} />
            <span style={{ fontSize: '13.5px', fontWeight: 600 }}>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534' }}>×</button>
        </div>
      )}

      {/* METRICS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray, #758592)', textTransform: 'uppercase', margin: 0 }}>Total Grupos</p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary, #002e6d)', margin: '4px 0 0 0' }}>{metrics.totalGroups}</h3>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(0, 46, 109, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary, #002e6d)' }}>
              <Layers size={20} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray, #758592)', textTransform: 'uppercase', margin: 0 }}>Cupo Total Ofrecido</p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-secondary, #0284c7)', margin: '4px 0 0 0' }}>{metrics.totalCapacity}</h3>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(2, 132, 199, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary, #0284c7)' }}>
              <School size={20} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray, #758592)', textTransform: 'uppercase', margin: 0 }}>Alumnos Inscritos</p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a', margin: '4px 0 0 0' }}>{metrics.totalEnrolled}</h3>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(22, 163, 74, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <UserCheck size={20} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray, #758592)', textTransform: 'uppercase', margin: 0 }}>Ocupacion Promedio</p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#ea580c', margin: '4px 0 0 0' }}>{metrics.avgOccupancy}%</h3>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(234, 88, 12, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
              <Users size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* FILTER BAR */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray, #758592)' }} />
            <input
              type="text"
              placeholder="Buscar por grupo, codigo o docente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px 8px 34px',
                borderRadius: 'var(--radius-md, 6px)',
                border: '1px solid var(--border-color, #e2e8f0)',
                fontSize: '13.5px'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={selectedCampus}
              onChange={e => setSelectedCampus(e.target.value ? Number(e.target.value) : '')}
              style={{ padding: '8px 12px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)', fontSize: '13.5px' }}
            >
              <option value="">Todos los Planteles</option>
              {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select
              value={selectedBook}
              onChange={e => setSelectedBook(e.target.value ? Number(e.target.value) : '')}
              style={{ padding: '8px 12px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)', fontSize: '13.5px' }}
            >
              <option value="">Todos los Libros</option>
              {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>

            <select
              value={selectedModule}
              onChange={e => setSelectedModule(e.target.value ? Number(e.target.value) : '')}
              style={{ padding: '8px 12px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)', fontSize: '13.5px' }}
            >
              <option value="">Todos los Modulos</option>
              {modules.map(m => <option key={m.id} value={m.id}>{m.moduleCode} - {m.title}</option>)}
            </select>

            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)', fontSize: '13.5px' }}
            >
              <option value="">Todos los Estados</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="INACTIVE">Inactivo</option>
              <option value="CANCELLED">Cancelado</option>
            </select>

            {(searchTerm || selectedCampus || selectedBook || selectedModule || selectedStatus) && (
              <Button variant="ghost" onClick={() => { setSearchTerm(''); setSelectedCampus(''); setSelectedBook(''); setSelectedModule(''); setSelectedStatus(''); }}>
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* GROUPS TABLE */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner message="Cargando grupos..." />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div style={{ padding: '30px' }}>
            <EmptyState
              icon={<Users size={40} />}
              title="No se encontraron grupos"
              description="No hay cohortes o grupos de tutoria que coincidan con los filtros seleccionados."
              actionText={isAdminOrSupervisor ? "Crear Nuevo Grupo" : undefined}
              onAction={isAdminOrSupervisor ? () => setIsCreateOpen(true) : undefined}
            />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color, #e2e8f0)', color: 'var(--color-gray, #758592)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Codigo / Nombre</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Plantel</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Docente</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Modulo / Leccion</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Inscritos / Cupo</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Modalidad</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Estado</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map(group => {
                  const isFull = group.currentEnrollment >= group.capacity;
                  return (
                    <tr key={group.id} style={{ borderBottom: '1px solid var(--border-color, #f1f5f9)', transition: 'background-color 0.15s' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-primary, #002e6d)' }}>{group.code}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-gray, #758592)' }}>{group.name}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{group.campusName}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{group.teacherName || 'Sin asignar'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>{group.moduleCode}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--color-gray, #758592)' }}>{group.bookTitle}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: isFull ? '#dc2626' : '#16a34a' }}>
                            {group.currentEnrollment} / {group.capacity}
                          </span>
                          {isFull && <Badge status="FULL" size="sm" />}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-gray, #758592)' }}>
                          {group.availableSeats} disponibles
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Badge status={group.modality} size="sm" />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Badge status={group.status} />
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          
                          {/* Enrolled Students Report Button (Requirement: Teacher enrolled students report) */}
                          <button
                            title="Reporte de Alumnos Inscritos"
                            onClick={() => handleOpenEnrolledStudents(group)}
                            style={{ padding: '6px', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '4px', background: '#ffffff', cursor: 'pointer', color: '#16a34a' }}
                          >
                            <GraduationCap size={15} />
                          </button>

                          <button
                            title="Ver Detalle"
                            onClick={() => setDetailTarget(group)}
                            style={{ padding: '6px', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '4px', background: '#ffffff', cursor: 'pointer', color: 'var(--color-primary, #002e6d)' }}
                          >
                            <Eye size={15} />
                          </button>

                          {isAdminOrSupervisor && (
                            <>
                              <button
                                title="Editar Grupo"
                                onClick={() => handleOpenEdit(group)}
                                style={{ padding: '6px', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '4px', background: '#ffffff', cursor: 'pointer', color: '#0284c7' }}
                              >
                                <Edit3 size={15} />
                              </button>

                              <button
                                title="Duplicar Grupo"
                                onClick={() => handleOpenDuplicate(group)}
                                style={{ padding: '6px', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '4px', background: '#ffffff', cursor: 'pointer', color: '#8b5cf6' }}
                              >
                                <Copy size={15} />
                              </button>

                              <button
                                title="Eliminar / Cancelar Grupo"
                                onClick={() => setDeleteTarget(group)}
                                style={{ padding: '6px', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '4px', background: '#ffffff', cursor: 'pointer', color: '#dc2626' }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ENROLLED STUDENTS REPORT MODAL (Requirement: Teacher report for enrolled students per group) */}
      <Modal 
        isOpen={!!enrolledGroupTarget} 
        onClose={() => setEnrolledGroupTarget(null)} 
        title={'Reporte de Alumnos Inscritos: ' + (enrolledGroupTarget?.code || '')}
      >
        {enrolledGroupTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13.5px' }}>
            {/* Header info card */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md, 6px)',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-gray, #758592)', fontWeight: 700, textTransform: 'uppercase' }}>Grupo</div>
                <div style={{ fontWeight: 700, color: 'var(--color-primary, #002e6d)' }}>{enrolledGroupTarget.name}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-gray, #758592)', fontWeight: 700, textTransform: 'uppercase' }}>Plantel</div>
                <div style={{ fontWeight: 600 }}>{enrolledGroupTarget.campusName}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-gray, #758592)', fontWeight: 700, textTransform: 'uppercase' }}>Docente</div>
                <div style={{ fontWeight: 600 }}>{enrolledGroupTarget.teacherName}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-gray, #758592)', fontWeight: 700, textTransform: 'uppercase' }}>Modulo</div>
                <div style={{ fontWeight: 600 }}>{enrolledGroupTarget.moduleCode} - {enrolledGroupTarget.moduleTitle}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-gray, #758592)', fontWeight: 700, textTransform: 'uppercase' }}>Inscritos / Capacidad</div>
                <div style={{ fontWeight: 700, color: enrolledGroupTarget.currentEnrollment >= enrolledGroupTarget.capacity ? '#dc2626' : '#16a34a' }}>
                  {enrolledStudents.length} / {enrolledGroupTarget.capacity} alumnos ({Math.max(0, enrolledGroupTarget.capacity - enrolledStudents.length)} cupos disponibles)
                </div>
              </div>
            </div>

            {/* Students Table */}
            {isEnrolledLoading ? (
              <div style={{ padding: '30px', display: 'flex', justifyContent: 'center' }}>
                <LoadingSpinner message="Cargando lista de alumnos inscritos..." />
              </div>
            ) : enrolledStudents.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <GraduationCap size={36} color="var(--color-gray, #758592)" style={{ margin: '0 auto 8px auto' }} />
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-primary, #002e6d)' }}>No hay alumnos inscritos actualmente</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--color-gray, #758592)' }}>Este grupo aun tiene {enrolledGroupTarget.capacity} cupos disponibles para asignacion.</p>
              </div>
            ) : (
              <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: 'var(--color-gray, #758592)' }}>
                      <th style={{ padding: '10px 12px' }}>#</th>
                      <th style={{ padding: '10px 12px' }}>Matricula</th>
                      <th style={{ padding: '10px 12px' }}>Nombre del Alumno</th>
                      <th style={{ padding: '10px 12px' }}>Folio Cita</th>
                      <th style={{ padding: '10px 12px' }}>Fecha Sesion</th>
                      <th style={{ padding: '10px 12px' }}>Asistencia</th>
                      <th style={{ padding: '10px 12px' }}>Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrolledStudents.map((st, idx) => (
                      <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{idx + 1}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--color-primary, #002e6d)' }}>
                          {st.studentNumber || 'STU-' + st.studentId}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{st.studentName}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--color-gray, #758592)' }}>{st.appointmentNumber}</td>
                        <td style={{ padding: '10px 12px' }}>
                          {st.session?.sessionDate} {st.session?.startTime}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <Badge status={st.attendanceStatus || st.status || 'CONFIRMED'} size="sm" />
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                          {st.grade !== undefined && st.grade !== null ? Number(st.grade).toFixed(2) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <Button 
                variant="outline" 
                onClick={() => handleDownloadEnrolledStudentsCsv(enrolledGroupTarget.id)}
                disabled={enrolledStudents.length === 0}
              >
                <Download size={14} style={{ marginRight: '6px' }} /> Descargar Lista CSV
              </Button>

              <Button onClick={() => setEnrolledGroupTarget(null)}>Cerrar</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* DETAIL MODAL */}
      <Modal isOpen={!!detailTarget} onClose={() => setDetailTarget(null)} title="Detalle del Grupo de Tutoria">
        {detailTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-gray, #758592)' }}>Codigo</label>
                <p style={{ margin: '2px 0 0 0', fontWeight: 700, color: 'var(--color-primary, #002e6d)' }}>{detailTarget.code}</p>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-gray, #758592)' }}>Estado</label>
                <div style={{ marginTop: '2px' }}>
                  <Badge status={detailTarget.status} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-gray, #758592)' }}>Nombre del Grupo</label>
                <p style={{ margin: '2px 0 0 0', fontWeight: 600 }}>{detailTarget.name}</p>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-gray, #758592)' }}>Plantel</label>
                <p style={{ margin: '2px 0 0 0' }}>{detailTarget.campusName}</p>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-gray, #758592)' }}>Docente Asignado</label>
                <p style={{ margin: '2px 0 0 0' }}>{detailTarget.teacherName}</p>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-gray, #758592)' }}>Modulo Academico</label>
                <p style={{ margin: '2px 0 0 0' }}>{detailTarget.moduleCode} - {detailTarget.moduleTitle}</p>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-gray, #758592)' }}>Capacidad y Ocupacion</label>
                <p style={{ margin: '2px 0 0 0' }}>{detailTarget.currentEnrollment} alumnos inscritos de {detailTarget.capacity} cupos ({detailTarget.availableSeats} disponibles)</p>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-gray, #758592)' }}>Modalidad</label>
                <p style={{ margin: '2px 0 0 0' }}>{detailTarget.modality}</p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <Button variant="outline" onClick={() => { const g = detailTarget; setDetailTarget(null); handleOpenEnrolledStudents(g); }}>
                <GraduationCap size={15} style={{ marginRight: '6px' }} /> Ver Alumnos Inscritos
              </Button>
              <Button onClick={() => setDetailTarget(null)}>Cerrar</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* CREATE MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Crear Nuevo Grupo de Tutoria">
        <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Nombre del Grupo *</label>
            <input
              type="text"
              required
              value={createForm.name}
              onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="Ej. Tutoring Book 2 - Lesson 5B Speaking"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Plantel *</label>
              <select
                value={createForm.campusId}
                onChange={e => setCreateForm({ ...createForm, campusId: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
              >
                {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Docente *</label>
              <select
                value={createForm.teacherId}
                onChange={e => setCreateForm({ ...createForm, teacherId: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
              >
                <option value={1}>Ana Garcia (Intermedio)</option>
                <option value={2}>Roberto Sanchez (Avanzado)</option>
                <option value={3}>Laura Morales (Basico)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Modulo / Leccion *</label>
              <select
                value={createForm.moduleId}
                onChange={e => setCreateForm({ ...createForm, moduleId: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
              >
                {modules.map(m => <option key={m.id} value={m.id}>{m.moduleCode} - {m.title}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Capacidad Maxima *</label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={createForm.capacity}
                onChange={e => setCreateForm({ ...createForm, capacity: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Fecha Primer Sesion</label>
              <input
                type="date"
                value={createForm.sessionDate}
                onChange={e => setCreateForm({ ...createForm, sessionDate: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Hora de Inicio</label>
              <input
                type="time"
                value={createForm.startTime}
                onChange={e => setCreateForm({ ...createForm, startTime: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Modalidad *</label>
              <select
                value={createForm.modality}
                onChange={e => setCreateForm({ ...createForm, modality: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
              >
                <option value="PRESENTIAL">Presencial</option>
                <option value="ONLINE">Online</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Aula / Enlace Reunion</label>
              <input
                type="text"
                value={createForm.roomOrLink}
                onChange={e => setCreateForm({ ...createForm, roomOrLink: e.target.value })}
                placeholder="Aula 101 o URL Teams/Meet"
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Publicando...' : 'Crear y Publicar Grupo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={'Editar Grupo: ' + (editTarget?.code || '')}>
        {editTarget && (
          <form onSubmit={handleUpdateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Nombre del Grupo *</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Plantel *</label>
                <select
                  value={editForm.campusId}
                  onChange={e => setEditForm({ ...editForm, campusId: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
                >
                  {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Docente *</label>
                <select
                  value={editForm.teacherId}
                  onChange={e => setEditForm({ ...editForm, teacherId: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
                >
                  <option value={1}>Ana Garcia (Intermedio)</option>
                  <option value={2}>Roberto Sanchez (Avanzado)</option>
                  <option value={3}>Laura Morales (Basico)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Capacidad Maxima *</label>
                <input
                  type="number"
                  min={editTarget.currentEnrollment || 1}
                  max={50}
                  required
                  value={editForm.capacity}
                  onChange={e => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Estado *</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
                >
                  <option value="PUBLISHED">Publicado</option>
                  <option value="INACTIVE">Inactivo</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button variant="ghost" type="button" onClick={() => setEditTarget(null)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* DUPLICATE MODAL */}
      <Modal isOpen={!!duplicateTarget} onClose={() => setDuplicateTarget(null)} title={'Duplicar Grupo: ' + (duplicateTarget?.code || '')}>
        {duplicateTarget && (
          <form onSubmit={handleDuplicateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Nombre del Nuevo Grupo *</label>
              <input
                type="text"
                required
                value={dupForm.newName}
                onChange={e => setDupForm({ ...dupForm, newName: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Fecha Sesion *</label>
                <input
                  type="date"
                  value={dupForm.newSessionDate}
                  onChange={e => setDupForm({ ...dupForm, newSessionDate: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Hora de Inicio</label>
                <input
                  type="time"
                  value={dupForm.newStartTime}
                  onChange={e => setDupForm({ ...dupForm, newStartTime: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button variant="ghost" type="button" onClick={() => setDuplicateTarget(null)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Duplicando...' : 'Confirmar Duplicacion'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* DELETE / CANCEL CONFIRMATION MODAL */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirmar Eliminacion / Cancelacion de Grupo">
        {deleteTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
            <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--radius-md, 6px)', color: '#991b1b' }}>
              <p style={{ margin: 0, fontWeight: 700 }}>Advertencia de Integridad Historica:</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12.5px' }}>
                {deleteTarget.currentEnrollment > 0
                  ? 'Este grupo tiene ' + deleteTarget.currentEnrollment + ' alumnos inscritos y registros academicos. Se ejecutara una eliminacion logica cambiando el estado a CANCELADO para preservar el historial.'
                  : 'Este grupo no tiene alumnos inscritos y sera removido de forma segura.'}
              </p>
            </div>

            <div>
              <p style={{ margin: 0 }}><strong>Grupo:</strong> {deleteTarget.code} - {deleteTarget.name}</p>
              <p style={{ margin: '4px 0 0 0' }}><strong>Plantel:</strong> {deleteTarget.campusName}</p>
              <p style={{ margin: '4px 0 0 0' }}><strong>Docente:</strong> {deleteTarget.teacherName}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Volver</Button>
              <Button variant="danger" onClick={handleDeleteGroup} disabled={isSubmitting}>
                {isSubmitting ? 'Procesando...' : 'Confirmar Eliminacion'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* REPORT MODAL */}
      <Modal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} title="Reporte Operativo de Grupos de Tutoria">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13.5px' }}>
          {isReportLoading ? (
            <div style={{ padding: '30px', display: 'flex', justifyContent: 'center' }}>
              <LoadingSpinner message="Generando reporte..." />
            </div>
          ) : reportData ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: 'var(--radius-md, 6px)' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-gray, #758592)' }}>Alcance (Scope): <strong>{reportData.scope}</strong></div>
                  <div style={{ fontSize: '12px', color: 'var(--color-gray, #758592)' }}>Generado por: <strong>{reportData.generatedBy}</strong></div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="outline" onClick={() => handleDownloadEnrolledStudentsCsv()}>
                    <GraduationCap size={14} style={{ marginRight: '6px' }} /> Alumnos (CSV)
                  </Button>
                  <Button variant="outline" onClick={handleDownloadCsv}>
                    <Download size={14} style={{ marginRight: '6px' }} /> Grupos (CSV)
                  </Button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
                <div style={{ padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-gray, #758592)' }}>Grupos</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary, #002e6d)' }}>{reportData.totalGroups}</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-gray, #758592)' }}>Cupos</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0284c7' }}>{reportData.totalCapacity}</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-gray, #758592)' }}>Inscritos</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#16a34a' }}>{reportData.totalEnrolled}</div>
                </div>
                <div style={{ padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-gray, #758592)' }}>Ocupacion</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#ea580c' }}>{reportData.averageOccupancyPercentage}%</div>
                </div>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '8px 10px' }}>Codigo</th>
                      <th style={{ padding: '8px 10px' }}>Docente</th>
                      <th style={{ padding: '8px 10px' }}>Modulo</th>
                      <th style={{ padding: '8px 10px' }}>Cupos</th>
                      <th style={{ padding: '8px 10px' }}>Ocupacion</th>
                      <th style={{ padding: '8px 10px' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.items.map(item => (
                      <tr key={item.groupId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 700 }}>{item.code}</td>
                        <td style={{ padding: '8px 10px' }}>{item.teacherName}</td>
                        <td style={{ padding: '8px 10px' }}>{item.moduleCode}</td>
                        <td style={{ padding: '8px 10px' }}>{item.currentEnrollment}/{item.capacity}</td>
                        <td style={{ padding: '8px 10px' }}>{item.occupancyPercentage}%</td>
                        <td style={{ padding: '8px 10px' }}>
                          <Badge status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={() => setIsReportOpen(false)}>Cerrar</Button>
              </div>
            </>
          ) : (
            <p>No hay datos disponibles para este reporte.</p>
          )}
        </div>
      </Modal>

    </div>
  );
};
