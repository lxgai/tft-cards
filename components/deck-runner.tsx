"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { orderCards } from "@/lib/cards/decks";
import type { Card, CardBlock, Deck } from "@/lib/cards/types";

import { Blocks } from "./blocks";
import { Screen, StudyBar } from "./chrome";
import { Hex } from "./hex";
import { accentSwatch, costSwatch } from "./tiers";

const SWIPE = 48;

/**
 * A deck is a list of cards and a direction to move through it. There is no
 * right answer here, nothing is counted, and nothing survives leaving the page.
 */
export function DeckRunner({ deck }: { deck: Deck }) {
  const [shuffled, setShuffled] = useState(false);
  const [seed, setSeed] = useState(0);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const touchX = useRef<number | null>(null);

  const cards = orderCards(deck, shuffled, seed);
  const card = cards[index];
  const accent = accentSwatch(deck.accent);

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

  return (
    <Screen>
      <StudyBar
        label={deck.title.toUpperCase()}
        right={`card ${index + 1} of ${cards.length}`}
      />

      <div className="flex items-center justify-between px-[18px] pb-2">
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

      <main
        className="flex flex-1 flex-col overflow-hidden px-[18px]"
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
            className="flex min-h-full w-full flex-col gap-6 rounded-[20px] border-b-[5px] bg-surface p-[22px] text-left"
            style={{ borderBottomColor: accent.fill }}
          >
            {flipped ? <CardBack card={card} /> : <CardFront card={card} />}
          </button>
        </div>

        <div className="flex items-center gap-3 py-[14px]">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-track">
            <div
              className="h-full rounded-full bg-ink"
              style={{ width: `${((index + 1) / cards.length) * 100}%` }}
            />
          </div>
        </div>
      </main>

      <div
        className="flex gap-[10px] px-[18px] pt-[6px]"
        style={{ paddingBottom: "calc(22px + env(safe-area-inset-bottom))" }}
      >
        <NavButton onClick={() => go(-1)} disabled={index === 0} label="Previous card">
          ←
        </NavButton>
        {/* A toggle, both ways. Moving on is the arrows, a swipe, or the card. */}
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="flex min-h-[60px] flex-1 items-center justify-center rounded-2xl bg-ink font-display text-[15px] font-bold tracking-[.06em] text-on-ink"
        >
          {flipped ? "FLIP BACK" : "FLIP"}
        </button>
        <NavButton onClick={() => go(1)} disabled={index === cards.length - 1} label="Next card">
          →
        </NavButton>
      </div>
    </Screen>
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
      className="min-h-[60px] w-16 rounded-2xl border-[1.5px] border-line bg-surface font-display text-[20px] font-bold text-slate disabled:opacity-30"
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

function CardFront({ card }: { card: Card }) {
  const subject = subjectOf(card);
  const hint = card.front.blocks.find((b) => b.type === "note");
  if (!subject) return null;

  return (
    <>
      {subject.cost ? (
        <div className="flex items-center justify-between">
          <Hex swatch={costSwatch(subject.cost)} width={64} height={72} fontSize={30}>
            {subject.cost}
          </Hex>
          {/* Portrait slot: the source data ships no art and we ship no Riot assets. */}
          <span className="hex flex h-[72px] w-16 items-center justify-center bg-bone text-center font-mono text-[9.5px] leading-[1.3] text-track">
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
          subject.cost ? "text-[52px] leading-none" : "text-[42px] leading-[1.05]"
        }`}
      >
        {subject.text}
      </h2>

      {hint?.type === "note" ? <p className="text-[16px] text-slate">{hint.text}</p> : null}
    </>
  );
}

function CardBack({ card }: { card: Card }) {
  const subject = subjectOf(card);

  return (
    <>
      {subject?.cost ? (
        <div className="flex items-center gap-3">
          <Hex swatch={costSwatch(subject.cost)} width={38} height={43} fontSize={18}>
            {subject.cost}
          </Hex>
          <h2 className="font-display text-[30px] font-bold tracking-[-0.03em]">{subject.text}</h2>
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

      <div className="h-px bg-line-faint" />
      <div className="flex flex-col gap-4">
        <Blocks blocks={card.back.blocks} />
      </div>
    </>
  );
}
