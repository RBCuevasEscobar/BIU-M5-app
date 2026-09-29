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

  const [selectedBookId, setSelectedBookId] = useState<number | ''>('');
  const [selectedModuleId, setSelectedModuleId] = useState<number | ''>('');
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
      } catch (err: any) {
        console.error('Failed to load initial catalog', err);
      }
    }
    loadCatalog();
  }, []);

  useEffect(() => {
    if (selectedBookId) {
      api.get<ModuleItem[]>('/modules?bookId=' + selectedBookId)
        .then(setModules)
        .catch(() => setModules([]));
    } else {
      api.get<ModuleItem[]>('/modules')
        .then(setModules)
        .catch(() => setModules([]));
    }
  }, [selectedBookId]);

  const handleBookChange = (bookId: number | '') => {
    setSelectedBookId(bookId);
    setSelectedModuleId('');
  };

  const executeSearch = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBookId) params.append('bookId', selectedBookId.toString());
      if (selectedModuleId) params.append('moduleId', selectedModuleId.toString());
      if (selectedCampusId) params.append('campusId', selectedCampusId.toString());
      if (dateFrom) params.append('dateFrom', dateFrom);

      const qs = params.toString();
      const endpoint = qs ? '/tutoring/sessions?' + qs : '/tutoring/sessions';
      const results = await api.get<GroupSession[]>(endpoint);
      setSessions(results || []);
    } catch (err: any) {
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
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--iq-primary)' }}>Buscar y Reservar Tutorias</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Selecciona tu modulo de avance o explora horarios y docentes disponibles</p>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => { setSearchMethod('METHOD_A'); }}
          style={{
            flex: 1, padding: '12px 18px', borderRadius: 'var(--radius-md)',
            border: searchMethod === 'METHOD_A' ? '2px solid var(--iq-primary)' : '1px solid var(--border-color)',
            backgroundColor: searchMethod === 'METHOD_A' ? 'var(--iq-primary-light)' : '#ffffff',
            color: 'var(--iq-primary)', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <BookOpen size={18} color="var(--iq-primary)" />
          <span>Metodo A: Buscar por Modulo / Leccion</span>
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
          <span>Metodo B: Buscar por Fecha / Disponibilidad</span>
        </button>
      </div>

      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>Libro</label>
            <select
              value={selectedBookId}
              onChange={(e) => handleBookChange(e.target.value ? Number(e.target.value) : '')}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '13.5px' }}
            >
              <option value="">Todos los Libros</option>
              {books.map(b => <option key={b.id} value={b.id}>Book {b.bookNumber}: {b.title}</option>)}
            </select>
          </div>

          {searchMethod === 'METHOD_A' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>Modulo / Leccion</label>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value ? Number(e.target.value) : '')}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '13.5px' }}
              >
                <option value="">Todos los Modulos</option>
                {modules.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.bookNumber ? '[B' + m.bookNumber + '] ' : ''}{m.moduleCode} - {m.title}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              style={{ width: '100%', padding: '8.5px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '13.5px' }}
            />
          </div>

          <div>
            <Button
              variant="outline"
              onClick={() => { setSelectedBookId(''); setSelectedModuleId(''); setSelectedCampusId(''); setDateFrom(''); }}
              style={{ width: '100%' }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <LoadingSpinner message="Buscando sesiones de tutoria disponibles..." />
      ) : sessions.length === 0 ? (
        <EmptyState
          title="No encontramos tutorias con estos criterios"
          description="Intenta seleccionando otra leccion, ampliando el rango de fechas o eligiendo otro plantel."
          actionText="Limpiar Filtros"
          onAction={() => { setSelectedBookId(''); setSelectedModuleId(''); setSelectedCampusId(''); setDateFrom(''); }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {sessions.map((session) => {
            const isCompleted = session.status === 'COMPLETED' || (session as any).groupStatus === 'COMPLETED';
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
                    {isCompleted ? <Badge status="COMPLETED" size="sm" /> : <Badge status={isFull ? 'FULL' : 'AVAILABLE'} size="sm" />}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--iq-secondary-hover)', textTransform: 'uppercase' }}>
                    {session.bookTitle} - {session.moduleCode}
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
                  <Button size="sm" disabled={isFull || isCompleted} onClick={() => { setSelectedSessionForBooking(session); setBookingSuccessData(null); setBookingError(''); }}>
                    {isCompleted ? 'Cerrado' : isFull ? 'Agotado' : 'Reservar'}
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
        title={bookingSuccessData ? 'Tutoria Confirmada!' : 'Confirmar Reserva de Tutoria'}
      >
        {bookingSuccessData ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--iq-primary)' }}>Tu tutoria ha sido reservada correctamente</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Hemos registrado tu espacio con el docente asignado.</p>
            </div>
            <div style={{ padding: '16px', backgroundColor: 'var(--iq-primary-light)', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><strong>Folio:</strong> {bookingSuccessData.appointmentNumber}</div>
              <div><strong>Modulo:</strong> {bookingSuccessData.session.moduleTitle}</div>
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
            <p style={{ fontSize: '14px', color: 'var(--text-main)' }}>Por favor revisa el resumen de tu sesion academica antes de confirmar:</p>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
              <div><strong>Libro:</strong> {selectedSessionForBooking.bookTitle}</div>
              <div><strong>Modulo:</strong> {selectedSessionForBooking.moduleTitle}</div>
              {selectedSessionForBooking.topicTitle && <div><strong>Tema:</strong> {selectedSessionForBooking.topicTitle}</div>}
              <div><strong>Docente:</strong> {selectedSessionForBooking.teacherName}</div>
              <div><strong>Fecha:</strong> {selectedSessionForBooking.sessionDate}</div>
              <div><strong>Horario:</strong> {selectedSessionForBooking.startTime} - {selectedSessionForBooking.endTime} hrs</div>
              <div><strong>Plantel:</strong> {selectedSessionForBooking.campusName}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button variant="ghost" onClick={() => setSelectedSessionForBooking(null)}>Cancelar</Button>
              <Button isLoading={isBookingLoading} onClick={handleConfirmBooking}>Confirmar Tutoria</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};