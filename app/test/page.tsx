import Link from "next/link";

import { DesktopHeader, Screen, TabBar, TestBar } from "@/components/chrome";
import { getDataset } from "@/lib/data/dataset";
import { LEVELS, UNITS } from "@/lib/quiz/curriculum";
import { buildQuiz } from "@/lib/quiz/generate";
import { unitSlug } from "@/lib/quiz/routes";
import type { Level } from "@/lib/quiz/types";

/**
 * A syllabus, not a progress tracker: no completion marks, no accuracy, no
 * locking, no "recommended next". Every level is one tap away, always.
 *
 * Mobile lists the six levels and opens one at a time. Desktop has room to
 * show every unit at once, so it does — two columns, nothing hidden.
 */
export default function TestIndex() {
  const data = getDataset();
  // Question counts are what a unit actually generates, not what it asks for.
  const counts = Object.fromEntries(
    UNITS.map((unit) => [unit.id, buildQuiz(unit, data, 1).questions.length]),
  );

  return (
    <Screen>
      <DesktopHeader
        tone="ink"
        active="/test"
        eyebrow="TEST · SYLLABUS"
        right={`${LEVELS.length} levels · ${UNITS.length} units · nothing locked`}
      />
      <TestBar
        eyebrow="TEST · SYLLABUS"
        right={`${LEVELS.length} levels · ${UNITS.length} units`}
      />

      <main className="flex-1 overflow-y-auto px-4 lg:grid lg:auto-rows-min lg:grid-cols-2 lg:gap-3 lg:px-6 lg:py-5">
        {LEVELS.map((level, i) => (
          <LevelCard key={level.level} level={level} index={i} counts={counts} />
        ))}
      </main>

      <p className="bg-surface px-4 pt-3 pb-2 text-[12.5px] leading-[1.35] text-trace lg:hidden">
        Pick any unit, any time. Nothing is locked and nothing is saved.
      </p>

      <TabBar active="/test" />
    </Screen>
  );
}

function LevelCard({
  level,
  index,
  counts,
}: {
  level: Level;
  index: number;
  counts: Record<string, number>;
}) {
  // Six short units read better two-up than as a six-deep list.
  const twoUp = level.units.length > 4;

  return (
    <section className="border-b border-line-soft py-[11px] lg:flex lg:gap-[18px] lg:rounded-[18px] lg:border-0 lg:bg-surface lg:px-[18px] lg:py-[14px]">
      <div className="flex gap-3 lg:contents">
        {/* The ladder: numbers hold their size while the rungs lengthen. */}
        <div className="flex w-[34px] flex-none flex-col items-center gap-1 lg:w-11 lg:gap-[6px]">
          <span
            className="font-display font-bold tracking-[-0.03em] lg:text-[26px]"
            style={{ fontSize: 20, color: index < 3 ? "var(--color-ink)" : "var(--color-ink-soft)" }}
          >
            {String(level.level).padStart(2, "0")}
          </span>
          <span
            className="h-[3px] bg-ink opacity-50"
            style={{ width: 14 + index * 4 }}
            aria-hidden
          />
        </div>

        <div className="flex flex-1 flex-col gap-[3px] lg:gap-2">
          {/* The heading is the link, so the unit links below can be links too. */}
          <Link href={`/test/${level.level}`} className="flex flex-col gap-[3px] lg:gap-2">
            <span className="flex items-baseline justify-between gap-2">
              <span
                className="font-display font-bold tracking-[-0.03em]"
                style={{ fontSize: 22 - index }}
              >
                {level.title}
              </span>
              <span className="flex-none font-display text-[10.5px] font-semibold tracking-[.12em] text-mute">
                {level.band}
              </span>
            </span>
            <span className="text-[13.5px] leading-[1.4] text-pretty text-slate lg:text-[14px]">
              {level.blurb}
            </span>
            <span className="font-mono text-[11.5px] font-medium text-mute lg:hidden">
              {level.units.length} {level.units.length === 1 ? "unit" : "units"} · assumes{" "}
              {level.assumes}
            </span>
          </Link>

          {/* Desktop shows the units inline; on mobile they live one tap away. */}
          <div className={`hidden pt-1 lg:flex ${twoUp ? "flex-wrap gap-1" : "flex-col gap-1"}`}>
            {level.units.map((unit) => (
              <Link
                key={unit.id}
                href={`/test/${level.level}/${unitSlug(unit.id)}`}
                className="flex min-h-8 items-center gap-3 rounded-[9px] bg-bone px-3"
                style={twoUp ? { width: "calc(50% - 2px)" } : undefined}
              >
                <span className="font-mono text-[12px] text-trace">{unit.id}</span>
                <span className="flex-1 truncate text-[15px] font-semibold">
                  {twoUp ? unit.title.replace(" champions", "") : unit.title}
                </span>
                {twoUp ? null : (
                  <span className="font-mono text-[11.5px] text-mute">{counts[unit.id]} q</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
