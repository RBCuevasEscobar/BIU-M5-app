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
      const resp = await api.post<TalkIOSession>(`/talkio/practice?moduleCode=B2-L05B&topicTitle=${encodeURIComponent(topicTitle)}&promptText=${encodeURIComponent(userPrompt)}&speechText=${encodeURIComponent(speechText)}`);
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
