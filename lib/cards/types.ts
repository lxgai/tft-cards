/**
 * The card engine. It knows nothing about champions or traits — a template is
 * a config object that turns some entity into two faces made of generic
 * blocks, and the renderer only ever sees blocks. Adding augments in phase 2
 * means writing templates and registering them; no engine or UI change.
 */
import type { Cost, Dataset, TierColor } from "@/lib/data/types";

/** What a card face is built out of. Every renderer handles exactly these. */
export type CardBlock =
  /** The card's subject — a champion or trait name. */
  | { type: "subject"; text: string; cost?: Cost; traitType?: string }
  | { type: "text"; text: string }
  /** A row of small labels: trait names, each with its breakpoint metals. */
  | { type: "chips"; items: { label: string; tiers?: TierColor[] }[] }
  /** A labelled list, e.g. one cost tier of a trait's roster. */
  | { type: "group"; label: string; cost?: Cost; items: string[] }
  | { type: "kv"; label: string; value: string }
  /** Trait breakpoints. `text: null` renders as "no distinct effect in data". */
  | { type: "tiers"; items: { breakpoint: number; color: TierColor; text: string | null }[] }
  /** Secondary text: keyword glossaries, trait flavour. */
  | { type: "note"; text: string }
  /** A remark about the data itself, not the game. Rendered smallest. */
  | { type: "caveat"; text: string };

export type CardFace = { blocks: CardBlock[] };

export type Card = {
  /** `{entityType}:{slug}#{templateId}` — stable, never positional. */
  id: string;
  templateId: string;
  entityType: string;
  entitySlug: string;
  front: CardFace;
  back: CardFace;
};

export type CardTemplate<E> = {
  id: string;
  entityType: string;
  slugOf(entity: E): string;
  front(entity: E, data: Dataset): CardFace;
  back(entity: E, data: Dataset): CardFace;
};

export function makeCard<E>(template: CardTemplate<E>, entity: E, data: Dataset): Card {
  const slug = template.slugOf(entity);
  return {
    id: `${template.entityType}:${slug}#${template.id}`,
    templateId: template.id,
    entityType: template.entityType,
    entitySlug: slug,
    front: template.front(entity, data),
    back: template.back(entity, data),
  };
}

export type Deck = {
  id: string;
  title: string;
  /** One line on what the deck drills. */
  blurb: string;
  section: "champions" | "traits";
  cards: Card[];
};
