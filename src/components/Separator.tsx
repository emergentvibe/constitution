// Elegant gold/silver line separator
export function Separator({ 
  variant = 'gold',
  className = '' 
}: { 
  variant?: 'gold' | 'silver' | 'gradient';
  className?: string;
}) {
  const colors = {
    gold: '#C9A227',
    silver: '#7B9BAD',
    gradient: 'linear-gradient(90deg, #C9A227 0%, #7B9BAD 100%)',
  };

  return (
    <div className={`relative h-px w-full my-8 ${className}`}>
      {/* Main line */}
      <div 
        className="absolute inset-0"
        style={{
          background: variant === 'gradient' ? colors.gradient : colors[variant],
          opacity: 0.3,
        }}
      />
      
      {/* Center accent */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-px"
        style={{
          background: variant === 'gradient' ? colors.gradient : colors[variant],
          opacity: 0.6,
        }}
      />
      
      {/* Center dot */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
        style={{
          background: variant === 'gradient' ? colors.gold : colors[variant],
          opacity: 0.5,
        }}
      />
    </div>
  );
}

// Vertical connector line for elements
export function VerticalConnector({
  variant = 'gold',
  position = 'left',
  className = '',
}: {
  variant?: 'gold' | 'silver';
  position?: 'left' | 'right';
  className?: string;
}) {
  const colors = {
    gold: '#C9A227',
    silver: '#7B9BAD',
  };

  return (
    <div 
      className={`absolute ${position === 'left' ? 'left-0' : 'right-0'} top-0 bottom-0 w-px ${className}`}
      style={{
        background: `linear-gradient(180deg, transparent 0%, ${colors[variant]} 20%, ${colors[variant]} 80%, transparent 100%)`,
        opacity: 0.2,
      }}
    />
  );
}
