interface WeevLogoProps {
  className?: string;
  /** height in px */
  size?: number;
  /** full = `weev` wordmark · mark = heart-ribbon W · mascot = Tempa */
  variant?: 'full' | 'mark' | 'mascot';
  /** white ink, for dark backgrounds */
  light?: boolean;
}

/**
 * WEEV logo. 🔒 Brand lock: these are the approved files from preview/logos/final/,
 * copied byte-for-byte into public/brand/ by scripts/brand/sync-public.sh.
 * Never redraw, recolour or inline the artwork here (docs/brand/LOGO.md).
 * Min sizes: wordmark 80px wide (size ≥ 24), W mark 16px.
 */
const SRC = {
  full: ['brand/weev-wordmark.svg', 'brand/weev-wordmark-white.svg'],
  mark: ['brand/weev-w-mark.svg', 'brand/weev-w-mark-white.svg'],
  mascot: ['brand/weev-tempa.png', 'brand/weev-tempa.png'],
} as const;

export function WeevLogo({ className = '', size = 32, variant = 'full', light = false }: WeevLogoProps) {
  return (
    <img
      src={SRC[variant][light ? 1 : 0]}
      alt={variant === 'mascot' ? 'Tempa, maskot WEEV' : 'WEEV'}
      style={{ height: size, width: 'auto' }}
      className={`shrink-0 object-contain select-none ${className}`}
      draggable={false}
    />
  );
}

export default WeevLogo;
