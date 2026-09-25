import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'positive';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'positive', size = 'md', showTagline = true }) => {
  const textColor = variant === 'light' ? '#ffffff' : '#002e6d';
  const accentColor = variant === 'light' ? '#5eb3e4' : '#5eb3e4';
  const bulbColor = variant === 'light' ? '#c5a059' : '#002e6d';

  const scale = size === 'sm' ? 0.75 : size === 'lg' ? 1.3 : 1;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: `${12 * scale}px`, textDecoration: 'none' }}>
      {/* Brain/Bulb Icon */}
      <svg width={38 * scale} height={38 * scale} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 15C33.4315 15 20 28.4315 20 45C20 54.5 24.5 62.8 31.4 68.2C33.5 69.8 35 72.3 35 75V80C35 82.8 37.2 85 40 85H60C62.8 85 65 82.8 65 80V75C65 72.3 66.5 69.8 68.6 68.2C75.5 62.8 80 54.5 80 45C80 28.4315 66.5685 15 50 15Z" stroke={bulbColor} strokeWidth="5" fill="none"/>
        <path d="M42 85V90C42 91.7 43.3 93 45 93H55C56.7 93 58 91.7 58 90V85" stroke={bulbColor} strokeWidth="5" fill="none"/>
        {/* Brain Synapse Filaments */}
        <path d="M38 40C38 35 43 32 50 32C57 32 62 35 62 40C62 45 57 48 50 48C43 48 38 51 38 56" stroke={accentColor} strokeWidth="4" strokeLinecap="round"/>
        <circle cx="50" cy="40" r="3" fill={accentColor}/>
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: `${20 * scale}px`, color: textColor, letterSpacing: '0.5px' }}>
            IQ
          </span>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400, fontSize: `${20 * scale}px`, color: accentColor, letterSpacing: '2px' }}>
            ENGLISH
          </span>
        </div>
        {showTagline && (
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: `${8.5 * scale}px`, color: variant === 'light' ? '#cbd5e1' : '#758592', letterSpacing: '2.5px', textTransform: 'uppercase', marginTop: '-2px' }}>
            LEARNING + INNOVATION
          </span>
        )}
      </div>
    </div>
  );
};
