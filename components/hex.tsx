import type { ReactNode } from "react";

import type { Swatch } from "./tiers";

/**
 * The signature element. Cost and breakpoint tiers both live in a hexagon, so
 * the two ladders read the same way at a glance.
 *
 * Size comes from `className` rather than props, so a caller can grow one at a
 * breakpoint — an inline width would win over any `lg:` utility.
 */
export function Hex({
  swatch,
  className = "",
  children,
}: {
  swatch: Swatch;
  /** Sizing and type scale, e.g. "h-[72px] w-16 text-[30px] lg:h-[86px]". */
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={`hex flex flex-none items-center justify-center font-display font-bold ${className}`}
      style={{ background: swatch.fill, color: swatch.ink }}
    >
      {children}
    </span>
  );
}

/** The small solid hex used as a section marker. */
export function HexDot({ color = "var(--color-trace)", className = "h-[9px] w-2" }) {
  return <span className={`hex flex-none ${className}`} style={{ background: color }} />;
}
