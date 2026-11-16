interface WeevLogoProps {
  className?: string;
  size?: number;
  variant?: 'mark' | 'full' | 'lockup';
  light?: boolean;
}

/**
 * WEEV Official Brandmark & Wordmark (Concept B: The Eternal Swash Serif)
 * Visual Concept: Didot Roman Serif 'W' intertwined with an unbroken
 * calligraphic Champagne Gold infinity ribbon swash (#E5BE64) on Imperial Merlot (#481226).
 */
export function WeevLogo({
  className = '',
  size = 32,
  variant = 'full',
  light = false,
}: WeevLogoProps) {
  const gold = '#E5BE64';
  const merlot = '#481226';
  const textColor = light ? '#FFFFFF' : '#481226';

  // Concept B Mark SVG (scaled from 512x512 canonical vector)
  const emblem = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      <rect
        width="512"
        height="512"
        rx="112"
        fill={light ? 'rgba(255,255,255,0.18)' : merlot}
      />
      <rect
        x="2"
        y="2"
        width="508"
        height="508"
        rx="110"
        stroke={gold}
        strokeOpacity={light ? '0.6' : '0.35'}
        strokeWidth="4"
      />
      {/* Top Serifs */}
      <path
        d="M110 132 H172 M141 132 V155 M340 132 H402 M371 132 V155"
        stroke={gold}
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bold Serif Downstrokes */}
      <path
        d="M141 146 L202 338 L256 182 L310 338 L371 146"
        stroke={gold}
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Center Hairline Accent */}
      <path
        d="M141 146 L256 348 L371 146"
        stroke={light ? '#FFFFFF' : '#FAF7F4'}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Eternal Weave / Infinity Swash Ribbon */}
      <path
        d="M 74 330 C 52 375 92 418 152 396 C 218 372 242 278 298 288 C 354 298 424 382 438 334 C 448 290 398 252 344 268"
        stroke={gold}
        strokeWidth="18"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Matrimonial Spark Accent */}
      <circle cx="256" cy="152" r="8" fill={light ? '#FFFFFF' : '#FAF7F4'} />
      <circle cx="256" cy="152" r="14" stroke={gold} strokeWidth="3" />
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
