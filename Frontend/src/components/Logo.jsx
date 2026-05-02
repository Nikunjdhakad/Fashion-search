import logoLight from "@/assets/logo-light.png";
import logoDark  from "@/assets/logo-dark.png";

/**
 * Deep Fashion Logo — theme-aware.
 *  • Light theme → gold/neon DDF logo  (mix-blend: multiply removes white bg)
 *  • Dark theme  → teal/3D DF logo     (mix-blend: multiply removes white bg on dark bg)
 */
export function Logo({ className = "h-8 w-8", style, ...props }) {
  return (
    <>
      {/* ── Light theme logo (visible only in light mode) ── */}
      <img
        src={logoLight}
        alt="Deep Fashion logo"
        className={`${className} block dark:hidden`}
        style={{ objectFit: "contain", mixBlendMode: "multiply", ...style }}
        {...props}
      />

      {/* ── Dark theme logo (visible only in dark mode) ── */}
      <img
        src={logoDark}
        alt="Deep Fashion logo"
        className={`${className} hidden dark:block`}
        style={{ objectFit: "contain", mixBlendMode: "screen", ...style }}
        {...props}
      />
    </>
  );
}

export default Logo;
