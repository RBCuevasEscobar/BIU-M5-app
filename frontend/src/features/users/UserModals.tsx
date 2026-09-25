import React from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { User, CreateUserPayload, UpdateUserPayload, UserReport, AuditLog, Campus } from '../../types';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: CreateUserPayload;
  setForm: React.Dispatch<React.SetStateAction<CreateUserPayload>>;
  onSubmit: (e: React.FormEvent) => void;
  campuses: Campus[];
  formError: string | null;
  isSubmitting: boolean;
}

export const CreateUserModal: React.FC<CreateModalProps> = ({
  isOpen, onClose, form, setForm, onSubmit, campuses, formError, isSubmitting
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Registrar Nuevo Usuario">
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {formError && (
        <div style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--iq-danger)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
          {formError}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>Nombre(s) *</label>
          <input
            type="text"
            required
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>Apellidos *</label>
          <input
            type="text"
            required
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>Nombre de Usuario *</label>
          <input
            type="text"
            required
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>Correo Electronico *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>Contrasena Inicial *</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>Telefono</label>
          <input
            type="tel"
            value={form.phone || ''}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>Rol Principal *</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: '#fff' }}
          >
            <option value="ROLE_STUDENT">ESTUDIANTE</option>
            <option value="ROLE_TEACHER">DOCENTE</option>
            <option value="ROLE_SUPERVISOR">SUPERVISOR</option>
            <option value="ROLE_ADMIN">ADMINISTRADOR</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>Plantel Asignado</label>
          <select
            value={form.campusId || ''}
            onChange={(e) => setForm({ ...form, campusId: Number(e.target.value) })}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: '#fff' }}
          >
            {campuses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrar Usuario'}
        </Button>
      </div>
    </form>
  </Modal>
);

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  form: UpdateUserPayload;
  setForm: React.Dispatch<React.SetStateAction<UpdateUserPayload>>;
  onSubmit: (e: React.FormEvent) => void;
  formError: string | null;
  isSubmitting: boolean;
}

export const EditUserModal: React.FC<EditModalProps> = ({
  isOpen, onClose, user, form, setForm, onSubmit, formError, isSubmitting
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={`Editar Perfil: ${user?.username}`}>
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {formError && (
        <div style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--iq-danger)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
          {formError}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>Nombre(s) *</label>
          <input
            type="text"
            required
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>Apellidos *</label>
          <input
            type="text"
            required
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
        </div>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>Correo Electronico *</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>Telefono</label>
          <input
            type="tel"
            value={form.phone || ''}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>Estado</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: '#fff' }}
          >
            <option value="ACTIVE">ACTIVO</option>
            <option value="INACTIVE">INACTIVO</option>
            <option value="SUSPENDED">SUSPENDIDO</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  </Modal>
);

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  role: string;
  setRole: (r: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  formError: string | null;
  isSubmitting: boolean;
}

export const ChangeRoleModal: React.FC<RoleModalProps> = ({
  isOpen, onClose, user, role, setRole, onSubmit, formError, isSubmitting
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={`Modificar Rol: ${user?.username}`}>
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {formError && (
        <div style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--iq-danger)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
          {formError}
        </div>
      )}
      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
        Selecciona el nuevo rol para el usuario. No se puede remover el rol de Administrador al unico Administrador activo del sistema.
      </p>
      <div>
        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>Nuevo Rol *</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ width: '100%', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: '#fff' }}
        >
          <option value="ROLE_STUDENT">ESTUDIANTE (ROLE_STUDENT)</option>
          <option value="ROLE_TEACHER">DOCENTE (ROLE_TEACHER)</option>
          <option value="ROLE_SUPERVISOR">SUPERVISOR (ROLE_SUPERVISOR)</option>
          <option value="ROLE_ADMIN">ADMINISTRADOR (ROLE_ADMIN)</option>
        </select>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Actualizando...' : 'Asignar Rol'}
        </Button>
      </div>
    </form>
  </Modal>
);

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onToggle: () => void;
  formError: string | null;
  isSubmitting: boolean;
}

export const ToggleStatusModal: React.FC<StatusModalProps> = ({
  isOpen, onClose, user, onToggle, formError, isSubmitting
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Cambio de Estado">
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {formError && (
        <div style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--iq-danger)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
          {formError}
        </div>
      )}
      <p style={{ fontSize: '13.5px', color: 'var(--text-main)' }}>
        Estas a punto de {user?.status === 'ACTIVE' ? 'DESACTIVAR' : 'ACTIVAR'} la cuenta del usuario <strong>{user?.fullName}</strong> (@{user?.username}).
      </p>
      {user?.status === 'ACTIVE' && (
        <div style={{ padding: '10px 14px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '4px', fontSize: '12.5px', color: 'var(--iq-gold)' }}>
          El usuario no podra iniciar sesion en la plataforma mientras se encuentre inactivo.
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button
          variant={user?.status === 'ACTIVE' ? 'danger' : 'primary'}
          onClick={onToggle}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Procesando...' : user?.status === 'ACTIVE' ? 'Desactivar Cuenta' : 'Activar Cuenta'}
        </Button>
      </div>
    </div>
  </Modal>
);

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  newPassword: string;
  setNewPassword: (p: string) => void;
  showPass: boolean;
  setShowPass: (s: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  formError: string | null;
  isSubmitting: boolean;
}

export const AdminPasswordResetModal: React.FC<PasswordResetModalProps> = ({
  isOpen, onClose, user, newPassword, setNewPassword, showPass, setShowPass, onSubmit, formError, isSubmitting
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={`Restablecer Contrasena: ${user?.username}`}>
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {formError && (
        <div style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--iq-danger)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
          {formError}
        </div>
      )}
      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
        Como Administrador, puedes asignar una nueva contrasena para este usuario.
      </p>
      <div>
        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>Nueva Contrasena *</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPass ? 'text' : 'password'}
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimo 6 caracteres"
            style={{ width: '100%', padding: '8px 36px 8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--iq-gray)' }}
          >
            {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Restableciendo...' : 'Restablecer Contrasena'}
        </Button>
      </div>
    </form>
  </Modal>
);

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  logs: AuditLog[];
  isLoading: boolean;
}

export const AuditLogsModal: React.FC<AuditModalProps> = ({
  isOpen, onClose, user, logs, isLoading
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={`Historial de Auditoria: ${user?.username}`}>
    {isLoading ? (
      <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner message="Cargando registros de auditoria..." />
      </div>
    ) : logs.length === 0 ? (
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>No hay registros de auditoria recientes para este usuario.</p>
    ) : (
      <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {logs.map((log) => (
          <div key={log.id} style={{ padding: '10px 12px', borderRadius: '4px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '12.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 700, color: 'var(--iq-primary)' }}>{log.action}</span>
              <span style={{ color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString('es-MX')}</span>
            </div>
            <div style={{ color: 'var(--text-main)' }}>{log.details}</div>
          </div>
        ))}
      </div>
    )}
  </Modal>
);

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: () => void;
  formError: string | null;
  isSubmitting: boolean;
}

export const DeleteUserModal: React.FC<DeleteModalProps> = ({
  isOpen, onClose, user, onConfirm, formError, isSubmitting
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Eliminar / Archivar Usuario">
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {formError && (
        <div style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--iq-danger)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
          {formError}
        </div>
      )}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <AlertTriangle size={32} color="var(--iq-danger)" style={{ flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-main)', margin: 0 }}>
            Confirmas que deseas desactivar la cuenta del usuario <strong>{user?.fullName}</strong> (@{user?.username})?
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Para preservar la integridad de tutorias, asistencias y reportes historicos, la cuenta se mantendra archivada con estado INACTIVO.
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button variant="danger" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? 'Procesando...' : 'Confirmar Desactivacion'}
        </Button>
      </div>
    </div>
  </Modal>
);

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: UserReport | null;
}

export const UserReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, report }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Reporte Estadistico de Usuarios">
    {report && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
          <div style={{ padding: '12px', borderRadius: '4px', backgroundColor: 'var(--iq-primary-light)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--iq-primary)' }}>{report.totalUsers}</div>
          </div>
          <div style={{ padding: '12px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Activos</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--iq-success)' }}>{report.activeUsers}</div>
          </div>
          <div style={{ padding: '12px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Inactivos</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--iq-danger)' }}>{report.inactiveUsers + report.suspendedUsers}</div>
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--iq-primary)', marginBottom: '8px' }}>Distribucion por Rol</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.entries(report.roleDistribution || {}).map(([role, count]) => (
              <div key={role} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'var(--bg-app)', borderRadius: '4px', fontSize: '12.5px' }}>
                <span style={{ fontWeight: 600 }}>{role}</span>
                <span style={{ color: 'var(--iq-primary)', fontWeight: 700 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Button variant="primary" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    )}
  </Modal>
);
