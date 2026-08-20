import Link from "next/link";

import { Screen, TabBar } from "@/components/chrome";
import { HexDot } from "@/components/hex";
import { deckSwatch } from "@/components/tiers";
import { buildDecks } from "@/lib/cards/decks";
import { getDataset } from "@/lib/data/dataset";

export default function StudyIndex() {
  const decks = buildDecks(getDataset());

  return (
    <Screen>
      <header className="px-[18px] pt-[18px] pb-3">
        <div className="mb-2 flex items-center gap-2">
          <HexDot />
          <span className="font-display text-[12px] font-bold tracking-[.14em] text-slate">
            STUDY · NOT SCORED
          </span>
        </div>
        <h1 className="font-display text-[32px] font-bold tracking-[-0.03em]">Decks</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4">
        {decks.map((deck) => (
          <Link
            key={deck.id}
            href={`/study/${deck.id}`}
            className="mb-1 flex min-h-12 items-center gap-[11px] rounded-[13px] bg-surface px-[13px] py-2"
          >
            <span
              className="hex h-[23px] w-5 flex-none"
              style={{ background: deckSwatch(deck.id).fill }}
              aria-hidden
            />
            <span className="flex-1 text-[16px] font-semibold">{deck.title}</span>
            <span className="font-mono text-[12px] font-medium text-mute">
              {deck.cards.length} cards
            </span>
            <span className="font-display text-[15px] font-bold text-faint" aria-hidden>
              ›
            </span>
          </Link>
        ))}
      </main>

      <TabBar active="/study" />
    </Screen>
  );
}
