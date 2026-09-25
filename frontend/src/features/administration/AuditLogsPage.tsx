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
