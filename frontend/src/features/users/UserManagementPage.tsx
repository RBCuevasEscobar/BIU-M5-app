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
  Campus
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
  });

  const [editForm, setEditForm] = useState<UpdateUserPayload>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    status: 'ACTIVE',
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
        sort: `${sortField},${sortDir}`,
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

  useEffect(() => {
    fetchUsers();
  }, [page, size, roleFilter, statusFilter, sortField, sortDir]);

  useEffect(() => {
    fetchReport();
    fetchCampuses();
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
    setEditForm({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone || '',
      status: u.status,
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
      alert(`Contrasena restablecida exitosamente para el usuario ${selectedUser.username}`);
    } catch (err: any) {
      setFormError(err instanceof ApiError ? err.message : 'Error al restablecer contrasena');
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
      setFormError(err instanceof ApiError ? err.message : 'Error al desactivar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        backgroundColor: '#ffffff',
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--iq-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--iq-primary)',
            }}>
              <Users size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--iq-primary)', margin: 0 }}>
                Gestion de Usuarios
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Administracion integral de cuentas, roles, permisos y estados en la plataforma IQ English
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button variant="outline" onClick={() => setIsReportOpen(true)}>
            <BarChart3 size={16} />
            <span>Estadisticas</span>
          </Button>
          <Button variant="outline" onClick={handleExportCsv}>
            <Download size={16} />
            <span>Exportar CSV</span>
          </Button>
          <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} />
            <span>Nuevo Usuario</span>
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      {report && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--iq-primary-light)', color: 'var(--iq-primary)' }}>
                <Users size={22} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Usuarios</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--iq-primary)' }}>{report.totalUsers}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--iq-success)' }}>
                <UserCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Usuarios Activos</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--iq-success)' }}>{report.activeUsers}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--iq-danger)' }}>
                <UserX size={22} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Inactivos / Susp.</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--iq-danger)' }}>{report.inactiveUsers + report.suspendedUsers}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(94, 179, 228, 0.15)', color: 'var(--iq-secondary-hover)' }}>
                <Briefcase size={22} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Docentes</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--iq-secondary-hover)' }}>{report.roleDistribution?.TEACHER || 0}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--iq-gold)' }}>
                <GraduationCap size={22} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Estudiantes</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--iq-gold)' }}>{report.roleDistribution?.STUDENT || 0}</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filter & Search Bar */}
      <Card>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 250px', position: 'relative' }}>
            <Search size={16} color="var(--iq-gray)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, usuario, email o telefono..."
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '13.5px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '13.5px',
                backgroundColor: '#ffffff',
                outline: 'none',
              }}
            >
              <option value="">Todos los Roles</option>
              <option value="ROLE_ADMIN">ADMINISTRADOR</option>
              <option value="ROLE_SUPERVISOR">SUPERVISOR</option>
              <option value="ROLE_TEACHER">DOCENTE</option>
              <option value="ROLE_STUDENT">ESTUDIANTE</option>
            </select>
          </div>

          <div style={{ flex: '0 1 160px' }}>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '13.5px',
                backgroundColor: '#ffffff',
                outline: 'none',
              }}
            >
              <option value="">Todos los Estados</option>
              <option value="ACTIVE">ACTIVO</option>
              <option value="INACTIVE">INACTIVO</option>
              <option value="SUSPENDED">SUSPENDIDO</option>
            </select>
          </div>

          <Button type="submit" variant="primary">
            <Filter size={15} />
            <span>Filtrar</span>
          </Button>

          {(search || roleFilter || statusFilter) && (
            <Button type="button" variant="ghost" onClick={handleResetFilters}>
              <RotateCcw size={15} />
              <span>Limpiar</span>
            </Button>
          )}
        </form>
      </Card>

      {/* Users Table */}
      <Card>
        {isLoading ? (
          <div style={{ padding: '48px', display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner message="Cargando directorio de usuarios..." />
          </div>
        ) : error ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--iq-danger)' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 8px' }} />
            <div>{error}</div>
            <Button variant="outline" onClick={fetchUsers} style={{ marginTop: '12px' }}>Reintentar</Button>
          </div>
        ) : !usersPage || usersPage.content.length === 0 ? (
          <EmptyState
            title="No se encontraron usuarios"
            description="Intenta ajustar tus criterios de busqueda o filtros."
            actionText="Limpiar Filtros"
            onAction={handleResetFilters}
            icon={<Users size={48} color="var(--iq-secondary)" />}
          />
        ) : (
          <div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--iq-primary)', textTransform: 'uppercase', fontSize: '11.5px', letterSpacing: '0.5px' }}>Usuario</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--iq-primary)', textTransform: 'uppercase', fontSize: '11.5px', letterSpacing: '0.5px' }}>Contacto</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--iq-primary)', textTransform: 'uppercase', fontSize: '11.5px', letterSpacing: '0.5px' }}>Rol</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--iq-primary)', textTransform: 'uppercase', fontSize: '11.5px', letterSpacing: '0.5px' }}>Estado</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--iq-primary)', textTransform: 'uppercase', fontSize: '11.5px', letterSpacing: '0.5px' }}>Registro</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--iq-primary)', textTransform: 'uppercase', fontSize: '11.5px', letterSpacing: '0.5px', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usersPage.content.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            backgroundColor: u.roles?.includes('ROLE_ADMIN') ? 'var(--iq-primary)' : 'var(--iq-secondary)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '13px',
                          }}>
                            {u.firstName?.[0] || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.fullName || `${u.firstName} ${u.lastName}`}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>{u.email}</div>
                        {u.phone && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.phone}</div>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <Badge status={u.roles?.[0] || 'ROLE_STUDENT'} />
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
                  ))}
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
        formError={formError}
        isSubmitting={isSubmitting}
      />

      <ChangeRoleModal
        isOpen={isRoleOpen}
        onClose={() => setIsRoleOpen(false)}
        user={selectedUser}
        role={newRole}
        setRole={setNewRole}
        onSubmit={handleRoleSubmit}
        formError={formError}
        isSubmitting={isSubmitting}
      />

      <ToggleStatusModal
        isOpen={isStatusOpen}
        onClose={() => setIsStatusOpen(false)}
        user={selectedUser}
        onToggle={handleStatusToggle}
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
