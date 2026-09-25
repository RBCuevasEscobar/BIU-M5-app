import React from 'react';
import { CalendarX, Search } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon = <CalendarX size={44} color="var(--iq-secondary)" />,
}) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '48px 24px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px dashed var(--border-color)',
        margin: '16px 0',
      }}
    >
      <div style={{ marginBottom: '14px' }}>{icon}</div>
      <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--iq-primary)', marginBottom: '6px' }}>{title}</h3>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 20px auto' }}>
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} icon={<Search size={16} />}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
