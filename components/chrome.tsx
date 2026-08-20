import Link from "next/link";
import type { ReactNode } from "react";

import { HexDot } from "./hex";

/** Full-height mobile shell. Everything is designed at 390px first. */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <div
      className="mx-auto flex h-dvh w-full max-w-[520px] flex-col overflow-hidden bg-bone"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {children}
    </div>
  );
}

/** Study chrome: on the paper, quiet, and it says out loud that nothing is scored. */
export function StudyBar({ label = "STUDY", right }: { label?: string; right?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-3 px-[18px] pt-4 pb-3">
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

/** Test chrome: ink, so you always know whether you are being scored. */
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
    <header className="flex items-center gap-3 bg-ink px-[18px] py-[14px] text-on-ink">
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

const TABS = [
  { href: "/", label: "HOME" },
  { href: "/study", label: "STUDY" },
  { href: "/test", label: "TEST" },
];

export function TabBar({ active }: { active: string }) {
  return (
    <nav
      className="flex border-t-[1.5px] border-line-soft bg-surface"
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
