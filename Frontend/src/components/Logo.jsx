/**
 * Deep Fashion "DF" Monogram Logo
 * A premium, creative monogram where D & F interlock with a fashion-forward aesthetic.
 * The D forms an elegant curve that flows into the F's crossbars.
 */
export function Logo({ className = "h-8 w-8", ...props }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Deep Fashion logo"
      {...props}
    >
      <defs>
        <linearGradient id="df-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#312e81" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
        <linearGradient id="df-letter" x1="10" y1="12" x2="54" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="40%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="df-accent" x1="40" y1="8" x2="56" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f0abfc" />
          <stop offset="100%" stopColor="#e879f9" />
        </linearGradient>
      </defs>

      {/* Background — deep indigo rounded square */}
      <rect width="64" height="64" rx="16" fill="url(#df-bg)" />

      {/* Subtle inner glow */}
      <rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="1" />

      {/* ═══ "D" letter — elegant curved stroke ═══ */}
      <path
        d="M14 14 L14 50 L24 50 C38 50 44 42 44 32 C44 22 38 14 24 14 Z"
        fill="none"
        stroke="url(#df-letter)"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* ═══ "F" letter — overlapping, offset right ═══ */}
      {/* Vertical stem */}
      <line
        x1="34" y1="14"
        x2="34" y2="50"
        stroke="url(#df-letter)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Top bar */}
      <line
        x1="34" y1="14"
        x2="52" y2="14"
        stroke="url(#df-letter)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Middle bar */}
      <line
        x1="34" y1="32"
        x2="48" y2="32"
        stroke="url(#df-letter)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* ═══ Fashion accent — small diamond sparkle ═══ */}
      <path
        d="M53 8 L55 12 L53 16 L51 12 Z"
        fill="url(#df-accent)"
      />
      <circle cx="53" cy="12" r="1.5" fill="white" opacity="0.9" />
    </svg>
  );
}

export default Logo;
