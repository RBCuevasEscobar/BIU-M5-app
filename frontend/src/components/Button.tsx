import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  style,
  disabled,
  ...props
}) => {
  let bg = 'var(--iq-primary)';
  let color = '#ffffff';
  let border = 'none';

  if (variant === 'secondary') {
    bg = 'var(--iq-secondary)';
    color = '#ffffff';
  } else if (variant === 'outline') {
    bg = 'transparent';
    color = 'var(--iq-primary)';
    border = '1.5px solid var(--iq-primary)';
  } else if (variant === 'danger') {
    bg = 'var(--status-danger)';
    color = '#ffffff';
  } else if (variant === 'ghost') {
    bg = 'transparent';
    color = 'var(--text-main)';
  }

  const padding = size === 'sm' ? '6px 14px' : size === 'lg' ? '12px 24px' : '9px 18px';
  const fontSize = size === 'sm' ? '12.5px' : size === 'lg' ? '15px' : '14px';

  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        backgroundColor: disabled ? '#cbd5e1' : bg,
        color: disabled ? '#64748b' : color,
        border: border,
        borderRadius: 'var(--radius-md)',
        padding: padding,
        fontSize: fontSize,
        fontWeight: 600,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: variant === 'primary' && !disabled ? 'var(--shadow-sm)' : 'none',
        ...style,
      }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      ) : icon}
      {children}
    </button>
  );
};
