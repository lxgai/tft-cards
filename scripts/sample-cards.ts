/** Prints real cards from every deck. `npm run cards`. */
import { buildDecks } from "@/lib/cards/decks";
import type { CardFace, Card } from "@/lib/cards/types";
import { buildDataset } from "@/lib/data/dataset";

const data = buildDataset();
const decks = buildDecks(data);

function renderFace(face: CardFace, indent: string): string {
  const out: string[] = [];
  for (const b of face.blocks) {
    switch (b.type) {
      case "subject":
        out.push(
          `${indent}${b.text}${b.cost ? `   [${b.cost}-cost]` : ""}${b.traitType ? `   [${b.traitType}]` : ""}`,
        );
        break;
      case "text":
        out.push(...b.text.split("\n").map((l) => `${indent}${l}`));
        break;
      case "chips":
        out.push(`${indent}${b.items.map((i) => `‹${i.label}›`).join(" ")}`);
        break;
      case "group":
        out.push(`${indent}${b.label.padEnd(8)} ${b.items.join(", ")}`);
        break;
      case "kv":
        out.push(`${indent}${b.label}: ${b.value}`);
        break;
      case "tiers":
        for (const t of b.items) {
          out.push(`${indent}(${t.breakpoint}) c${t.color}  ${t.text ?? "— no distinct effect in the data"}`);
        }
        break;
      case "note":
        out.push(...b.text.split("\n").map((l) => `${indent}· ${l}`));
        break;
    }
  }
  return out.join("\n");
}

function show(card: Card) {
  console.log(`\n  ${card.id}`);
  console.log(`  ${"─".repeat(70)}`);
  console.log(renderFace(card.front, "  FRONT  "));
  console.log(renderFace(card.back, "  BACK   "));
}

console.log(`${decks.length} decks, ${decks.reduce((n, d) => n + d.cards.length, 0)} cards\n`);
for (const deck of decks) {
  console.log(`${deck.id.padEnd(20)} ${String(deck.cards.length).padStart(3)} cards   ${deck.title} — ${deck.blurb}`);
}

const wanted: Record<string, string[]> = {
  "traits-cost-1": ["Akali", "Kha'Zix"],
  "traits-cost-5": ["The Elder Dragon"],
  "abilities-cost-1": ["Cinderling"],
  "abilities-cost-2": ["Kayle"],
  "abilities-cost-5": ["Gnar"],
  "trait-descriptions": ["Inferno", "Brawler", "Eclipse", "Solar", "Elderwood", "Apex Predator"],
  "trait-rosters": ["Riftbeast", "Rival", "Summoner", "Caustic"],
};

for (const [deckId, names] of Object.entries(wanted)) {
  const deck = decks.find((d) => d.id === deckId)!;
  console.log(`\n\n══ ${deck.title} ${"═".repeat(60 - deck.title.length)}`);
  for (const name of names) {
    const card = deck.cards.find((c) => c.front.blocks[0].type === "subject" && c.front.blocks[0].text === name);
    if (card) show(card);
    else console.log(`  (no card for ${name})`);
  }
}
