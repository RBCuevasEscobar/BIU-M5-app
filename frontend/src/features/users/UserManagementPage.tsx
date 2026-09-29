import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { api, ApiError } from '../../services/api';
import {
  User,
  PageResponse,
  CreateUserPayload,
  UpdateUserPayload,
  UserReport,
  AuditLog,
  Campus,
  AcademicLevel,
  Book,
  ModuleItem
} from '../../types';
import {
  CreateUserModal,
  EditUserModal,
  ChangeRoleModal,
  ToggleStatusModal,
  AdminPasswordResetModal,
  AuditLogsModal,
  DeleteUserModal,
  UserReportModal
} from './UserModals';
import {
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  Briefcase,
  Search,
  Filter,
  Plus,
  Download,
  BarChart3,
  Edit2,
  Shield,
  KeyRound,
  History,
  Trash2,
  AlertTriangle,
  RotateCcw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();

  const [usersPage, setUsersPage] = useState<PageResponse<User> | null>(null);
  const [report, setReport] = useState<UserReport | null>(null);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [academicLevels, setAcademicLevels] = useState<AcademicLevel[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortField, setSortField] = useState<string>('id');
  const [sortDir, setSortDir] = useState<string>('asc');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isRoleOpen, setIsRoleOpen] = useState<boolean>(false);
  const [isStatusOpen, setIsStatusOpen] = useState<boolean>(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState<boolean>(false);
  const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);

  // Selected User
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userAuditLogs, setUserAuditLogs] = useState<AuditLog[]>([]);
  const [isAuditLoading, setIsAuditLoading] = useState<boolean>(false);

  // Form states
  const [createForm, setCreateForm] = useState<CreateUserPayload>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'ROLE_STUDENT',
    status: 'ACTIVE',
    campusId: undefined,
    studentNumber: '',
    currentLevelId: undefined,
    currentBookId: undefined,
    currentModuleId: undefined,
    specialty: '',
    hireDate: '',
    employeeNumber: '',
  });

  const [editForm, setEditForm] = useState<UpdateUserPayload>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'ACTIVE',
    campusId: undefined,
    studentNumber: '',
    currentLevelId: undefined,
    currentBookId: undefined,
    currentModuleId: undefined,
    specialty: '',
    hireDate: '',
    employeeNumber: '',
  });

  const [newRole, setNewRole] = useState<string>('ROLE_STUDENT');
  const [adminNewPassword, setAdminNewPassword] = useState<string>('');
  const [showAdminPass, setShowAdminPass] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await api.users.getPaged({
        page,
        size,
        sort: sortField + ',' + sortDir,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });
      setUsersPage(resp);
    } catch (err: any) {
      setError(err instanceof ApiError ? err.message : 'Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReport = async () => {
    try {
      const rep = await api.users.getReport();
      setReport(rep);
    } catch (e) {
      console.warn('Could not load user stats', e);
    }
  };

  const fetchCampuses = async () => {
    try {
      const camps = await api.get<Campus[]>('/campuses');
      setCampuses(camps || []);
      if (camps && camps.length > 0 && !createForm.campusId) {
        setCreateForm(prev => ({ ...prev, campusId: camps[0].id }));
      }
    } catch (e) {
      console.warn('Could not load campuses', e);
    }
  };

  const fetchAcademicCatalogs = async () => {
    try {
      const [lvls, bks, mods] = await Promise.all([
        api.get<AcademicLevel[]>('/academic-levels'),
        api.get<Book[]>('/books'),
        api.get<ModuleItem[]>('/modules'),
      ]);
      setAcademicLevels(lvls || []);
      setBooks(bks || []);
      setModules(mods || []);
    } catch (e) {
      console.warn('Could not load academic catalogs', e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, size, roleFilter, statusFilter, sortField, sortDir]);

  useEffect(() => {
    fetchReport();
    fetchCampuses();
    fetchAcademicCatalogs();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setPage(0);
  };

  const handleExportCsv = async () => {
    try {
      await api.users.downloadCsv(search, roleFilter, statusFilter);
    } catch (err: any) {
      alert('Error al descargar archivo CSV: ' + err.message);
    }
  };

  const openEditModal = (u: User) => {
    setSelectedUser(u);
    const cId = u.studentProfile?.campusId || u.teacherProfile?.campusId || undefined;
    setEditForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone || '',
      status: u.status,
      campusId: cId,
      studentNumber: u.studentProfile?.studentNumber || '',
      currentLevelId: u.studentProfile?.currentLevelId || undefined,
      currentBookId: u.studentProfile?.currentBookId || undefined,
      currentModuleId: u.studentProfile?.currentModuleId || undefined,
      specialty: u.teacherProfile?.specialty || '',
      hireDate: u.teacherProfile?.hireDate || '',
      employeeNumber: u.teacherProfile?.employeeNumber || '',
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const openRoleModal = (u: User) => {
    setSelectedUser(u);
    const mainRole = u.roles && u.roles.length > 0 ? u.roles[0] : 'ROLE_STUDENT';
    setNewRole(mainRole);
    setFormError(null);
    setIsRoleOpen(true);
  };

  const openStatusModal = (u: User) => {
    setSelectedUser(u);
    setFormError(null);
    setIsStatusOpen(true);
  };

  const openPasswordResetModal = (u: User) => {
    setSelectedUser(u);
    setAdminNewPassword('');
    setShowAdminPass(false);
    setFormError(null);
    setIsPasswordResetOpen(true);
  };

  const openAuditModal = async (u: User) => {
    setSelectedUser(u);
    setIsAuditOpen(true);
    setIsAuditLoading(true);
    try {
      const logs = await api.users.getAuditLogs(u.id);
      setUserAuditLogs(logs || []);
    } catch (e) {
      console.warn('Could not load audit logs', e);
      setUserAuditLogs([]);
    } finally {
      setIsAuditLoading(false);
    }
  };

  const openDeleteModal = (u: User) => {
    setSelectedUser(u);
    setFormError(null);
    setIsDeleteOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await api.users.create(createForm);
      setIsCreateOpen(false);
      setCreateForm({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'ROLE_STUDENT',
        status: 'ACTIVE',
        campusId: campuses[0]?.id,
        studentNumber: '',
        currentLevelId: undefined,
        currentBookId: undefined,
        currentModuleId: undefined,
        specialty: '',
        hireDate: '',
        employeeNumber: '',
      });
      fetchUsers();
      fetchReport();
    } catch (err: any) {
      setFormError(err instanceof ApiError ? err.message : 'Error al crear usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      await api.users.update(selectedUser.id, editForm);
      setIsEditOpen(false);
      fetchUsers();
      fetchReport();
    } catch (err: any) {
      setFormError(err instanceof ApiError ? err.message : 'Error al actualizar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      await api.users.updateRoles(selectedUser.id, { role: newRole });
      setIsRoleOpen(false);
      fetchUsers();
      fetchReport();
    } catch (err: any) {
      setFormError(err instanceof ApiError ? err.message : 'Error al cambiar rol');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!selectedUser) return;
    setFormError(null);
    setIsSubmitting(true);
    const newStatus = selectedUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.users.updateStatus(selectedUser.id, newStatus);
      setIsStatusOpen(false);
      fetchUsers();
      fetchReport();
    } catch (err: any) {
      setFormError(err instanceof ApiError ? err.message : 'Error al modificar estado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (adminNewPassword.length < 6) {
      setFormError('La contrasena debe tener al menos 6 caracteres');
      return;
    }
    setFormError(null);
    setIsSubmitting(true);
    try {
      await api.users.adminResetPassword(selectedUser.id, { newPassword: adminNewPassword });
      setIsPasswordResetOpen(false);
      setAdminNewPassword('');
      alert('Contrasena restablecida exitosamente para ' + selectedUser.username);
    } catch (err: any) {
      setFormError(err instanceof ApiError ? err.message : 'Error al restablecer la contrasena');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setFormError(null);
    setIsSubmitting(true);
    try {
      await api.users.delete(selectedUser.id);
      setIsDeleteOpen(false);
      fetchUsers();
      fetchReport();
    } catch (err: any) {
      setFormError(err instanceof ApiError ? err.message : 'Error al eliminar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--iq-primary)' }}>Gestion Integral de Usuarios</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Administra cuentas, roles, permisos y estatus academico del personal y estudiantes</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="outline"
            icon={<Download size={16} />}
            onClick={handleExportCsv}
          >
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            icon={<BarChart3 size={16} />}
            onClick={() => setIsReportOpen(true)}
          >
            Metricas Globales
          </Button>
          <Button
            icon={<Plus size={16} />}
            onClick={() => {
              setFormError(null);
              setIsCreateOpen(true);
            }}
          >
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {report && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--iq-primary-light)', color: 'var(--iq-primary)' }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Total Usuarios</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--iq-primary)' }}>{report.totalUsers}</div>
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#e6f4ea', color: 'var(--iq-success)' }}>
                <UserCheck size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Usuarios Activos</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--iq-success)' }}>{report.activeUsers}</div>
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#feefe3', color: 'var(--iq-danger)' }}>
                <UserX size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Inactivos / Bloqueados</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--iq-danger)' }}>{report.inactiveUsers + report.suspendedUsers}</div>
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#e8f0fe', color: 'var(--iq-secondary)' }}>
                <GraduationCap size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Estudiantes</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--iq-secondary)' }}>{report.roleDistribution ? report.roleDistribution['ROLE_STUDENT'] || 0 : 0}</div>
              </div>
            </div>
          </Card>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#fef7e0', color: 'var(--iq-gold)' }}>
                <Briefcase size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Docentes</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--iq-gold)' }}>{report.roleDistribution ? report.roleDistribution['ROLE_TEACHER'] || 0 : 0}</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, usuario, correo, matricula o nomina..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '13.5px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
              style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13.5px', outline: 'none' }}
            >
              <option value="">Todos los Roles</option>
              <option value="ROLE_ADMIN">ROLE_ADMIN</option>
              <option value="ROLE_SUPERVISOR">ROLE_SUPERVISOR</option>
              <option value="ROLE_TEACHER">ROLE_TEACHER</option>
              <option value="ROLE_STUDENT">ROLE_STUDENT</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              style={{ padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '13.5px', outline: 'none' }}
            >
              <option value="">Todos los Estados</option>
              <option value="ACTIVE">Activos</option>
              <option value="INACTIVE">Inactivos</option>
              <option value="SUSPENDED">Suspendidos</option>
              <option value="PENDING_VERIFICATION">Pendientes</option>
            </select>

            <Button type="submit" variant="secondary" icon={<Filter size={14} />}>
              Filtrar
            </Button>

            {(search || roleFilter || statusFilter) && (
              <Button type="button" variant="outline" icon={<RotateCcw size={14} />} onClick={handleResetFilters}>
                Limpiar
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Users Table */}
      <Card>
        {isLoading ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <LoadingSpinner message="Cargando directorio de usuarios..." />
          </div>
        ) : error ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--iq-danger)' }}>
            <AlertTriangle size={32} style={{ marginBottom: '8px' }} />
            <div>{error}</div>
            <Button variant="outline" size="sm" onClick={fetchUsers} style={{ marginTop: '12px' }}>
              Reintentar
            </Button>
          </div>
        ) : !usersPage || usersPage.content.length === 0 ? (
          <EmptyState
            icon={<Users size={48} />}
            title="No se encontraron usuarios"
            description="Intenta ajustar tus criterios de busqueda o agrega un nuevo usuario al sistema."
          />
        ) : (
          <div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-card-header)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Usuario</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Nombre Completo</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Rol</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Plantel</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Estado</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>Registro</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usersPage.content.map((u) => {
                    const campusLabel = u.studentProfile?.campusName || u.teacherProfile?.campusName || 'General / Central';
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--iq-primary)' }}>{u.username}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                          {u.phone && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.phone}</div>}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {u.roles?.map(r => (
                              <Badge key={r} status={r} />
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-main)' }}>
                          {campusLabel}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <Badge status={u.status} />
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-MX') : 'N/A'}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => openEditModal(u)}
                              title="Editar Perfil"
                              style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#ffffff', cursor: 'pointer', color: 'var(--text-main)' }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => openRoleModal(u)}
                              title="Modificar Rol"
                              style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#ffffff', cursor: 'pointer', color: 'var(--iq-secondary-hover)' }}
                            >
                              <Shield size={14} />
                            </button>
                            <button
                              onClick={() => openStatusModal(u)}
                              title={u.status === 'ACTIVE' ? 'Desactivar Usuario' : 'Activar Usuario'}
                              style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#ffffff', cursor: 'pointer', color: u.status === 'ACTIVE' ? 'var(--iq-danger)' : 'var(--iq-success)' }}
                            >
                              {u.status === 'ACTIVE' ? <UserX size={14} /> : <UserCheck size={14} />}
                            </button>
                            <button
                              onClick={() => openPasswordResetModal(u)}
                              title="Restablecer Contrasena"
                              style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#ffffff', cursor: 'pointer', color: 'var(--iq-gold)' }}
                            >
                              <KeyRound size={14} />
                            </button>
                            <button
                              onClick={() => openAuditModal(u)}
                              title="Historial de Auditoria"
                              style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#ffffff', cursor: 'pointer', color: 'var(--text-muted)' }}
                            >
                              <History size={14} />
                            </button>
                            {currentUser?.id !== u.id && (
                              <button
                                onClick={() => openDeleteModal(u)}
                                title="Desactivar / Eliminar"
                                style={{ padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px', background: '#ffffff', cursor: 'pointer', color: 'var(--iq-danger)' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '16px',
              marginTop: '16px',
              borderTop: '1px solid var(--border-color)',
              fontSize: '13px',
              color: 'var(--text-muted)',
            }}>
              <div>
                Mostrando {usersPage.pageNumber * usersPage.pageSize + 1} a {Math.min((usersPage.pageNumber + 1) * usersPage.pageSize, usersPage.totalElements)} de {usersPage.totalElements} usuarios
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Filas por pagina:</span>
                  <select
                    value={size}
                    onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
                    style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none' }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                  >
                    <ChevronLeft size={14} />
                    <span>Anterior</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={usersPage.last || page >= usersPage.totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                  >
                    <span>Siguiente</span>
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        form={createForm}
        setForm={setCreateForm}
        onSubmit={handleCreateSubmit}
        campuses={campuses}
        levels={academicLevels}
        books={books}
        modules={modules}
        formError={formError}
        isSubmitting={isSubmitting}
      />

      <EditUserModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={selectedUser}
        form={editForm}
        setForm={setEditForm}
        onSubmit={handleEditSubmit}
        campuses={campuses}
        levels={academicLevels}
        books={books}
        modules={modules}
        formError={formError}
        isSubmitting={isSubmitting}
      />

      <ChangeRoleModal
        isOpen={isRoleOpen}
        onClose={() => setIsRoleOpen(false)}
        user={selectedUser}
        newRole={newRole}
        setNewRole={setNewRole}
        onSubmit={handleRoleSubmit}
        formError={formError}
        isSubmitting={isSubmitting}
      />

      <ToggleStatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        user={selectedUser}
        onConfirm={handleStatusToggle}
        formError={formError}
        isSubmitting={isSubmitting}
      />

      <AdminPasswordResetModal
        isOpen={isPasswordResetOpen}
        onClose={() => setIsPasswordResetOpen(false)}
        user={selectedUser}
        newPassword={adminNewPassword}
        setNewPassword={setAdminNewPassword}
        showPass={showAdminPass}
        setShowPass={setShowAdminPass}
        onSubmit={handlePasswordResetSubmit}
        formError={formError}
        isSubmitting={isSubmitting}
      />

      <AuditLogsModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        user={selectedUser}
        logs={userAuditLogs}
        isLoading={isAuditLoading}
      />

      <DeleteUserModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        user={selectedUser}
        onConfirm={handleDeleteConfirm}
        formError={formError}
        isSubmitting={isSubmitting}
      />

      <UserReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        report={report}
      />
    </div>
  );
};
