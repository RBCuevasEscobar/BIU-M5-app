import React from 'react';
import { CheckCircle2, AlertCircle, Clock, Users, XCircle, Video, MapPin } from 'lucide-react';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const s = status ? status.toUpperCase() : 'UNKNOWN';

  let bg = '#f1f5f9';
  let color = '#475569';
  let icon = <Clock size={14} />;
  let label = s;

  switch (s) {
    case 'CONFIRMED':
    case 'PRESENT':
    case 'ACTIVE':
    case 'PUBLISHED':
      bg = '#ecfdf5';
      color = '#065f46';
      icon = <CheckCircle2 size={13} />;
      label = s === 'CONFIRMED' ? 'Confirmada' : s === 'PRESENT' ? 'Presente' : 'Activo';
      break;
    case 'FULL':
      bg = '#fef2f2';
      color = '#991b1b';
      icon = <Users size={13} />;
      label = 'Grupo Lleno (0 Cupos)';
      break;
    case 'AVAILABLE':
      bg = '#eff6ff';
      color = '#1e40af';
      icon = <CheckCircle2 size={13} />;
      label = 'Disponible';
      break;
    case 'CANCELLED':
    case 'ABSENT':
      bg = '#fef2f2';
      color = '#991b1b';
      icon = <XCircle size={13} />;
      label = s === 'CANCELLED' ? 'Cancelada' : 'Ausente';
      break;
    case 'RESCHEDULED':
    case 'EXCUSED':
      bg = '#fffbeb';
      color = '#92400e';
      icon = <Clock size={13} />;
      label = s === 'RESCHEDULED' ? 'Reprogramada' : 'Justificado';
      break;
    case 'COMPLETED':
      bg = '#f0fdf4';
      color = '#15803d';
      icon = <CheckCircle2 size={13} />;
      label = 'Completada';
      break;
    case 'ONLINE':
      bg = '#f5f3ff';
      color = '#6d28d9';
      icon = <Video size={13} />;
      label = 'Online';
      break;
    case 'PRESENTIAL':
      bg = '#eaf5fc';
      color = '#002e6d';
      icon = <MapPin size={13} />;
      label = 'Presencial';
      break;
  }

  const padding = size === 'sm' ? '2px 8px' : '4px 12px';
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        backgroundColor: bg,
        color: color,
        padding: padding,
        borderRadius: '9999px',
        fontSize: fontSize,
        fontWeight: 600,
        fontFamily: 'Montserrat, sans-serif',
      }}
      role="status"
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
