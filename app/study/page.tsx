import Link from "next/link";

import { DesktopHeader, Screen, TabBar } from "@/components/chrome";
import { HexDot } from "@/components/hex";
import { accentSwatch } from "@/components/tiers";
import { buildDecks } from "@/lib/cards/decks";
import { SECTION_LABELS, SECTION_ORDER, type Deck } from "@/lib/cards/types";
import { getDataset } from "@/lib/data/dataset";

export default function StudyIndex() {
  const decks = buildDecks(getDataset());
  const cards = decks.reduce((n, deck) => n + deck.cards.length, 0);

  return (
    <Screen>
      <DesktopHeader
        tone="light"
        active="/study"
        eyebrow="STUDY · NOT SCORED"
        right={`${decks.length} decks · ${cards} cards`}
      />
      <header className="px-[18px] pt-[18px] pb-3 lg:hidden">
        <div className="mb-2 flex items-center gap-2">
          <HexDot />
          <span className="font-display text-[12px] font-bold tracking-[.14em] text-slate">
            STUDY · NOT SCORED
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="font-display text-[32px] font-bold tracking-[-0.03em]">Decks</h1>
          <span className="font-mono text-[12px] font-medium text-mute">
            {decks.length} decks · {cards} cards
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-4 lg:columns-2 lg:gap-6 lg:px-8 lg:pt-4 xl:columns-3">
        {SECTION_ORDER.map((section) => {
          const inSection = decks.filter((deck) => deck.section === section);
          if (!inSection.length) return null;
          return (
            <section key={section} className="break-inside-avoid lg:mb-2">
              <h2 className="px-[13px] pt-4 pb-2 font-mono text-[11.5px] font-medium tracking-[.09em] text-mute uppercase">
                {SECTION_LABELS[section]}
              </h2>
              {inSection.map((deck) => (
                <DeckRow key={deck.id} deck={deck} />
              ))}
            </section>
          );
        })}
      </main>

      <TabBar active="/study" />
    </Screen>
  );
}

function DeckRow({ deck }: { deck: Deck }) {
  return (
    <Link
      href={`/study/${deck.id}`}
      className="mb-1 flex min-h-12 items-center gap-[11px] rounded-[13px] bg-surface px-[13px] py-2"
    >
      <span
        className="hex h-[23px] w-5 flex-none"
        style={{ background: accentSwatch(deck.accent).fill }}
        aria-hidden
      />
      <span className="flex-1 text-[16px] font-semibold">{deck.title}</span>
      <span className="font-mono text-[12px] font-medium text-mute">
        {deck.cards.length} {deck.cards.length === 1 ? "card" : "cards"}
      </span>
      <span className="font-display text-[15px] font-bold text-faint" aria-hidden>
        ›
      </span>
    </Link>
  );
}
