import logoLight from "@/assets/logo-light.png";
import logoDark  from "@/assets/logo-dark.png";

/**
 * DesiFit Logo — theme-aware.
 *  • Light theme → blue/cyan DF logo (transparent bg — no blend needed)
 *  • Dark theme  → teal/3D DF logo   (screen blend removes white bg on dark)
 */
export function Logo({ className = "h-8 w-8", style, ...props }) {
  return (
    <>
      {/* ── Light theme logo (visible only in light mode) ── */}
      <img
        src={logoLight}
        alt="DesiFit logo"
        className={`${className} block dark:hidden`}
        style={{ objectFit: "contain", ...style }}
        {...props}
      />

      {/* ── Dark theme logo (visible only in dark mode) ── */}
      <img
        src={logoDark}
        alt="DesiFit logo"
        className={`${className} hidden dark:block`}
        style={{ objectFit: "contain", mixBlendMode: "screen", ...style }}
        {...props}
      />
    </>
  );
}

export default Logo;
