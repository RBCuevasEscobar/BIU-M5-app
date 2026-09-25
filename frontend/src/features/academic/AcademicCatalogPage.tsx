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
