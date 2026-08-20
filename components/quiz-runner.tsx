"use client";

import Link from "next/link";

import { Blocks } from "@/components/blocks";
import { DesktopHeader, Screen, TestBar } from "@/components/chrome";
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
 *
 * Mobile stacks the question over its answers. From `lg` the question holds the
 * left of the window and the answers sit in a panel on the right, so a long
 * option list never pushes the subject off screen.
 */
export function QuizRunner({ quiz, unit, backHref }: { quiz: Quiz; unit: Unit; backHref: string }) {
  const session = useQuizSession(quiz);

  if (session.result) {
    return (
      <Results result={session.result} unit={unit} backHref={backHref} onRetry={session.retryMisses} />
    );
  }

  const question = session.question;
  if (!question) return null;

  const picked = session.answers[question.id] ?? [];
  const multi = question.mode === "multi";
  const eyebrow = `${unit.id} · ${unit.title.toUpperCase()}`;
  const counter = `${session.index + 1} / ${session.quiz.questions.length}`;

  // The subject is the thing you have to recognize, so it leads. Rendering it
  // in a surface card put it in the answer list's clothes — it read as a fifth
  // option you could tap.
  const subject = question.prompt.find((block) => block.type === "subject");
  const extras = question.prompt.filter((block) => block.type !== "subject");

  const options = (
    <div
      role={multi ? "group" : "radiogroup"}
      aria-label={question.lead}
      className={`grid pb-3 ${multi ? "gap-[2px] lg:grid-cols-2 lg:gap-2" : "gap-[11px] lg:gap-[10px]"}`}
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
  );

  const footer = (
    <>
      {multi ? (
        <div className="flex-none font-display text-[20px] font-bold lg:text-[22px]">
          {picked.length}
          <span className="font-body text-[13px] font-semibold text-mute lg:text-[14px]">
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
        className={`flex min-h-[52px] items-center justify-center rounded-[13px] bg-ink px-6 font-display text-[13px] font-bold tracking-[.06em] text-on-ink lg:min-h-14 lg:w-[200px] lg:flex-none lg:rounded-[14px] lg:text-[14px] ${
          multi ? "flex-1 lg:flex-none" : "flex-none"
        }`}
      >
        {session.isLast ? "FINISH" : "NEXT"}
      </button>
    </>
  );

  return (
    <Screen>
      <DesktopHeader tone="ink" active="/test" eyebrow={eyebrow} backHref={backHref} right={counter}>
        <div className="flex flex-1 gap-[3px] px-6">
          {session.quiz.questions.map((q, i) => (
            <span
              key={q.id}
              className={`h-1 flex-1 rounded-full ${
                i < session.index ? "bg-on-ink" : i === session.index ? "bg-slate" : "bg-ink-soft"
              }`}
            />
          ))}
        </div>
      </DesktopHeader>

      <TestBar eyebrow={eyebrow} right={counter} />

      <div className="flex flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[1fr_620px] lg:overflow-hidden">
        {/* The question */}
        <div className="flex flex-col overflow-hidden lg:gap-6 lg:overflow-y-auto lg:px-14 lg:py-16">
          <div className={multi ? "px-[18px] pt-3 pb-3 lg:p-0" : "px-[18px] pt-[26px] pb-5 lg:p-0"}>
            {subject ? (
              <>
                <p className="text-[14px] font-semibold text-slate lg:text-[16px]">{question.lead}</p>
                <h1 className="mt-1 font-display text-[36px] leading-[1.05] font-bold tracking-[-0.04em] text-pretty lg:mt-6 lg:text-[76px] lg:leading-none lg:tracking-[-0.045em]">
                  {subject.text}
                </h1>
                {/*
                 * The design puts a cost hex here. A prompt never shows a
                 * champion's cost — that is L1's answer and a hint everywhere
                 * else — so the count carries the line on its own.
                 */}
                {multi ? (
                  <p className="mt-5 hidden font-mono text-[12px] tracking-[.09em] text-mute uppercase lg:block">
                    {question.correct.length} of these belong to it
                  </p>
                ) : null}
              </>
            ) : (
              <h1
                className={`font-display font-bold tracking-[-0.03em] text-pretty ${
                  multi
                    ? "text-[21px] leading-[1.25] lg:text-[46px] lg:leading-[1.1]"
                    : "text-[28px] leading-[1.25] lg:text-[52px] lg:leading-[1.1]"
                }`}
              >
                <Lead text={question.lead} emphasis={question.emphasis} />
              </h1>
            )}
          </div>

          {extras.length > 0 ? (
            <div className="mx-[18px] mb-4 flex max-h-[38vh] flex-col gap-3 overflow-y-auto rounded-[16px] bg-surface p-[18px] lg:mx-0 lg:mb-0 lg:max-h-none lg:overflow-visible lg:bg-transparent lg:p-0 lg:text-[18px]">
              <Blocks blocks={extras} />
            </div>
          ) : null}

          <span className="hidden flex-1 lg:block" />
          <p className="hidden text-[13px] text-trace lg:block">
            Graded at the end, not now. Nothing is stored — leaving this page ends the attempt.
          </p>
        </div>

        {/* The answers */}
        <div className="flex flex-1 flex-col overflow-hidden lg:border-l-[1.5px] lg:border-line-soft lg:bg-surface">
          <div className={`flex-1 overflow-y-auto lg:px-8 lg:pt-8 ${multi ? "px-4" : "px-[18px]"}`}>
            {options}
          </div>
          <div
            className="flex items-center gap-3 border-t-[1.5px] border-line-soft bg-surface px-4 pt-3 pb-[18px] lg:gap-4 lg:px-8 lg:pt-4 lg:pb-6"
            style={{ paddingBottom: "calc(18px + env(safe-area-inset-bottom))" }}
          >
            {footer}
          </div>
        </div>
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
  const base = selected ? "border-ink bg-ink text-on-ink" : "border-line bg-surface text-ink";

  if (compact) {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={selected}
        onClick={onSelect}
        className={`flex min-h-[46px] items-center gap-[10px] rounded-[11px] border-[1.5px] px-[11px] text-left lg:min-h-[52px] lg:rounded-xl lg:px-[14px] ${base}`}
      >
        {option.cost ? (
          <Hex swatch={costSwatch(option.cost)} className="h-[25px] w-[22px] text-[11px]">
            {option.cost}
          </Hex>
        ) : null}
        <span className="flex-1 text-[15px] font-semibold lg:text-[16px]">{option.label}</span>
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
        <Hex swatch={costSwatch(option.cost)} className="h-[30px] w-[26px] text-[12px]">
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
      <DesktopHeader
        tone="ink"
        active="/test"
        eyebrow={`${unit.id} · DONE`}
        backHref={backHref}
        right={`${result.correct} / ${result.total}`}
      />

      <div className="flex flex-1 flex-col overflow-hidden lg:mx-auto lg:w-full lg:max-w-[900px]">
        <header
          className="bg-ink px-[18px] pt-5 pb-[22px] text-on-ink lg:bg-transparent lg:px-0 lg:pt-10 lg:text-ink"
          style={{ paddingTop: "calc(20px + env(safe-area-inset-top))" }}
        >
          <div className="font-display text-[12px] font-bold tracking-[.14em] text-gold lg:hidden">
            {unit.id} · DONE
          </div>
          <div className="mt-2 flex items-baseline gap-[10px] lg:mt-0">
            <span className="font-display text-[56px] leading-none font-bold tracking-[-0.04em] lg:text-[88px]">
              {result.correct}
            </span>
            <span className="text-[20px] font-semibold text-on-ink-mute lg:text-[24px] lg:text-slate">
              of {result.total} correct
            </span>
          </div>
          <p className="mt-2 text-[13px] text-trace">
            This score isn&rsquo;t saved. Leave the screen and it&rsquo;s gone.
          </p>
        </header>

        {result.misses.length ? (
          <>
            <h2 className="px-4 pt-[14px] pb-2 font-display text-[12px] font-bold tracking-[.14em] text-trace lg:px-0 lg:pt-8">
              {result.misses.length === 1
                ? "THE ONE YOU MISSED"
                : `THE ${result.misses.length} YOU MISSED`}
            </h2>
            <div className="flex-1 overflow-y-auto px-4 lg:grid lg:grid-cols-2 lg:content-start lg:gap-x-3 lg:px-0">
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
          className="flex gap-[10px] border-t-[1.5px] border-line-soft bg-surface px-4 pt-[10px] pb-[18px] lg:mt-6 lg:rounded-t-2xl lg:px-6 lg:py-5"
          style={{ paddingBottom: "calc(18px + env(safe-area-inset-bottom))" }}
        >
          {result.misses.length ? (
            <button
              type="button"
              onClick={onRetry}
              className="flex min-h-[56px] flex-1 items-center justify-center rounded-[15px] bg-ink font-display text-[14px] font-bold tracking-[.05em] text-on-ink lg:flex-none lg:px-10"
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
      </div>
    </Screen>
  );
}

/**
 * What the question was actually about. The lead alone is often generic —
 * "Origin, Class, or Unique?" tells you nothing a week later — so a miss has
 * to carry its subject too.
 */
function subjectOf(question: Question): string | null {
  for (const block of question.prompt) {
    if (block.type === "subject") return block.text;
    if (block.type === "chips") return block.items.map((item) => item.label).join(" + ");
    if (block.type === "text") {
      const first = block.text.split("\n")[0].trim();
      return first.length > 96 ? `${first.slice(0, 93).trimEnd()}…` : first;
    }
  }
  return null;
}

function Miss({ question, given }: { question: Question; given: string[] }) {
  const label = (ids: string[]) =>
    question.options
      .filter((o) => ids.includes(o.id))
      .map((o) => o.label)
      .join(", ");
  const subject = subjectOf(question);

  return (
    <div className="mb-2 flex flex-col gap-[6px] rounded-[14px] border-l-4 border-wrong bg-surface p-[14px]">
      {subject ? (
        <p className="font-display text-[17px] leading-[1.2] font-bold tracking-[-0.02em] text-pretty">
          {subject}
        </p>
      ) : null}
      <p
        className={`leading-[1.35] text-pretty ${
          subject ? "text-[13.5px] text-slate" : "text-[14.5px] font-semibold text-ink-soft"
        }`}
      >
        {question.lead}
      </p>
      <p className="text-[13px] font-medium text-wrong-ink">
        you · {given.length ? label(given) : "no answer"}
      </p>
      <p className="font-display text-[14px] font-bold text-correct-ink">{label(question.correct)}</p>
    </div>
  );
}
