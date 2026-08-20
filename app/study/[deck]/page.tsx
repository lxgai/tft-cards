import { notFound } from "next/navigation";

import { DeckRunner } from "@/components/deck-runner";
import { buildDecks } from "@/lib/cards/decks";
import { getDataset } from "@/lib/data/dataset";

export const dynamicParams = false;

export function generateStaticParams() {
  return buildDecks(getDataset()).map((deck) => ({ deck: deck.id }));
}

export default async function DeckPage({ params }: { params: Promise<{ deck: string }> }) {
  const { deck: id } = await params;
  const deck = buildDecks(getDataset()).find((d) => d.id === id);
  if (!deck) notFound();
  return <DeckRunner deck={deck} />;
}
