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
