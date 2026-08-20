"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { orderCards } from "@/lib/cards/decks";
import type { Card, CardBlock, Deck } from "@/lib/cards/types";

import { Blocks } from "./blocks";
import { DesktopHeader, Screen, StudyBar } from "./chrome";
import { Hex } from "./hex";
import { accentSwatch, costSwatch } from "./tiers";

const SWIPE = 48;

/** A deck as the rail needs it — a name, a size and a colour, not 341 cards. */
export type RailDeck = {
  id: string;
  title: string;
  count: number;
  section: string;
  fill: string;
};

/**
 * A deck is a list of cards and a direction to move through it. There is no
 * right answer here, nothing is counted, and nothing survives leaving the page.
 *
 * Mobile flips one card at a time. From `lg` the card opens into two columns —
 * the champion stays put on the left while the answer appears beside it — with
 * the deck list on one side and this deck's contents on the other.
 */
export function DeckRunner({ deck, rail }: { deck: Deck; rail: RailDeck[] }) {
  const [shuffled, setShuffled] = useState(false);
  const [seed, setSeed] = useState(0);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [railOpen, setRailOpen] = useState(true);
  const [indexOpen, setIndexOpen] = useState(true);
  const touchX = useRef<number | null>(null);

  const cards = orderCards(deck, shuffled, seed);
  const card = cards[index];
  const accent = accentSwatch(deck.accent);
  const counter = `card ${index + 1} of ${cards.length}`;

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => Math.max(0, Math.min(i + delta, cards.length - 1)));
      setFlipped(false);
    },
    [cards.length],
  );

  const toggleShuffle = () => {
    setShuffled((on) => {
      if (!on) setSeed(Math.floor(Math.random() * 1_000_000_000));
      return !on;
    });
    setIndex(0);
    setFlipped(false);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(1);
      else if (event.key === "ArrowLeft") go(-1);
      else if (event.key === " " || event.key === "Enter") {
        // Space and Enter belong to whatever is focused if it is a control.
        if (document.activeElement?.tagName !== "BUTTON") {
          event.preventDefault();
          setFlipped((f) => !f);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const shuffleClasses = shuffled ? "bg-ink text-on-ink" : "bg-bone text-slate";

  return (
    <Screen>
      <DesktopHeader tone="light" active="/study" eyebrow="STUDY · NOT SCORED" right={counter}>
        <span className="flex-1" />
        <button
          type="button"
          onClick={toggleShuffle}
          aria-pressed={shuffled}
          className={`flex min-h-10 items-center gap-2 rounded-full px-4 font-mono text-[12px] font-medium tracking-[.09em] uppercase ${shuffleClasses}`}
        >
          Shuffle
          <span
            className={`size-[9px] rounded-full ${shuffled ? "bg-gold" : "bg-track"}`}
            aria-hidden
          />
        </button>
      </DesktopHeader>

      <StudyBar label={deck.title.toUpperCase()} right={counter} />
      <div className="flex items-center justify-between px-[18px] pb-2 lg:hidden">
        <Link
          href="/study"
          className="flex min-h-11 items-center font-mono text-[12px] font-medium tracking-[.09em] text-slate uppercase"
        >
          ‹ All decks
        </Link>
        <button
          type="button"
          onClick={toggleShuffle}
          aria-pressed={shuffled}
          className={`flex min-h-11 items-center gap-2 rounded-full px-4 font-mono text-[12px] font-medium tracking-[.09em] uppercase ${
            shuffled ? "bg-ink text-on-ink" : "bg-surface text-slate"
          }`}
        >
          Shuffle
          <span
            className={`size-[9px] rounded-full ${shuffled ? "bg-gold" : "bg-track"}`}
            aria-hidden
          />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <DeckRail decks={rail} activeId={deck.id} open={railOpen} onToggle={() => setRailOpen((o) => !o)} />

        <main
          className="flex flex-1 flex-col overflow-hidden px-[18px] lg:px-10 lg:pt-8 lg:pb-6"
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            const start = touchX.current;
            touchX.current = null;
            if (start === null) return;
            const dx = e.changedTouches[0].clientX - start;
            if (dx <= -SWIPE) go(1);
            else if (dx >= SWIPE) go(-1);
          }}
        >
          <div className="flex-1 overflow-y-auto">
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              aria-label={flipped ? "Show the front of this card" : "Flip this card"}
              className="flex min-h-full w-full flex-col gap-6 rounded-[20px] border-b-[5px] bg-surface p-[22px] text-left lg:grid lg:grid-cols-2 lg:gap-10 lg:rounded-[22px] lg:border-b-[6px] lg:p-11"
              style={{ borderBottomColor: accent.fill }}
            >
              <CardIdentity card={card} hidden={flipped} />
              <CardAnswer card={card} flipped={flipped} />
            </button>
          </div>

          <div className="flex items-center gap-[10px] pt-[6px] lg:gap-4 lg:pt-5">
            <NavButton onClick={() => go(-1)} disabled={index === 0} label="Previous card">
              ←
            </NavButton>
            {/* A toggle, both ways. Moving on is the arrows, a swipe, or the card. */}
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="flex min-h-[60px] flex-1 items-center justify-center rounded-2xl bg-ink font-display text-[15px] font-bold tracking-[.06em] text-on-ink lg:min-h-14 lg:w-[220px] lg:flex-none"
            >
              {flipped ? "FLIP BACK" : "FLIP"}
            </button>
            <NavButton onClick={() => go(1)} disabled={index === cards.length - 1} label="Next card">
              →
            </NavButton>
            <div className="hidden h-1 flex-1 overflow-hidden rounded-full bg-track lg:block">
              <div
                className="h-full rounded-full bg-ink"
                style={{ width: `${((index + 1) / cards.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="h-1 overflow-hidden rounded-full bg-track my-[14px] lg:hidden">
            <div
              className="h-full rounded-full bg-ink"
              style={{ width: `${((index + 1) / cards.length) * 100}%` }}
            />
          </div>
        </main>

        <CardIndex
          cards={cards}
          activeIndex={index}
          open={indexOpen}
          onToggle={() => setIndexOpen((o) => !o)}
          onPick={(i) => {
            setIndex(i);
            setFlipped(false);
          }}
        />
      </div>
    </Screen>
  );
}

/** Every deck, grouped by section, with this one lit. Collapses to a spine. */
function DeckRail({
  decks,
  activeId,
  open,
  onToggle,
}: {
  decks: RailDeck[];
  activeId: string;
  open: boolean;
  onToggle: () => void;
}) {
  const sections: string[] = [];
  for (const deck of decks) if (sections.at(-1) !== deck.section) sections.push(deck.section);

  return (
    <aside
      className="hidden flex-none flex-col border-r-[1.5px] border-line-soft bg-surface lg:flex"
      style={{ width: open ? 288 : 56 }}
    >
      {open ? (
        <>
          <div className="flex items-center gap-2 py-3 pr-2 pl-3">
            <span className="flex-1 font-mono text-[11.5px] font-medium tracking-[.09em] text-mute uppercase">
              {decks.length} decks
            </span>
            <RailToggle onClick={onToggle} label="Collapse the deck list">
              ‹‹
            </RailToggle>
          </div>
          <div className="flex flex-1 flex-col gap-[2px] overflow-y-auto px-[14px] pb-5">
            {sections.map((section) => (
              <div key={section} className="flex flex-col gap-[2px]">
                <h2 className="px-3 pt-[18px] pb-[10px] font-mono text-[11.5px] font-medium tracking-[.09em] text-mute uppercase">
                  {section}
                </h2>
                {decks
                  .filter((deck) => deck.section === section)
                  .map((deck) => {
                    const on = deck.id === activeId;
                    return (
                      <Link
                        key={deck.id}
                        href={`/study/${deck.id}`}
                        aria-current={on ? "page" : undefined}
                        className={`flex min-h-11 items-center gap-[11px] rounded-[11px] px-3 ${
                          on ? "bg-ink text-on-ink" : ""
                        }`}
                      >
                        <span
                          className="hex h-[21px] w-[18px] flex-none"
                          style={{ background: deck.fill }}
                          aria-hidden
                        />
                        <span className="flex-1 truncate text-[15px] font-semibold">
                          {deck.title}
                        </span>
                        <span
                          className={`font-mono text-[12px] ${on ? "text-on-ink-mute" : "text-mute"}`}
                        >
                          {deck.count}
                        </span>
                      </Link>
                    );
                  })}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 py-5">
          <RailToggle onClick={onToggle} label="Show the deck list">
            ››
          </RailToggle>
          <span
            className="font-mono text-[11.5px] font-medium tracking-[.09em] text-mute uppercase"
            style={{ writingMode: "vertical-rl" }}
          >
            {decks.length} decks
          </span>
        </div>
      )}
    </aside>
  );
}

/** This deck's contents, numbered — jump straight to a card. */
function CardIndex({
  cards,
  activeIndex,
  open,
  onToggle,
  onPick,
}: {
  cards: Card[];
  activeIndex: number;
  open: boolean;
  onToggle: () => void;
  onPick: (index: number) => void;
}) {
  return (
    <aside
      className="hidden flex-none flex-col border-l-[1.5px] border-line-soft bg-surface xl:flex"
      style={{ width: open ? 320 : 56 }}
    >
      {open ? (
        <>
          <div className="flex items-center gap-2 py-3 pr-3 pl-2">
            <RailToggle onClick={onToggle} label="Collapse the card index">
              ››
            </RailToggle>
            <span className="flex-1 font-mono text-[11.5px] font-medium tracking-[.09em] text-mute uppercase">
              In this deck · {cards.length}
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-[2px] overflow-y-auto px-[14px] pb-5">
            {cards.map((card, i) => {
              const on = i === activeIndex;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => onPick(i)}
                  aria-current={on ? "true" : undefined}
                  className={`flex min-h-[38px] items-center gap-[10px] rounded-[9px] px-[10px] text-left ${
                    on ? "bg-bone" : ""
                  }`}
                >
                  <span className="w-[18px] flex-none font-mono text-[11px] text-mute">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`flex-1 truncate text-[15px] ${on ? "font-semibold" : "text-ink-soft"}`}
                  >
                    {subjectOf(card)?.text}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 py-5">
          <RailToggle onClick={onToggle} label="Show the card index">
            ‹‹
          </RailToggle>
          <span
            className="font-mono text-[11.5px] font-medium tracking-[.09em] text-mute uppercase"
            style={{ writingMode: "vertical-rl" }}
          >
            In this deck · {cards.length}
          </span>
        </div>
      )}
    </aside>
  );
}

function RailToggle({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-7 flex-none items-center justify-center rounded-lg bg-bone font-display text-[13px] font-bold text-trace"
    >
      {children}
    </button>
  );
}

function NavButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="min-h-[60px] w-16 flex-none rounded-2xl border-[1.5px] border-line bg-surface font-display text-[20px] font-bold text-slate disabled:opacity-30 lg:min-h-14"
    >
      {children}
    </button>
  );
}

function subjectOf(card: Card) {
  return card.front.blocks.find((b) => b.type === "subject") as
    | Extract<CardBlock, { type: "subject" }>
    | undefined;
}

/**
 * Who the card is about. On mobile this is the whole front; on desktop it stays
 * on the left while the answer arrives beside it.
 */
function CardIdentity({ card, hidden }: { card: Card; hidden: boolean }) {
  const subject = subjectOf(card);
  const hint = card.front.blocks.find((b) => b.type === "note");
  if (!subject) return null;

  return (
    <div
      className={`flex-col gap-6 lg:gap-7 ${hidden ? "hidden lg:flex" : "flex"}`}
    >
      {subject.cost ? (
        <div className="flex items-center justify-between lg:justify-start lg:gap-4">
          <Hex
            swatch={costSwatch(subject.cost)}
            className="h-[72px] w-16 text-[30px] lg:h-[86px] lg:w-[76px] lg:text-[36px]"
          >
            {subject.cost}
          </Hex>
          {/* Portrait slot: the source data ships no art and we ship no Riot assets. */}
          <span className="hex flex h-[72px] w-16 items-center justify-center bg-bone text-center font-mono text-[9.5px] leading-[1.3] text-track lg:h-[86px] lg:w-[76px] lg:text-[10px]">
            art
            <br />
            slot
          </span>
        </div>
      ) : (
        <div className="font-display text-[12px] font-semibold tracking-[.14em] text-trace">
          {subject.traitType?.toUpperCase()}
        </div>
      )}

      <h2
        className={`font-display font-bold tracking-[-0.04em] ${
          subject.cost
            ? "text-[52px] leading-none lg:text-[72px] lg:leading-[.95] lg:tracking-[-0.045em]"
            : "text-[42px] leading-[1.05] lg:text-[60px]"
        }`}
      >
        {subject.text}
      </h2>

      {hint?.type === "note" ? (
        <p className="text-[16px] text-slate lg:hidden">{hint.text}</p>
      ) : null}

      <span className="hidden flex-1 lg:block" />
      <p className="hidden font-mono text-[11.5px] tracking-[.09em] text-mute uppercase lg:block">
        Space flips · ← → moves
      </p>
    </div>
  );
}

/** The answer half: the card's back once flipped, the recall cue before that. */
function CardAnswer({ card, flipped }: { card: Card; flipped: boolean }) {
  const subject = subjectOf(card);
  const hint = card.front.blocks.find((b) => b.type === "note");

  return (
    <div
      className={`flex-col gap-4 lg:gap-5 lg:border-l lg:border-line-faint lg:pl-10 ${
        flipped ? "flex" : "hidden lg:flex"
      }`}
    >
      {flipped ? (
        <>
          {/* Mobile hides the identity when flipped, so the back repeats it. */}
          <div className="lg:hidden">
            {subject?.cost ? (
              <div className="flex items-center gap-3">
                <Hex swatch={costSwatch(subject.cost)} className="h-[43px] w-[38px] text-[18px]">
                  {subject.cost}
                </Hex>
                <h2 className="font-display text-[30px] font-bold tracking-[-0.03em]">
                  {subject.text}
                </h2>
              </div>
            ) : (
              <div>
                <div className="font-display text-[12px] font-semibold tracking-[.14em] text-trace">
                  {subject?.traitType?.toUpperCase()}
                </div>
                <h2 className="mt-[5px] font-display text-[38px] font-bold tracking-[-0.03em]">
                  {subject?.text}
                </h2>
              </div>
            )}
            <div className="mt-4 h-px bg-line-faint" />
          </div>
          <div className="flex flex-col gap-4 lg:gap-5">
            <Blocks blocks={card.back.blocks} />
          </div>
        </>
      ) : (
        <div className="hidden flex-1 flex-col justify-center gap-3 lg:flex">
          <p className="font-mono text-[11.5px] font-medium tracking-[.09em] text-mute uppercase">
            Before you flip
          </p>
          <p className="text-[20px] leading-[1.4] text-pretty text-slate">
            {hint?.type === "note" ? hint.text : null}
          </p>
        </div>
      )}
    </div>
  );
}
