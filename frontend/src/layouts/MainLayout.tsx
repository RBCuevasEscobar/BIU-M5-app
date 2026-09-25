import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/Logo';
import {
  LayoutDashboard,
  Search,
  CalendarCheck,
  BookOpen,
  Users,
  CheckSquare,
  Bot,
  ShieldCheck,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronRight,
  User as UserIcon,
  Sparkles
} from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { user, studentProfile, teacherProfile, logout, switchDemoRole, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={19} />, roles: ['STUDENT', 'TEACHER', 'SUPERVISOR', 'ADMIN'] },
    { label: 'Buscar Tutorías', path: '/tutoring/search', icon: <Search size={19} />, roles: ['STUDENT', 'SUPERVISOR', 'ADMIN'] },
    { label: 'Mis Tutorías', path: '/tutoring/my-appointments', icon: <CalendarCheck size={19} />, roles: ['STUDENT'] },
    { label: 'Gestión de Grupos', path: '/groups', icon: <Users size={19} />, roles: ['SUPERVISOR', 'ADMIN'] },
    { label: 'Registro Asistencia', path: '/attendance', icon: <CheckSquare size={19} />, roles: ['TEACHER', 'SUPERVISOR', 'ADMIN'] },
    { label: 'Programa Académico', path: '/academic', icon: <BookOpen size={19} />, roles: ['STUDENT', 'TEACHER', 'SUPERVISOR', 'ADMIN'] },
    { label: 'Práctica IA TalkIO', path: '/talkio', icon: <Bot size={19} />, roles: ['STUDENT', 'TEACHER', 'SUPERVISOR', 'ADMIN'] },
    { label: 'Auditoría & Sistema', path: '/admin/audit', icon: <ShieldCheck size={19} />, roles: ['ADMIN'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.some(r => hasRole(r)));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      {/* Sidebar Desktop */}
      <aside
        style={{
          width: '270px',
          backgroundColor: '#ffffff',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <Logo size="md" />
        </div>

        {/* Academic Context Badge (for Student) */}
        {studentProfile && (
          <div style={{ margin: '14px 16px', padding: '12px', backgroundColor: 'var(--iq-primary-light)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0,46,109,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--iq-primary)', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Sparkles size={14} color="var(--iq-gold)" />
              <span>Tu Nivel Actual</span>
            </div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--iq-primary)', marginTop: '4px' }}>
              {studentProfile.currentBookTitle}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {studentProfile.currentModuleTitle || 'Lesson 5B'}
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {filteredNav.map((item) => {
            const active = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  color: active ? '#ffffff' : 'var(--text-main)',
                  backgroundColor: active ? 'var(--iq-primary)' : 'transparent',
                  fontWeight: active ? 600 : 500,
                  fontSize: '13.5px',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ color: active ? 'var(--iq-secondary)' : 'var(--iq-gray)' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <ChevronRight size={16} color="var(--iq-secondary)" />}
              </Link>
            );
          })}
        </nav>

        {/* Demo Fast Role Switcher */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--iq-gray)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Demo Rol Activo
            </span>
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              style={{ fontSize: '11px', color: 'var(--iq-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              {showRoleSwitcher ? 'Ocultar' : 'Cambiar'}
            </button>
          </div>

          {showRoleSwitcher && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
              <button
                onClick={() => switchDemoRole('STUDENT')}
                style={{ padding: '6px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: '1px solid var(--border-color)', background: hasRole('STUDENT') ? 'var(--iq-primary)' : '#fff', color: hasRole('STUDENT') ? '#fff' : 'inherit', cursor: 'pointer' }}
              >
                Estudiante
              </button>
              <button
                onClick={() => switchDemoRole('TEACHER')}
                style={{ padding: '6px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: '1px solid var(--border-color)', background: hasRole('TEACHER') ? 'var(--iq-primary)' : '#fff', color: hasRole('TEACHER') ? '#fff' : 'inherit', cursor: 'pointer' }}
              >
                Docente
              </button>
              <button
                onClick={() => switchDemoRole('SUPERVISOR')}
                style={{ padding: '6px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: '1px solid var(--border-color)', background: hasRole('SUPERVISOR') ? 'var(--iq-primary)' : '#fff', color: hasRole('SUPERVISOR') ? '#fff' : 'inherit', cursor: 'pointer' }}
              >
                Supervisor
              </button>
              <button
                onClick={() => switchDemoRole('ADMIN')}
                style={{ padding: '6px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: '1px solid var(--border-color)', background: hasRole('ADMIN') ? 'var(--iq-primary)' : '#fff', color: hasRole('ADMIN') ? '#fff' : 'inherit', cursor: 'pointer' }}
              >
                Admin
              </button>
            </div>
          )}

          {/* User profile footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--iq-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '13px' }}>
                {user?.firstName?.[0] || 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.fullName || 'Usuario IQ'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {user?.roles?.[0]?.replace('ROLE_', '') || 'ONLINE'}
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              style={{ background: 'none', border: 'none', color: 'var(--iq-gray)', cursor: 'pointer', padding: '6px' }}
              title="Cerrar sesión"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Navbar */}
        <header
          style={{
            height: '68px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 28px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--iq-primary)' }}>
              IQ English – Tutoring Management System
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Campus Tag */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'var(--iq-gray-light)', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600, color: 'var(--iq-primary)' }}>
              <span>Plantel:</span>
              <span style={{ color: 'var(--iq-secondary-hover)' }}>{studentProfile?.campusName || teacherProfile?.campusName || 'Plantel Tlaxcala'}</span>
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '6px 12px', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <LogOut size={14} />
              <span>Salir</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '28px', maxWidth: '1350px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
