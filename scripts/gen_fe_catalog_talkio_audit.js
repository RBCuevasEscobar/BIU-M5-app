const fs = require('fs');
const path = require('path');
const base = path.resolve('frontend/src');
function w(relPath, content) {
  const full = path.join(base, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content.trim() + '\n', 'utf8');
  console.log('Generated:', relPath);
}

// 1. AcademicCatalogPage
w('features/academic/AcademicCatalogPage.tsx', `
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Book, ModuleItem } from '../../types';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { BookOpen, CheckCircle, Sparkles, MessageSquare, Award } from 'lucide-react';

export const AcademicCatalogPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPrograms() {
      try {
        const data = await api.get<Book[]>('/books');
        setBooks(data);
        if (data.length > 0) setSelectedBook(data[0]);
      } catch (err) {
        console.error('Failed to load academic catalog', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPrograms();
  }, []);

  if (isLoading) return <LoadingSpinner message="Cargando programa académico..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--iq-primary)' }}>Programa Académico IQ English</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Estructura curricular de inmersión y fluidez en inglés: Book 1, Book 2 y Book 3</p>
      </div>

      {/* Book Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        {books.map(b => (
          <button
            key={b.id}
            onClick={() => setSelectedBook(b)}
            style={{
              padding: '10px 20px', borderRadius: 'var(--radius-md)',
              border: selectedBook?.id === b.id ? '2px solid var(--iq-primary)' : '1px solid var(--border-color)',
              backgroundColor: selectedBook?.id === b.id ? 'var(--iq-primary)' : '#ffffff',
              color: selectedBook?.id === b.id ? '#ffffff' : 'var(--iq-primary)',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <BookOpen size={16} />
            <span>Book {b.bookNumber}: {b.title.split(' - ')[0]}</span>
          </button>
        ))}
      </div>

      {selectedBook && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="iq-texture-bg" style={{ borderRadius: 'var(--radius-lg)', padding: '24px', color: '#ffffff' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--iq-secondary)', textTransform: 'uppercase' }}>Nivel: {selectedBook.levelName}</span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>{selectedBook.title}</h2>
            <p style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '4px' }}>{selectedBook.description}</p>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--iq-primary)' }}>Lecciones y Módulos de Aprendizaje</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {selectedBook.modules?.map(m => (
              <Card key={m.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--iq-secondary-hover)' }}>{m.moduleCode}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lección #{m.sequenceOrder}</span>
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--iq-primary)' }}>{m.title}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{m.description}</p>

                {m.topics && m.topics.length > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '12px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--iq-primary)', marginBottom: '4px' }}>Temas de Práctica:</div>
                    {m.topics.map(t => (
                      <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '4px 0' }}>
                        <span style={{ fontWeight: 600 }}>• {t.title}</span>
                        {t.grammarFocus && <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Gramática: {t.grammarFocus}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
`);

// 2. TalkIOPracticePage
w('features/talkio/TalkIOPracticePage.tsx', `
import React, { useState } from 'react';
import { api } from '../../services/api';
import { TalkIOSession } from '../../types';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Bot, Mic, Play, Award, CheckCircle, Sparkles, MessageSquare } from 'lucide-react';

export const TalkIOPracticePage: React.FC = () => {
  const [topicTitle, setTopicTitle] = useState('Requests, Excuses and Apologies (Book 2)');
  const [userPrompt, setUserPrompt] = useState('Would you mind turning down the music, please?');
  const [speechText, setSpeechText] = useState('Yes, I am really sorry about the loud music. I will turn it down right now.');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionResult, setSessionResult] = useState<TalkIOSession | null>(null);

  const handleRunEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const resp = await api.post<TalkIOSession>(\`/talkio/practice?moduleCode=B2-L05B&topicTitle=\${encodeURIComponent(topicTitle)}&promptText=\${encodeURIComponent(userPrompt)}&speechText=\${encodeURIComponent(speechText)}\`);
      setSessionResult(resp);
    } catch (err: any) {
      alert(err.message || 'Error en la sesión con TalkIO');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--iq-primary)' }}>Práctica Oral con Agente de IA (TalkIO)</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Entrena tu pronunciación, gramática y fluidez conversacional en tiempo real</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <Card title="Simulador de Conversación" subtitle="Interacción oral guiada con el avatar nativo">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', backgroundColor: 'var(--iq-primary-light)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--iq-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={24} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--iq-primary)' }}>Coach Virtual: Sarah</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Módulo: Book 2 • Lesson 5B Requests & Apologies</div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Pregunta del Agente (Prompt)</label>
              <input type="text" value={userPrompt} onChange={e => setUserPrompt(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '13.5px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Tu Respuesta Oral (Transcripción)</label>
              <textarea
                value={speechText}
                onChange={e => setSpeechText(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '13.5px' }}
              />
            </div>

            <Button icon={<Mic size={16} />} isLoading={isEvaluating} onClick={handleRunEvaluation}>
              Evaluar Pronunciación y Fluidez
            </Button>
          </div>
        </Card>

        {sessionResult && (
          <Card title="Retroalimentación de IA TalkIO" subtitle="Evaluación detallada de competencias orales">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'var(--iq-primary-light)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--iq-primary)', textTransform: 'uppercase' }}>Pronunciación</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--iq-primary)', marginTop: '2px' }}>{sessionResult.pronunciationScore}%</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: 'var(--iq-secondary-light)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--iq-secondary-hover)', textTransform: 'uppercase' }}>Gramática</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--iq-secondary-hover)', marginTop: '2px' }}>{sessionResult.grammarScore}%</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Vocabulario</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#047857', marginTop: '2px' }}>{sessionResult.vocabularyScore}%</div>
                </div>
              </div>

              <div style={{ padding: '14px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', fontSize: '13.5px' }}>
                <div style={{ fontWeight: 700, color: 'var(--iq-primary)', marginBottom: '4px' }}>Comentarios del Coach:</div>
                <p style={{ color: 'var(--text-muted)' }}>{sessionResult.feedbackText}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
`);

// 3. AuditLogsPage
w('features/administration/AuditLogsPage.tsx', `
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AuditLog } from '../../types';
import { Card } from '../../components/Card';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ShieldCheck, Clock, User, Terminal } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await api.get<AuditLog[]>('/audit/logs');
        setLogs(data);
      } catch (err) {
        console.error('Failed to load audit logs', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--iq-primary)' }}>Bitácora de Auditoría del Sistema</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Registro inmutable de eventos de seguridad, cambios en grupos y transacciones de tutoría</p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Cargando registros de auditoría..." />
      ) : (
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '10px 14px' }}>Fecha y Hora</th>
                  <th style={{ padding: '10px 14px' }}>Usuario</th>
                  <th style={{ padding: '10px 14px' }}>Acción</th>
                  <th style={{ padding: '10px 14px' }}>Entidad</th>
                  <th style={{ padding: '10px 14px' }}>Detalles</th>
                  <th style={{ padding: '10px 14px' }}>Trace ID</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{log.createdAt}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{log.username}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--iq-primary-light)', color: 'var(--iq-primary)', fontWeight: 700, fontSize: '11px' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>{log.entityName} #{log.entityId}</td>
                    <td style={{ padding: '10px 14px' }}>{log.details}</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)' }}>{log.traceId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
`);

// 4. AppRoutes, App, main
w('routes/AppRoutes.tsx', `
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../features/auth/LoginPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { TutoringSearchPage } from '../features/tutoring/TutoringSearchPage';
import { MyAppointmentsPage } from '../features/tutoring/MyAppointmentsPage';
import { GroupManagementPage } from '../features/groups/GroupManagementPage';
import { AttendanceRegisterPage } from '../features/attendance/AttendanceRegisterPage';
import { AcademicCatalogPage } from '../features/academic/AcademicCatalogPage';
import { TalkIOPracticePage } from '../features/talkio/TalkIOPracticePage';
import { AuditLogsPage } from '../features/administration/AuditLogsPage';

export const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/" element={user ? <MainLayout /> : <Navigate to="/login" replace />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="tutoring/search" element={<TutoringSearchPage />} />
        <Route path="tutoring/my-appointments" element={<MyAppointmentsPage />} />
        <Route path="groups" element={<GroupManagementPage />} />
        <Route path="attendance" element={<AttendanceRegisterPage />} />
        <Route path="academic" element={<AcademicCatalogPage />} />
        <Route path="talkio" element={<TalkIOPracticePage />} />
        <Route path="admin/audit" element={<AuditLogsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
`);

w('App.tsx', `
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import './theme/tokens.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};
`);

w('main.tsx', `
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`);

console.log('Frontend full application generated successfully');
