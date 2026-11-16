interface WeevLogoProps {
  className?: string;
  size?: number;
  variant?: "mark" | "full" | "lockup" | "mascot";
  light?: boolean;
}

/**
 * WEEV Official Brandmark & Wordmark (Official Stakeholder-Approved Mascot & Heart Direction)
 * Vibrant, modern, friendly tech platform identity:
 * - Smart Cool Brain Mascot with Sunglasses, Golden Rings & Star Calendar
 * - Custom Heart "weev" Wordmark in Royal Aubergine (#2E1741) & Bubblegum Pink (#DB619B)
 */
export function WeevLogo({
  className = "",
  size = 36,
  variant = "full",
  light = false,
}: WeevLogoProps) {
  // Standalone Heart 'W' Mark
  if (variant === "mark") {
    return (
      <img
        src="/preview/logos/weev-app-icon-heart.png"
        alt="WEEV Mark"
        width={size}
        height={size}
        className={`shrink-0 rounded-xl object-contain ${light ? "brightness-110" : ""} ${className}`}
      />
    );
  }

  // Standalone Mascot Mark
  if (variant === "mascot") {
    return (
      <img
        src="/preview/logos/weev-app-icon-mascot.png"
        alt="WEEV Mascot"
        width={size}
        height={size}
        className={`shrink-0 rounded-2xl object-contain ${light ? "brightness-110" : ""} ${className}`}
      />
    );
  }

  // Full Brand Lockup
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <img
        src="/preview/logos/weev-mascot-transparent.png"
        alt="WEEV"
        style={{ height: size, width: "auto" }}
        className={`shrink-0 object-contain ${light ? "brightness-110" : ""}`}
      />
    </div>
  );
}

export default WeevLogo;
