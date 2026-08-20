"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

import { getDataset } from "@/lib/data/dataset";
import { findUnit } from "@/lib/quiz/curriculum";
import { buildQuiz } from "@/lib/quiz/generate";

import { DesktopHeader, Screen, TestBar } from "./chrome";
import { QuizRunner } from "./quiz-runner";

const subscribe = () => () => {};

/** True once hydration is done. No state, so no cascading render. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/**
 * Builds the attempt in the browser with a fresh seed, so the same unit gives
 * different questions each time you open it. It cannot be prerendered — a
 * static page would bake one draw in forever — and it cannot be drawn during
 * the first render either, or the server and client would disagree.
 */
export function QuizPage({ unitId, backHref }: { unitId: string; backHref: string }) {
  const unit = findUnit(unitId)!;
  const hydrated = useHydrated();
  const [seed] = useState(() => Math.floor(Math.random() * 1_000_000_000));
  const quiz = useMemo(
    () => (hydrated ? buildQuiz(unit, getDataset(), seed) : null),
    [hydrated, unit, seed],
  );

  if (!quiz) {
    return (
      <Screen>
        <DesktopHeader
          tone="ink"
          active="/test"
          eyebrow={`${unit.id} · ${unit.title.toUpperCase()}`}
          backHref={backHref}
        />
        <TestBar eyebrow={`${unit.id} · ${unit.title.toUpperCase()}`} />
        <div className="flex flex-1 items-center justify-center">
          <p className="font-display text-[15px] font-bold tracking-[.06em] text-mute">DEALING…</p>
        </div>
      </Screen>
    );
  }

  // Keyed on the draw so a retry, which replaces the quiz, starts clean.
  return <QuizRunner key={seed} quiz={quiz} unit={unit} backHref={backHref} />;
}
