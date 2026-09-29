const fs = require('fs');
const path = require('path');
const base = path.resolve('frontend/src');

function w(relPath, content) {
  const full = path.join(base, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n', 'utf8');
  console.log('Generated frontend:', relPath);
}

w('layouts/MainLayout.tsx', `
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
`);

w('features/auth/LoginPage.tsx', `
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/Logo';
import { Button } from '../../components/Button';
import { Shield, BookOpen, GraduationCap, Lock, User as UserIcon, CheckCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const [username, setUsername] = useState('student.carlos');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#002e6d',
        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(94, 179, 228, 0.3) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(197, 160, 89, 0.25) 0%, transparent 40%), linear-gradient(135deg, #002e6d 0%, #121e28 100%)',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: '36px',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Logo size="lg" />
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--iq-primary)', marginTop: '20px' }}>
            Portal de Gestión de Tutorías
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Ingresa con tu cuenta institucional o selecciona un perfil de demostración
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: '12px 14px', backgroundColor: 'var(--status-danger-bg)', color: 'var(--status-danger)', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '18px', border: '1px solid rgba(239,68,68,0.2)' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Usuario o Correo Institucional
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--iq-gray)' }}>
                <UserIcon size={17} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--iq-gray)' }}>
                <Lock size={17} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <Button type="submit" size="lg" isLoading={isLoading} style={{ marginTop: '8px' }}>
            Iniciar Sesión
          </Button>
        </form>

        {/* Quick Demo Access Switchers */}
        <div style={{ marginTop: '28px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--iq-gray)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', marginBottom: '12px' }}>
            Acceso Rápido para Pruebas (Perfiles Demo)
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => switchDemoRole('STUDENT')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--iq-secondary)', backgroundColor: 'var(--iq-secondary-light)', cursor: 'pointer', textAlign: 'left' }}
            >
              <GraduationCap size={18} color="var(--iq-primary)" />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--iq-primary)' }}>Carlos (Alumno)</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Book 2 - Intermedio</div>
              </div>
            </button>

            <button
              onClick={() => switchDemoRole('TEACHER')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--iq-primary)', backgroundColor: 'var(--iq-primary-light)', cursor: 'pointer', textAlign: 'left' }}
            >
              <BookOpen size={18} color="var(--iq-primary)" />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--iq-primary)' }}>Ana (Docente)</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Tutorías & Asistencia</div>
              </div>
            </button>

            <button
              onClick={() => switchDemoRole('SUPERVISOR')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid #f59e0b', backgroundColor: '#fffbeb', cursor: 'pointer', textAlign: 'left' }}
            >
              <Shield size={18} color="#b45309" />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e' }}>Patricia (Supervisora)</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Grupos & Horarios</div>
              </div>
            </button>

            <button
              onClick={() => switchDemoRole('ADMIN')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid #10b981', backgroundColor: '#ecfdf5', cursor: 'pointer', textAlign: 'left' }}
            >
              <CheckCircle size={18} color="#047857" />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#065f46' }}>Alberto (Admin)</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Auditoría & Sistema</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
`);

console.log('Frontend Part 3 (MainLayout, LoginPage) generated');
