import Link from "next/link";
import type { ReactNode } from "react";

import { HexDot } from "./hex";

/**
 * The shell. Mobile is a 390px column with a bottom tab bar; from `lg` it
 * becomes a full-width desktop window with the nav in a top header. Both are
 * fixed-height with their own panes scrolling, so only a pane ever moves.
 */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <div
      className="mx-auto flex h-dvh w-full max-w-[520px] flex-col overflow-hidden bg-bone lg:max-w-none"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {children}
    </div>
  );
}

const TABS = [
  { href: "/", label: "HOME" },
  { href: "/study", label: "STUDY" },
  { href: "/test", label: "TEST" },
];

/** Desktop nav. `ink` is the Test section's dark header, `light` the Study one. */
function NavPills({ active, tone }: { active: string; tone: "light" | "ink" }) {
  return (
    <nav className="flex gap-[2px]">
      {TABS.map((tab) => {
        const on = tab.href === active;
        const style = on
          ? tone === "ink"
            ? "bg-on-ink font-bold text-ink"
            : "bg-bone font-bold text-ink"
          : tone === "ink"
            ? "font-semibold text-on-ink-mute"
            : "font-semibold text-mute";
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={on ? "page" : undefined}
            className={`flex min-h-9 items-center rounded-[9px] px-[13px] font-display text-[12px] tracking-[.1em] ${style}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * The desktop header: nav, a marker for which section you are in, and whatever
 * that screen needs on the right. Hidden below `lg`, where the tab bar and the
 * compact bars below do the same job.
 */
export function DesktopHeader({
  tone,
  active,
  eyebrow,
  right,
  backHref,
  children,
}: {
  tone: "light" | "ink";
  active: string;
  eyebrow: string;
  right?: ReactNode;
  backHref?: string;
  children?: ReactNode;
}) {
  const ink = tone === "ink";
  return (
    <header
      className={`hidden min-h-16 items-center gap-4 px-7 lg:flex ${
        ink ? "bg-ink text-on-ink" : "border-b-[1.5px] border-line-soft bg-surface"
      }`}
    >
      {backHref ? (
        <Link href={backHref} aria-label="Back" className="font-display text-[18px] font-bold">
          ←
        </Link>
      ) : null}
      <NavPills active={active} tone={tone} />
      <span className={`h-6 w-px flex-none ${ink ? "bg-ink-soft" : "bg-line-soft"}`} />
      {ink ? <HexDot color="var(--color-gold)" /> : <HexDot />}
      <span
        className={`flex-none font-display text-[12px] font-bold tracking-[.14em] ${
          ink ? "text-gold" : "text-slate"
        }`}
      >
        {eyebrow}
      </span>
      {children}
      <span className="flex-1" />
      {right ? (
        <span
          className={`flex-none font-mono text-[12px] font-medium ${
            ink ? "text-on-ink-mute" : "text-mute"
          }`}
        >
          {right}
        </span>
      ) : null}
    </header>
  );
}

/** Study chrome for mobile: on the paper, and it says nothing is scored. */
export function StudyBar({ label = "STUDY", right }: { label?: string; right?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-3 px-[18px] pt-4 pb-3 lg:hidden">
      <span className="flex items-center gap-2">
        <HexDot />
        <span className="font-display text-[12px] font-bold tracking-[.14em] text-slate">
          {label}
        </span>
      </span>
      {right ? <span className="text-[13px] font-medium text-trace">{right}</span> : null}
    </header>
  );
}

/** Test chrome for mobile: ink, so you always know whether you are being scored. */
export function TestBar({
  eyebrow,
  title,
  right,
  backHref,
}: {
  eyebrow: string;
  title?: string;
  right?: ReactNode;
  backHref?: string;
}) {
  return (
    <header className="flex items-center gap-3 bg-ink px-[18px] py-[14px] text-on-ink lg:hidden">
      {backHref ? (
        <Link
          href={backHref}
          aria-label="Back"
          className="flex size-11 flex-none items-center justify-center font-display text-[18px] font-bold"
        >
          ←
        </Link>
      ) : (
        <HexDot color="var(--color-gold)" />
      )}

      <div className="min-w-0 flex-1">
        <div
          className={`truncate font-display text-[12px] font-bold tracking-[.14em] ${
            title ? "text-gold" : ""
          }`}
        >
          {eyebrow}
        </div>
        {title ? (
          <div className="mt-[2px] font-display text-[22px] font-bold tracking-[-0.03em]">
            {title}
          </div>
        ) : null}
      </div>

      {right ? (
        <span className="flex-none text-[13px] font-semibold text-on-ink-mute">{right}</span>
      ) : null}
    </header>
  );
}

export function TabBar({ active }: { active: string }) {
  return (
    <nav
      className="flex border-t-[1.5px] border-line-soft bg-surface lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {TABS.map((tab) => {
        const on = tab.href === active;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={on ? "page" : undefined}
            className={`flex min-h-[58px] flex-1 items-center justify-center font-display text-[13px] tracking-[.08em] ${
              on ? "font-bold text-ink" : "font-semibold text-mute"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** The ink pill that carries every primary action. */
export function PrimaryButton({
  children,
  onClick,
  href,
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  className?: string;
}) {
  const shared =
    "flex min-h-[60px] flex-1 items-center justify-center rounded-2xl bg-ink px-6 font-display text-[15px] font-bold tracking-[.06em] text-on-ink disabled:opacity-40";
  if (href) {
    return (
      <Link href={href} className={`${shared} ${className}`}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${shared} ${className}`}>
      {children}
    </button>
  );
}
