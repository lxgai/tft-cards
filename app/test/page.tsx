import Link from "next/link";

import { Screen, TabBar, TestBar } from "@/components/chrome";
import { LEVELS, UNITS } from "@/lib/quiz/curriculum";

/**
 * A syllabus, not a progress tracker: no completion marks, no accuracy, no
 * locking, no "recommended next". Every level is one tap away, always.
 */
export default function TestIndex() {
  return (
    <Screen>
      <TestBar
        eyebrow="TEST · SYLLABUS"
        right={`${LEVELS.length} levels · ${UNITS.length} units`}
      />

      <main className="flex-1 overflow-y-auto px-4">
        {LEVELS.map((level, i) => (
          <Link
            key={level.level}
            href={`/test/${level.level}`}
            className="flex gap-3 border-b border-line-soft py-[11px]"
          >
            {/* The ladder: numbers shrink and rungs lengthen as the levels climb. */}
            <div className="flex w-[34px] flex-none flex-col items-center gap-1">
              <span
                className="font-display font-bold tracking-[-0.03em]"
                style={{ fontSize: 20, color: i < 3 ? "var(--color-ink)" : "var(--color-ink-soft)" }}
              >
                {String(level.level).padStart(2, "0")}
              </span>
              {/* The rung lengthens as the levels climb, inside its column. */}
              <span
                className="h-[3px] bg-ink opacity-50"
                style={{ width: 14 + i * 4 }}
                aria-hidden
              />
            </div>

            <div className="flex flex-1 flex-col gap-[3px]">
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className="font-display font-bold tracking-[-0.03em]"
                  style={{ fontSize: 22 - i }}
                >
                  {level.title}
                </span>
                <span className="flex-none font-display text-[10.5px] font-semibold tracking-[.12em] text-mute">
                  {level.band}
                </span>
              </div>
              <span className="text-[13.5px] leading-[1.4] text-pretty text-slate">
                {level.blurb}
              </span>
              <span className="font-mono text-[11.5px] font-medium text-mute">
                {level.units.length} {level.units.length === 1 ? "unit" : "units"} · assumes{" "}
                {level.assumes}
              </span>
            </div>
          </Link>
        ))}
      </main>

      <p className="bg-surface px-4 pt-3 pb-2 text-[12.5px] leading-[1.35] text-trace">
        Pick any unit, any time. Nothing is locked and nothing is saved.
      </p>

      <TabBar active="/test" />
    </Screen>
  );
}
