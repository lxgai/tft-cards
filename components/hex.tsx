import type { CSSProperties, ReactNode } from "react";

import type { Swatch } from "./tiers";

/**
 * The signature element. Cost and breakpoint tiers both live in a hexagon, so
 * the two ladders read the same way at a glance.
 */
export function Hex({
  swatch,
  width,
  height,
  children,
  fontSize,
  className = "",
  style,
}: {
  swatch: Swatch;
  width: number;
  height: number;
  children?: ReactNode;
  fontSize?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={`hex flex flex-none items-center justify-center font-display font-bold ${className}`}
      style={{
        width,
        height,
        background: swatch.fill,
        color: swatch.ink,
        fontSize: fontSize ?? Math.round(height * 0.42),
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** The small solid hex used as a section marker. */
export function HexDot({ color = "var(--color-trace)", size = 9 }: { color?: string; size?: number }) {
  return <span className="hex flex-none" style={{ width: size, height: size, background: color }} />;
}
