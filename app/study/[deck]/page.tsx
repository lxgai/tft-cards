import { notFound } from "next/navigation";

import { DeckRunner, type RailDeck } from "@/components/deck-runner";
import { accentSwatch } from "@/components/tiers";
import { buildDecks } from "@/lib/cards/decks";
import { SECTION_LABELS } from "@/lib/cards/types";
import { getDataset } from "@/lib/data/dataset";

export const dynamicParams = false;

export function generateStaticParams() {
  return buildDecks(getDataset()).map((deck) => ({ deck: deck.id }));
}

export default async function DeckPage({ params }: { params: Promise<{ deck: string }> }) {
  const { deck: id } = await params;
  const decks = buildDecks(getDataset());
  const deck = decks.find((d) => d.id === id);
  if (!deck) notFound();

  // The desktop rail lists every deck, but it only needs each one's name, size
  // and colour — not 341 cards serialized into the page.
  const rail: RailDeck[] = decks.map((d) => ({
    id: d.id,
    title: d.title,
    count: d.cards.length,
    section: SECTION_LABELS[d.section],
    fill: accentSwatch(d.accent).fill,
  }));

  return <DeckRunner deck={deck} rail={rail} />;
}
