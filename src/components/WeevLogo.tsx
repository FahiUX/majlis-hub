interface WeevLogoProps {
  className?: string;
  size?: number;
  variant?: 'mark' | 'full' | 'lockup';
  light?: boolean;
}

/**
 * WEEV Official Brandmark & Wordmark (v2.0)
 * Visual Concept: "The Infinite Weave" — Two celebratory rings seamlessly interwoven
 * into a modern geometric 'W'. Represents matrimonial union, multi-cultural harmony,
 * and high-ticket event craftsmanship.
 */
export function WeevLogo({
  className = '',
  size = 32,
  variant = 'full',
  light = false,
}: WeevLogoProps) {
  const accentColor = '#E5BE64'; // Champagne Gold
  const textColor = light ? '#FFFFFF' : '#1C0912';

  // Mark SVG: 40x40 viewport
  const emblem = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="11" fill={light ? 'rgba(255,255,255,0.14)' : '#481226'} />
      {/* Interlocking celebration loops forming 'W' */}
      <path
        d="M9 13.5L14 26.5L18 16.5L20 21.5L22 16.5L26 26.5L31 13.5"
        stroke={light ? '#FFFFFF' : '#FAF7F4'}
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Champagne Gold Wedding Ring Accent */}
      <circle
        cx="20"
        cy="15"
        r="4.2"
        stroke={accentColor}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Micro-sparkle point */}
      <circle cx="20" cy="11" r="1" fill={accentColor} />
    </svg>
  );

  if (variant === 'mark') {
    return <span className={`inline-flex items-center ${className}`}>{emblem}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-2 font-display select-none ${className}`}>
      {emblem}
      <span className="flex flex-col leading-none">
        <span
          className="text-[20px] font-bold tracking-[0.08em]"
          style={{ color: textColor }}
        >
          WEEV
        </span>
        {variant === 'lockup' && (
          <span
            className="text-[9px] font-sans font-medium tracking-[0.14em] uppercase"
            style={{ color: light ? 'rgba(255,255,255,0.65)' : '#6F6167' }}
          >
            Verified Events
          </span>
        )}
      </span>
    </span>
  );
}

export default WeevLogo;
