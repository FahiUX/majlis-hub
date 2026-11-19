import { useEffect, useState } from 'react';

/**
 * Launch splash: the approved WEEV logo animation (docs/brand/LOGO.md §7).
 * Once per browser session, only when the app opens on Home (shared links such as
 * an invitation open straight away). Tap to skip. Reduced motion = no splash.
 */
const KEY = 'weev.splash';
const VIDEO_BG = '#FAF7EE'; // the MP4's linen as the browser renders it, so the frame edge never shows

function shouldShow(): boolean {
  try {
    if (sessionStorage.getItem(KEY)) return false;
    sessionStorage.setItem(KEY, '1');
  } catch { /* storage blocked: still show once per load */ }
  const onHome = !location.hash || location.hash === '#/' || location.hash === '#';
  return onHome && !matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function Splash() {
  const [show, setShow] = useState(shouldShow);
  const [leaving, setLeaving] = useState(false);
  const close = () => setLeaving(true);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(close, 7000); // safety net if the video stalls
    return () => clearTimeout(t);
  }, [show]);

  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setShow(false), 350);
    return () => clearTimeout(t);
  }, [leaving]);

  if (!show) return null;
  return (
    <button
      type="button"
      aria-label="Langkau animasi pembukaan"
      onClick={close}
      className={`absolute inset-0 z-[70] flex items-center justify-center overflow-hidden transition-opacity duration-300 ${leaving ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: VIDEO_BG }}
    >
      {/* logo fills ~57% of the 16:9 frame; 115% width makes it ~66% (clear space ≥ one e-height, LOGO.md §5) of a phone's width */}
      <video
        src="brand/weev-logo-animation-1080p.mp4"
        autoPlay muted playsInline preload="auto"
        onEnded={() => setTimeout(close, 400)}
        onError={close}
        aria-hidden="true"
        className="w-[115%] max-w-none aspect-video shrink-0 pointer-events-none"
      />
    </button>
  );
}

export default Splash;
