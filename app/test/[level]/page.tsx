import Link from "next/link";
import { notFound } from "next/navigation";

import { DesktopHeader, Screen, TestBar } from "@/components/chrome";
import { LEVELS } from "@/lib/quiz/curriculum";
import { unitSlug } from "@/lib/quiz/routes";

export const dynamicParams = false;

export function generateStaticParams() {
  return LEVELS.map((level) => ({ level: String(level.level) }));
}

export default async function LevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level: id } = await params;
  const level = LEVELS.find((l) => String(l.level) === id);
  if (!level) notFound();

  return (
    <Screen>
      <DesktopHeader
        tone="ink"
        active="/test"
        eyebrow={`LEVEL ${String(level.level).padStart(2, "0")} · ${level.band} · ${level.title.toUpperCase()}`}
        backHref="/test"
        right={`${level.units.length} units · assumes ${level.assumes}`}
      />
      <TestBar
        eyebrow={`LEVEL ${String(level.level).padStart(2, "0")} · ${level.band}`}
        title={level.title}
        backHref="/test"
      />

      <p className="px-[18px] pt-[14px] pb-2 text-[14.5px] leading-[1.45] text-pretty text-slate lg:mx-auto lg:w-full lg:max-w-[900px] lg:px-0 lg:pt-8 lg:text-[16px]">
        {level.blurb} Assumes {level.assumes}.
      </p>

      <main className="flex-1 overflow-y-auto px-4 pb-4 lg:mx-auto lg:grid lg:w-full lg:max-w-[900px] lg:auto-rows-min lg:grid-cols-2 lg:gap-2 lg:px-0">
        {level.units.map((unit) => (
          <Link
            key={unit.id}
            href={`/test/${level.level}/${unitSlug(unit.id)}`}
            className="mb-[5px] flex flex-col gap-1 rounded-[14px] bg-surface px-[13px] py-[11px]"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-display text-[17px] font-bold tracking-[-0.02em]">
                {unit.title}
              </span>
              <span className="flex-none font-mono text-[11px] font-medium text-mute">
                {unit.id}
              </span>
            </div>
            <span className="text-[13.5px] leading-[1.4] text-pretty text-ink-soft">
              {unit.covers}
            </span>
            <span className="font-mono text-[11.5px] font-medium text-mute">
              assumes · {unit.assumes}
            </span>
          </Link>
        ))}
      </main>
    </Screen>
  );
}
