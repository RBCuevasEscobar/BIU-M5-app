const fs = require('fs');
const path = require('path');
const base = path.resolve('frontend/src');

function w(relPath, content) {
  const full = path.join(base, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n', 'utf8');
  console.log('Generated frontend:', relPath);
}

// 1. AuthContext
w('context/AuthContext.tsx', `
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile, TeacherProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  studentProfile: StudentProfile | null;
  teacherProfile: TeacherProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password?: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  switchDemoRole: (role: 'STUDENT' | 'TEACHER' | 'SUPERVISOR' | 'ADMIN') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('iq_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const userData = await api.get<User>('/auth/me');
          setUser(userData);
          // Load specific profile if student
          if (userData.roles.includes('ROLE_STUDENT')) {
            try {
              const summary = await api.get<any>('/reports/dashboard');
              if (summary.studentProfile) setStudentProfile(summary.studentProfile);
            } catch (e) {
              console.warn('Could not load student profile', e);
            }
          }
          if (userData.roles.includes('ROLE_TEACHER')) {
            try {
              const summary = await api.get<any>('/reports/dashboard');
              if (summary.teacherProfile) setTeacherProfile(summary.teacherProfile);
            } catch (e) {
              console.warn('Could not load teacher profile', e);
            }
          }
        } catch (err) {
          console.error('Session restore failed, logging out', err);
          logout();
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (username: string, password = 'Password123!') => {
    setIsLoading(true);
    try {
      const resp = await api.post<any>('/auth/login', { username, password });
      const jwt = resp.token;
      localStorage.setItem('iq_token', jwt);
      setToken(jwt);

      const currentUser: User = {
        id: resp.userId,
        username: resp.username,
        email: resp.email,
        firstName: resp.fullName.split(' ')[0],
        lastName: resp.fullName.split(' ').slice(1).join(' '),
        fullName: resp.fullName,
        status: 'ACTIVE',
        roles: resp.roles,
        permissions: resp.permissions,
      };

      setUser(currentUser);
      if (resp.roles.includes('ROLE_STUDENT') && resp.profile) {
        setStudentProfile(resp.profile);
      } else if (resp.roles.includes('ROLE_TEACHER') && resp.profile) {
        setTeacherProfile(resp.profile);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('iq_token');
    setToken(null);
    setUser(null);
    setStudentProfile(null);
    setTeacherProfile(null);
  };

  const switchDemoRole = async (role: 'STUDENT' | 'TEACHER' | 'SUPERVISOR' | 'ADMIN') => {
    const userMap = {
      STUDENT: 'student.carlos',
      TEACHER: 'teacher.ana',
      SUPERVISOR: 'supervisor.patricia',
      ADMIN: 'admin.alberto',
    };
    await login(userMap[role], 'Password123!');
  };

  const hasRole = (roleName: string) => {
    if (!user || !user.roles) return false;
    const formatted = roleName.startsWith('ROLE_') ? roleName : \`ROLE_\${roleName}\`;
    return user.roles.includes(formatted);
  };

  const hasPermission = (permissionName: string) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permissionName) || user.roles.includes('ROLE_ADMIN');
  };

  return (
    <AuthContext.Provider value={{
      user,
      studentProfile,
      teacherProfile,
      token,
      isLoading,
      login,
      logout,
      hasRole,
      hasPermission,
      switchDemoRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
`);

// 2. Logo Component (Corporate Identity)
w('components/Logo.tsx', `
import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'positive';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'positive', size = 'md', showTagline = true }) => {
  const textColor = variant === 'light' ? '#ffffff' : '#002e6d';
  const accentColor = variant === 'light' ? '#5eb3e4' : '#5eb3e4';
  const bulbColor = variant === 'light' ? '#c5a059' : '#002e6d';

  const scale = size === 'sm' ? 0.75 : size === 'lg' ? 1.3 : 1;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: \`\${12 * scale}px\`, textDecoration: 'none' }}>
      {/* Brain/Bulb Icon */}
      <svg width={38 * scale} height={38 * scale} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 15C33.4315 15 20 28.4315 20 45C20 54.5 24.5 62.8 31.4 68.2C33.5 69.8 35 72.3 35 75V80C35 82.8 37.2 85 40 85H60C62.8 85 65 82.8 65 80V75C65 72.3 66.5 69.8 68.6 68.2C75.5 62.8 80 54.5 80 45C80 28.4315 66.5685 15 50 15Z" stroke={bulbColor} strokeWidth="5" fill="none"/>
        <path d="M42 85V90C42 91.7 43.3 93 45 93H55C56.7 93 58 91.7 58 90V85" stroke={bulbColor} strokeWidth="5" fill="none"/>
        {/* Brain Synapse Filaments */}
        <path d="M38 40C38 35 43 32 50 32C57 32 62 35 62 40C62 45 57 48 50 48C43 48 38 51 38 56" stroke={accentColor} strokeWidth="4" strokeLinecap="round"/>
        <circle cx="50" cy="40" r="3" fill={accentColor}/>
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: \`\${20 * scale}px\`, color: textColor, letterSpacing: '0.5px' }}>
            IQ
          </span>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: \`\${20 * scale}px\`, color: accentColor, letterSpacing: '2px' }}>
            ENGLISH
          </span>
        </div>
        {showTagline && (
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: \`\${8.5 * scale}px\`, color: variant === 'light' ? '#cbd5e1' : '#758592', letterSpacing: '2.5px', textTransform: 'uppercase', marginTop: '-2px' }}>
            LEARNING + INNOVATION
          </span>
        )}
      </div>
    </div>
  );
};
`);

// 3. UI Components: Badge, Button, Card, EmptyState, LoadingSpinner
w('components/Badge.tsx', `
import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Users, XCircle, Video, MapPin } from 'lucide-react';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const s = status ? status.toUpperCase() : 'UNKNOWN';

  let bg = '#f1f5f9';
  let color = '#475569';
  let icon = <Clock size={14} />;
  let label = s;

  switch (s) {
    case 'CONFIRMED':
    case 'PRESENT':
    case 'ACTIVE':
    case 'PUBLISHED':
      bg = '#ecfdf5';
      color = '#065f46';
      icon = <CheckCircle2 size={13} />;
      label = s === 'CONFIRMED' ? 'Confirmada' : s === 'PRESENT' ? 'Presente' : 'Activo';
      break;
    case 'FULL':
      bg = '#fef2f2';
      color = '#991b1b';
      icon = <Users size={13} />;
      label = 'Grupo Lleno (0 Cupos)';
      break;
    case 'AVAILABLE':
      bg = '#eff6ff';
      color = '#1e40af';
      icon = <CheckCircle2 size={13} />;
      label = 'Disponible';
      break;
    case 'CANCELLED':
    case 'ABSENT':
      bg = '#fef2f2';
      color = '#991b1b';
      icon = <XCircle size={13} />;
      label = s === 'CANCELLED' ? 'Cancelada' : 'Ausente';
      break;
    case 'RESCHEDULED':
    case 'EXCUSED':
      bg = '#fffbeb';
      color = '#92400e';
      icon = <Clock size={13} />;
      label = s === 'RESCHEDULED' ? 'Reprogramada' : 'Justificado';
      break;
    case 'COMPLETED':
      bg = '#f0fdf4';
      color = '#15803d';
      icon = <CheckCircle2 size={13} />;
      label = 'Completada';
      break;
    case 'ONLINE':
      bg = '#f5f3ff';
      color = '#6d28d9';
      icon = <Video size={13} />;
      label = 'Online';
      break;
    case 'PRESENTIAL':
      bg = '#eaf5fc';
      color = '#002e6d';
      icon = <MapPin size={13} />;
      label = 'Presencial';
      break;
  }

  const padding = size === 'sm' ? '2px 8px' : '4px 12px';
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        backgroundColor: bg,
        color: color,
        padding: padding,
        borderRadius: '9999px',
        fontSize: fontSize,
        fontWeight: 600,
        fontFamily: 'Montserrat, sans-serif',
      }}
      role="status"
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
`);

w('components/Button.tsx', `
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  style,
  disabled,
  ...props
}) => {
  let bg = 'var(--iq-primary)';
  let color = '#ffffff';
  let border = 'none';

  if (variant === 'secondary') {
    bg = 'var(--iq-secondary)';
    color = '#ffffff';
  } else if (variant === 'outline') {
    bg = 'transparent';
    color = 'var(--iq-primary)';
    border = '1.5px solid var(--iq-primary)';
  } else if (variant === 'danger') {
    bg = 'var(--status-danger)';
    color = '#ffffff';
  } else if (variant === 'ghost') {
    bg = 'transparent';
    color = 'var(--text-main)';
  }

  const padding = size === 'sm' ? '6px 14px' : size === 'lg' ? '12px 24px' : '9px 18px';
  const fontSize = size === 'sm' ? '12.5px' : size === 'lg' ? '15px' : '14px';

  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        backgroundColor: disabled ? '#cbd5e1' : bg,
        color: disabled ? '#64748b' : color,
        border: border,
        borderRadius: 'var(--radius-md)',
        padding: padding,
        fontSize: fontSize,
        fontWeight: 600,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: variant === 'primary' && !disabled ? 'var(--shadow-sm)' : 'none',
        ...style,
      }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      ) : icon}
      {children}
    </button>
  );
};
`);

w('components/Card.tsx', `
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, subtitle, headerAction, style }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        padding: '24px',
        ...style,
      }}
    >
      {(title || headerAction) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div>
            {title && <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--iq-primary)', margin: 0 }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px' }}>{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
`);

w('components/Modal.tsx', `
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = '560px' }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: maxWidth,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          padding: '28px',
          animation: 'fadeIn 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--iq-primary)', margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
`);

w('components/EmptyState.tsx', `
import React from 'react';
import { CalendarX, Search } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon = <CalendarX size={44} color="var(--iq-secondary)" />,
}) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '48px 24px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px dashed var(--border-color)',
        margin: '16px 0',
      }}
    >
      <div style={{ marginBottom: '14px' }}>{icon}</div>
      <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--iq-primary)', marginBottom: '6px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px auto' }}>
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} icon={<Search size={16} />}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
`);

w('components/LoadingSpinner.tsx', `
import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Cargando información...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '14px' }}>
      <div style={{
        width: '38px',
        height: '38px',
        border: '3.5px solid var(--iq-primary-light)',
        borderTopColor: 'var(--iq-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>{message}</span>
    </div>
  );
};
`);

console.log('Frontend Part 2 generated');
