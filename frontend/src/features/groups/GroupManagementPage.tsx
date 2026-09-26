import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TutoringGroup, Campus, Book, ModuleItem, GroupReport } from '../../types';
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
  XCircle
} from 'lucide-react';

export const GroupManagementPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const isAdminOrSupervisor = hasRole('ADMIN') || hasRole('SUPERVISOR');
  const isTeacher = hasRole('TEACHER') && !isAdminOrSupervisor;

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
        // Teacher view filter by teacher ID if available
        groupList = groupList.filter(g => g.teacherName?.toLowerCase().includes(user.firstName.toLowerCase()) || g.teacherId === user.id);
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
      setSuccessMessage(`Grupo ${editTarget.code} actualizado correctamente`);
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
      newName: `${group.name} (Copia)`,
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
      setSuccessMessage(`Grupo duplicado con exito a partir de ${duplicateTarget.code}`);
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
      setSuccessMessage(`Grupo ${deleteTarget.code} procesado (eliminado/cancelado)`);
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

  // Handle Download CSV
  const handleDownloadCsv = async () => {
    try {
      await api.groups.downloadCsv({
        campusId: selectedCampus || undefined,
        moduleId: selectedModule || undefined,
        bookId: selectedBook || undefined,
        status: selectedStatus || undefined
      });
      setSuccessMessage('Reporte CSV descargado exitosamente');
    } catch (err: any) {
      setError(err?.message || 'Error al descargar el archivo CSV');
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
              ? 'Consulta la asignacion de tus grupos academicos, cupos y reportes operativos.' 
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

          <Button variant="outline" onClick={handleDownloadCsv}>
            <Download size={15} style={{ marginRight: '6px' }} /> Exportar CSV
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
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary, #002e6d)', margin: '4px 0 0 0' }}>{metrics.totalCapacity}</h3>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(94, 179, 228, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
              <Users size={20} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray, #758592)', textTransform: 'uppercase', margin: 0 }}>Alumnos Inscritos</p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a', margin: '4px 0 0 0' }}>{metrics.totalEnrolled}</h3>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <UserCheck size={20} />
            </div>
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray, #758592)', textTransform: 'uppercase', margin: 0 }}>Ocupacion Promedio</p>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: metrics.avgOccupancy > 80 ? '#ea580c' : 'var(--color-primary, #002e6d)', margin: '4px 0 0 0' }}>
                {metrics.avgOccupancy}%
              </h3>
            </div>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(234, 88, 12, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
              <School size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* FILTER BAR */}
      <Card style={{ padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray, #758592)' }} />
            <input
              type="text"
              placeholder="Buscar por codigo, nombre o docente..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: 'var(--radius-md, 6px)',
                border: '1px solid var(--border-color, #e2e8f0)',
                fontSize: '13.5px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <select
              value={selectedCampus}
              onChange={e => setSelectedCampus(e.target.value ? Number(e.target.value) : '')}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)', fontSize: '13px' }}
            >
              <option value="">Todos los Planteles</option>
              {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <select
              value={selectedBook}
              onChange={e => setSelectedBook(e.target.value ? Number(e.target.value) : '')}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)', fontSize: '13px' }}
            >
              <option value="">Todos los Libros</option>
              {books.map(b => <option key={b.id} value={b.id}>Book {b.bookNumber}: {b.title}</option>)}
            </select>
          </div>

          <div>
            <select
              value={selectedModule}
              onChange={e => setSelectedModule(e.target.value ? Number(e.target.value) : '')}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)', fontSize: '13px' }}
            >
              <option value="">Todos los Modulos</option>
              {modules.map(m => <option key={m.id} value={m.id}>{m.moduleCode} - {m.title}</option>)}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)', fontSize: '13px' }}
            >
              <option value="">Todos los Estados</option>
              <option value="PUBLISHED">Publicado (Activo)</option>
              <option value="INACTIVE">Inactivo</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>
        </div>
      </Card>

      {/* MAIN DATA TABLE */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner message="Cargando grupos de tutoria..." />
          </div>
        ) : filteredGroups.length === 0 ? (
          <EmptyState
            title="No se encontraron grupos de tutoria"
            description="Intenta modificar los filtros de busqueda o crear un nuevo grupo."
            actionText={isAdminOrSupervisor ? "Crear Nuevo Grupo" : undefined}
            onAction={isAdminOrSupervisor ? () => setIsCreateOpen(true) : undefined}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-primary, #002e6d)' }}>Codigo</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-primary, #002e6d)' }}>Nombre del Grupo</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-primary, #002e6d)' }}>Plantel</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-primary, #002e6d)' }}>Docente</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-primary, #002e6d)' }}>Nivel / Modulo</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-primary, #002e6d)' }}>Ocupacion</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-primary, #002e6d)' }}>Estado</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-primary, #002e6d)', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map(group => {
                  const cap = group.capacity || 12;
                  const enr = group.currentEnrollment || 0;
                  const pct = Math.round((enr / cap) * 100);
                  
                  return (
                    <tr key={group.id} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)', transition: 'background-color 0.15s' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--color-primary, #002e6d)' }}>
                        {group.code}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                        {group.name}
                        <div style={{ fontSize: '11.5px', color: 'var(--color-gray, #758592)' }}>
                          Modalidad: {group.modality || 'PRESENTIAL'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{group.campusName || 'N/A'}</td>
                      <td style={{ padding: '12px 16px' }}>{group.teacherName || 'Sin asignar'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{group.moduleCode} - {group.moduleTitle}</div>
                        {group.bookTitle && <div style={{ fontSize: '11.5px', color: 'var(--color-gray, #758592)' }}>Book {group.bookNumber}: {group.bookTitle}</div>}
                      </td>
                      <td style={{ padding: '12px 16px', minWidth: '130px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700 }}>{enr} / {cap}</span>
                          <span style={{ color: pct >= 100 ? '#ea580c' : 'var(--color-gray, #758592)' }}>{pct}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${Math.min(100, pct)}%`, 
                              height: '100%', 
                              backgroundColor: pct >= 100 ? '#ea580c' : pct > 70 ? '#5eb3e4' : '#16a34a' 
                            }} 
                          />
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Badge status={group.status} />
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                          <button
                            title="Ver Detalle"
                            onClick={() => setDetailTarget(group)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary, #002e6d)', padding: '4px' }}
                          >
                            <Eye size={16} />
                          </button>

                          {isAdminOrSupervisor && (
                            <>
                              <button
                                title="Editar Grupo"
                                onClick={() => handleOpenEdit(group)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', padding: '4px' }}
                              >
                                <Edit3 size={16} />
                              </button>

                              <button
                                title="Duplicar Grupo"
                                onClick={() => handleOpenDuplicate(group)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', padding: '4px' }}
                              >
                                <Copy size={16} />
                              </button>

                              <button
                                title="Eliminar / Cancelar Grupo"
                                onClick={() => setDeleteTarget(group)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '4px' }}
                              >
                                <Trash2 size={16} />
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="ghost" type="button" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Publicando...' : 'Publicar Grupo'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title={`Editar Grupo: ${editTarget?.code || ''}`}>
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
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Modulo / Leccion *</label>
                <select
                  value={editForm.moduleId}
                  onChange={e => setEditForm({ ...editForm, moduleId: Number(e.target.value) })}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
                >
                  {modules.map(m => <option key={m.id} value={m.id}>{m.moduleCode} - {m.title}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                  Capacidad Maxima * (Min: {editTarget.currentEnrollment})
                </label>
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Modalidad</label>
                <select
                  value={editForm.modality}
                  onChange={e => setEditForm({ ...editForm, modality: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
                >
                  <option value="PRESENTIAL">Presencial</option>
                  <option value="ONLINE">En Linea (Online)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Estado</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
                >
                  <option value="PUBLISHED">Publicado (Activo)</option>
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
      <Modal isOpen={!!duplicateTarget} onClose={() => setDuplicateTarget(null)} title="Duplicar Configuracion de Grupo">
        {duplicateTarget && (
          <form onSubmit={handleDuplicateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '13.5px', color: 'var(--color-gray, #758592)', margin: 0 }}>
              Crea rapidamente una replica de <strong>{duplicateTarget.code}</strong> para horarios recurrentes.
            </p>

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

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Docente Asignado</label>
              <select
                value={dupForm.newTeacherId}
                onChange={e => setDupForm({ ...dupForm, newTeacherId: Number(e.target.value) })}
                style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md, 6px)', border: '1px solid var(--border-color, #e2e8f0)' }}
              >
                <option value={1}>Ana Garcia (Intermedio)</option>
                <option value={2}>Roberto Sanchez (Avanzado)</option>
                <option value={3}>Laura Morales (Basico)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Nueva Fecha</label>
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
                  ? `Este grupo tiene ${deleteTarget.currentEnrollment} alumnos inscritos y registros academicos. Se ejecutara una eliminacion logica cambiando el estado a CANCELADO para preservar el historial.`
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
                <Button variant="outline" onClick={handleDownloadCsv}>
                  <Download size={14} style={{ marginRight: '6px' }} /> Descargar CSV
                </Button>
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
