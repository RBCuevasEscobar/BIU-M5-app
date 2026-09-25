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
