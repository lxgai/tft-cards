"use client";

import Link from "next/link";

import { Blocks } from "@/components/blocks";
import { Screen, TestBar } from "@/components/chrome";
import { Hex } from "@/components/hex";
import { costSwatch } from "@/components/tiers";
import { useQuizSession } from "@/lib/quiz/session";
import type { Option, Question, Quiz, Result, Unit } from "@/lib/quiz/types";

/**
 * One quiz attempt.
 *
 * Answers are collected without judgement and graded once, at the end — the
 * brief is to answer straight through without interruption, so there is no
 * right/wrong feedback until the results screen. Nothing is stored anywhere:
 * leaving the page ends the attempt.
 */
export function QuizRunner({ quiz, unit, backHref }: { quiz: Quiz; unit: Unit; backHref: string }) {
  const session = useQuizSession(quiz);

  if (session.result) {
    return (
      <Results
        result={session.result}
        unit={unit}
        backHref={backHref}
        onRetry={session.retryMisses}
      />
    );
  }

  const question = session.question;
  if (!question) return null;

  const picked = session.answers[question.id] ?? [];
  const multi = question.mode === "multi";

  return (
    <Screen>
      <TestBar
        eyebrow={`${unit.id} · ${unit.title.toUpperCase()}`}
        right={`${session.index + 1} / ${session.quiz.questions.length}`}
      />

      <div className={multi ? "px-[18px] pt-3 pb-2" : "px-[18px] pt-[26px] pb-5"}>
        <h1
          className={`font-display font-bold tracking-[-0.03em] text-pretty ${
            multi ? "text-[21px] leading-[1.25]" : "text-[28px] leading-[1.25]"
          }`}
        >
          <Lead text={question.lead} emphasis={question.emphasis} />
        </h1>
      </div>

      {question.prompt.length > 0 ? (
        <div className="mx-[18px] mb-4 flex max-h-[42vh] flex-col gap-3 overflow-y-auto rounded-[16px] bg-surface p-[18px]">
          <Blocks blocks={question.prompt} />
        </div>
      ) : null}

      <div className={`flex-1 overflow-y-auto ${multi ? "px-4" : "px-[18px]"}`}>
        <div
          role={multi ? "group" : "radiogroup"}
          aria-label={question.lead}
          className={`flex flex-col pb-3 ${multi ? "gap-[2px]" : "gap-[11px]"}`}
        >
          {question.options.map((option) => (
            <OptionRow
              key={option.id}
              option={option}
              compact={multi}
              selected={picked.includes(option.id)}
              multi={multi}
              onSelect={() => session.select(option.id)}
            />
          ))}
        </div>
      </div>

      <div
        className="flex items-center gap-3 border-t-[1.5px] border-line-soft bg-surface px-[16px] pt-3 pb-[18px]"
        style={{ paddingBottom: "calc(18px + env(safe-area-inset-bottom))" }}
      >
        {multi ? (
          <div className="flex-none font-display text-[20px] font-bold">
            {picked.length}
            <span className="font-body text-[13px] font-semibold text-mute">
              {" "}
              / {question.correct.length} picked
            </span>
          </div>
        ) : (
          <span className="flex-1 text-[12.5px] leading-[1.35] text-trace">
            Graded at the end, not now.
          </span>
        )}

        <button
          type="button"
          onClick={() => (session.isLast ? session.submit() : session.next())}
          className={`flex min-h-[52px] items-center justify-center rounded-[13px] bg-ink px-6 font-display text-[13px] font-bold tracking-[.06em] text-on-ink ${
            multi ? "flex-1" : "flex-none"
          }`}
        >
          {session.isLast ? "FINISH" : "NEXT"}
        </button>
      </div>
    </Screen>
  );
}

/** Highlights the word the question turns on — "not", or the trait being asked. */
function Lead({ text, emphasis }: { text: string; emphasis?: string }) {
  if (!emphasis) return <>{text}</>;
  const at = text.indexOf(emphasis);
  if (at === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <span className="bg-gold px-[5px]">{emphasis}</span>
      {text.slice(at + emphasis.length)}
    </>
  );
}

function OptionRow({
  option,
  selected,
  compact,
  multi,
  onSelect,
}: {
  option: Option;
  selected: boolean;
  compact: boolean;
  multi: boolean;
  onSelect: () => void;
}) {
  const base = selected
    ? "border-ink bg-ink text-on-ink"
    : "border-line bg-surface text-ink";

  if (compact) {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        onClick={onSelect}
        className={`flex min-h-[46px] items-center gap-[10px] rounded-[11px] border-[1.5px] px-[11px] text-left ${base}`}
      >
        {option.cost ? (
          <Hex swatch={costSwatch(option.cost)} width={22} height={25} fontSize={11}>
            {option.cost}
          </Hex>
        ) : null}
        <span className="flex-1 text-[15px] font-semibold">{option.label}</span>
        <span className="font-display text-[14px] font-bold" aria-hidden>
          {selected ? "✓" : ""}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onSelect}
      className={`flex min-h-[62px] flex-none items-center gap-3 rounded-[14px] border-[1.5px] px-[18px] py-3 text-left ${base}`}
    >
      {option.cost ? (
        <Hex swatch={costSwatch(option.cost)} width={26} height={30} fontSize={12}>
          {option.cost}
        </Hex>
      ) : null}
      <span className="flex-1">
        <span className="block text-[18px] font-semibold">{option.label}</span>
        {option.body ? (
          <span
            className={`mt-1 block text-[14px] leading-[1.45] ${
              selected ? "text-on-ink-mute" : "text-ink-soft"
            }`}
          >
            {option.body}
          </span>
        ) : null}
      </span>
    </button>
  );
}

function Results({
  result,
  unit,
  backHref,
  onRetry,
}: {
  result: Result;
  unit: Unit;
  backHref: string;
  onRetry: () => boolean;
}) {
  return (
    <Screen>
      <header
        className="bg-ink px-[18px] pt-5 pb-[22px] text-on-ink"
        style={{ paddingTop: "calc(20px + env(safe-area-inset-top))" }}
      >
        <div className="font-display text-[12px] font-bold tracking-[.14em] text-gold">
          {unit.id} · DONE
        </div>
        <div className="mt-2 flex items-baseline gap-[10px]">
          <span className="font-display text-[56px] leading-none font-bold tracking-[-0.04em]">
            {result.correct}
          </span>
          <span className="text-[20px] font-semibold text-on-ink-mute">
            of {result.total} correct
          </span>
        </div>
        <p className="mt-2 text-[13px] text-trace">
          This score isn&rsquo;t saved. Leave the screen and it&rsquo;s gone.
        </p>
      </header>

      {result.misses.length ? (
        <>
          <h2 className="px-[16px] pt-[14px] pb-2 font-display text-[12px] font-bold tracking-[.14em] text-trace">
            {result.misses.length === 1
              ? "THE ONE YOU MISSED"
              : `THE ${result.misses.length} YOU MISSED`}
          </h2>
          <div className="flex-1 overflow-y-auto px-[16px]">
            {result.misses.map(({ question, given }) => (
              <Miss key={question.id} question={question} given={given} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center px-8 text-center">
          <p className="font-display text-[22px] font-bold tracking-[-0.02em] text-slate">
            Clean run. Nothing to review.
          </p>
        </div>
      )}

      <div
        className="flex gap-[10px] border-t-[1.5px] border-line-soft bg-surface px-[16px] pt-[10px] pb-[18px]"
        style={{ paddingBottom: "calc(18px + env(safe-area-inset-bottom))" }}
      >
        {result.misses.length ? (
          <button
            type="button"
            onClick={onRetry}
            className="flex min-h-[56px] flex-1 items-center justify-center rounded-[15px] bg-ink font-display text-[14px] font-bold tracking-[.05em] text-on-ink"
          >
            RETRY MISSES
          </button>
        ) : null}
        <Link
          href={backHref}
          className={`flex min-h-[56px] items-center justify-center rounded-[15px] border-[1.5px] border-line bg-surface px-[18px] font-display text-[14px] font-bold text-slate ${
            result.misses.length ? "" : "flex-1"
          }`}
        >
          DONE
        </Link>
      </div>
    </Screen>
  );
}

function Miss({ question, given }: { question: Question; given: string[] }) {
  const label = (ids: string[]) =>
    question.options
      .filter((o) => ids.includes(o.id))
      .map((o) => o.label)
      .join(", ");

  return (
    <div className="mb-2 flex flex-col gap-[6px] rounded-[14px] border-l-4 border-wrong bg-surface p-[14px]">
      <p className="text-[14.5px] leading-[1.35] font-semibold text-pretty text-ink-soft">
        {question.lead}
      </p>
      <p className="text-[13px] font-medium text-wrong-ink">
        you · {given.length ? label(given) : "no answer"}
      </p>
      <p className="font-display text-[14px] font-bold text-correct-ink">{label(question.correct)}</p>
    </div>
  );
}
