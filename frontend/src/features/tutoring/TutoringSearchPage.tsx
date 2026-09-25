import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { GroupSession, Book, ModuleItem, Campus, Appointment } from '../../types';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Calendar, Clock, MapPin, BookOpen, User as UserIcon, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

export const TutoringSearchPage: React.FC = () => {
  const { studentProfile } = useAuth();
  const [searchMethod, setSearchMethod] = useState<'METHOD_A' | 'METHOD_B'>('METHOD_A');
  const [sessions, setSessions] = useState<GroupSession[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);

  const [selectedBookId, setSelectedBookId] = useState<number | ''>(studentProfile?.currentBookId || 2);
  const [selectedModuleId, setSelectedModuleId] = useState<number | ''>(studentProfile?.currentModuleId || 8);
  const [selectedCampusId, setSelectedCampusId] = useState<number | ''>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [selectedSessionForBooking, setSelectedSessionForBooking] = useState<GroupSession | null>(null);
  const [isBookingLoading, setIsBookingLoading] = useState<boolean>(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<Appointment | null>(null);
  const [bookingError, setBookingError] = useState<string>('');

  useEffect(() => {
    async function loadCatalog() {
      try {
        const [booksData, campusData] = await Promise.all([
          api.get<Book[]>('/books'),
          api.get<Campus[]>('/campuses'),
        ]);
        setBooks(booksData);
        setCampuses(campusData);
      } catch (err) {
        console.error('Failed to load initial catalog', err);
      }
    }
    loadCatalog();
  }, []);

  useEffect(() => {
    if (selectedBookId) {
      api.get<ModuleItem[]>(`/modules?bookId=${selectedBookId}`)
        .then(setModules)
        .catch(console.error);
    } else {
      setModules([]);
    }
  }, [selectedBookId]);

  const executeSearch = async () => {
    setIsLoading(true);
    try {
      let query = '/tutoring/sessions?';
      if (selectedBookId) query += `bookId=${selectedBookId}&`;
      if (selectedModuleId) query += `moduleId=${selectedModuleId}&`;
      if (selectedCampusId) query += `campusId=${selectedCampusId}&`;
      if (dateFrom) query += `dateFrom=${dateFrom}&`;

      const results = await api.get<GroupSession[]>(query);
      setSessions(results);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [selectedBookId, selectedModuleId, selectedCampusId, dateFrom]);

  const handleConfirmBooking = async () => {
    if (!selectedSessionForBooking) return;
    setIsBookingLoading(true);
    setBookingError('');
    try {
      const resp = await api.post<Appointment>('/appointments', {
        sessionId: selectedSessionForBooking.id,
      });
      setBookingSuccessData(resp);
      executeSearch();
    } catch (err: any) {
      setBookingError(err.message || 'No fue posible reservar este espacio.');
    } finally {
      setIsBookingLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--iq-primary)' }}>Buscar y Reservar Tutorías</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Selecciona tu módulo de avance o explora horarios y docentes disponibles</p>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => { setSearchMethod('METHOD_A'); setSelectedModuleId(8); }}
          style={{
            flex: 1, padding: '12px 18px', borderRadius: 'var(--radius-md)',
            border: searchMethod === 'METHOD_A' ? '2px solid var(--iq-primary)' : '1px solid var(--border-color)',
            backgroundColor: searchMethod === 'METHOD_A' ? 'var(--iq-primary-light)' : '#ffffff',
            color: 'var(--iq-primary)', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <BookOpen size={18} color="var(--iq-primary)" />
          <span>Método A: Buscar por Módulo / Lección</span>
        </button>

        <button
          onClick={() => { setSearchMethod('METHOD_B'); setSelectedModuleId(''); }}
          style={{
            flex: 1, padding: '12px 18px', borderRadius: 'var(--radius-md)',
            border: searchMethod === 'METHOD_B' ? '2px solid var(--iq-primary)' : '1px solid var(--border-color)',
            backgroundColor: searchMethod === 'METHOD_B' ? 'var(--iq-primary-light)' : '#ffffff',
            color: 'var(--iq-primary)', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <Calendar size={18} color="var(--iq-primary)" />
          <span>Método B: Buscar por Fecha y Disponibilidad</span>
        </button>
      </div>

      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>Libro</label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value ? Number(e.target.value) : '')}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '13.5px' }}
            >
              <option value="">Todos los Libros</option>
              {books.map(b => <option key={b.id} value={b.id}>Book {b.bookNumber}: {b.title}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>Módulo / Lección</label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value ? Number(e.target.value) : '')}
              disabled={!selectedBookId}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '13.5px' }}
            >
              <option value="">Todas las Lecciones</option>
              {modules.map(m => <option key={m.id} value={m.id}>{m.moduleCode} - {m.title}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>Plantel</label>
            <select
              value={selectedCampusId}
              onChange={(e) => setSelectedCampusId(e.target.value ? Number(e.target.value) : '')}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '13.5px' }}
            >
              <option value="">Todos los Planteles</option>
              {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>A partir de</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '13.5px' }}
            />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <LoadingSpinner message="Consultando cupos y sesiones disponibles..." />
      ) : sessions.length === 0 ? (
        <EmptyState
          title="No encontramos tutorías con los filtros seleccionados"
          description="Intenta seleccionando otra lección, ampliando el rango de fechas o eligiendo otro plantel."
          actionText="Limpiar Filtros"
          onAction={() => { setSelectedBookId(''); setSelectedModuleId(''); setSelectedCampusId(''); setDateFrom(''); }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {sessions.map((session) => {
            const isFull = session.full || session.availableSeats <= 0;
            return (
              <div
                key={session.id}
                style={{
                  backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <Badge status={session.modality} size="sm" />
                    <Badge status={isFull ? 'FULL' : 'AVAILABLE'} size="sm" />
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--iq-secondary-hover)', textTransform: 'uppercase' }}>
                    {session.bookTitle} • {session.moduleCode}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--iq-primary)', marginTop: '2px' }}>
                    {session.moduleTitle}
                  </h3>
                  {session.topicTitle && (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Tema: {session.topicTitle}</p>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={15} color="var(--iq-primary)" /><span style={{ fontWeight: 600 }}>{session.sessionDate}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={15} color="var(--iq-primary)" /><span>{session.startTime} - {session.endTime} ({session.durationMinutes} min)</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><UserIcon size={15} color="var(--iq-primary)" /><span>Docente: <strong>{session.teacherName}</strong></span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={15} color="var(--iq-primary)" /><span>{session.campusName} ({session.roomOrLink || 'Aula 1'})</span></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Disponibilidad: </span>
                    <strong style={{ fontSize: '13.5px', color: isFull ? 'var(--status-danger)' : 'var(--iq-primary)' }}>
                      {session.availableSeats} / {session.capacity} cupos
                    </strong>
                  </div>
                  <Button size="sm" disabled={isFull} onClick={() => { setSelectedSessionForBooking(session); setBookingSuccessData(null); setBookingError(''); }}>
                    {isFull ? 'Agotado' : 'Reservar'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={!!selectedSessionForBooking}
        onClose={() => setSelectedSessionForBooking(null)}
        title={bookingSuccessData ? '¡Tutoría Confirmada!' : 'Confirmar Reserva de Tutoría'}
      >
        {bookingSuccessData ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--iq-primary)' }}>Tu tutoría ha sido reservada correctamente</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Hemos registrado tu espacio con el docente asignado.</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--iq-primary-light)', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Folio:</strong> {bookingSuccessData.appointmentNumber}</div>
              <div><strong>Módulo:</strong> {bookingSuccessData.session.moduleTitle}</div>
              <div><strong>Fecha y Hora:</strong> {bookingSuccessData.session.sessionDate} a las {bookingSuccessData.session.startTime} hrs</div>
              <div><strong>Docente:</strong> {bookingSuccessData.session.teacherName}</div>
              <div><strong>Plantel:</strong> {bookingSuccessData.session.campusName} ({bookingSuccessData.session.modality})</div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '8px' }}>
              <Button variant="outline" icon={<ExternalLink size={15} />} onClick={() => window.open('https://calendar.google.com/calendar/r/eventedit', '_blank')}>
                Agregar a Google Calendar
              </Button>
              <Button onClick={() => setSelectedSessionForBooking(null)}>Aceptar</Button>
            </div>
          </div>
        ) : selectedSessionForBooking ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {bookingError && (
              <div style={{ padding: '12px 14px', backgroundColor: 'var(--status-danger-bg)', color: 'var(--status-danger)', borderRadius: 'var(--radius-md)', fontSize: '13.5px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700 }}>No fue posible completar la reserva</div>
                  <div style={{ fontSize: '13px' }}>{bookingError}</div>
                </div>
              </div>
            )}
            <p style={{ fontSize: '14px', color: 'var(--text-main)' }}>Por favor revisa el resumen de tu sesión académica antes de confirmar:</p>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
              <div><strong>Libro:</strong> {selectedSessionForBooking.bookTitle}</div>
              <div><strong>Módulo:</strong> {selectedSessionForBooking.moduleTitle}</div>
              {selectedSessionForBooking.topicTitle && <div><strong>Tema:</strong> {selectedSessionForBooking.topicTitle}</div>}
              <div><strong>Docente:</strong> {selectedSessionForBooking.teacherName}</div>
              <div><strong>Fecha:</strong> {selectedSessionForBooking.sessionDate}</div>
              <div><strong>Horario:</strong> {selectedSessionForBooking.startTime} - {selectedSessionForBooking.endTime} hrs</div>
              <div><strong>Plantel:</strong> {selectedSessionForBooking.campusName}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button variant="ghost" onClick={() => setSelectedSessionForBooking(null)}>Cancelar</Button>
              <Button isLoading={isBookingLoading} onClick={handleConfirmBooking}>Confirmar Tutoría</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
