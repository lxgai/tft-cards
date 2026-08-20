/**
 * Marks the phrases in a bullet that carry the mechanic, so a card can colour
 * them. Bullets stay in the ability's own order — the highlight is what makes
 * the important part findable, rather than a reordering that fights the
 * narrative of the ability.
 *
 * The tones are semantic. `components/blocks.tsx` decides what colour each is.
 */

export type HighlightTone = "physical" | "magic" | "control" | "utility";

export type Segment = { text: string; tone?: HighlightTone };

/**
 * Order matters only for reading; the matcher takes the earliest match in the
 * string and never overlaps two tones. Patterns are deliberately narrow —
 * they match the vocabulary the summaries are written in, so an unmatched
 * phrase means the bullet used a word the house style does not.
 */
const PATTERNS: { tone: HighlightTone; pattern: RegExp }[] = [
  { tone: "physical", pattern: /\bphysical damage\b/gi },
  { tone: "magic", pattern: /\bmagic damage\b/gi },
  {
    tone: "control",
    pattern: /\b(?:stuns?|taunts?|knocks up|knocked up|sleeps?|charms?|disarms?|crowd control)\b/gi,
  },
  {
    tone: "utility",
    pattern:
      /\b(?:slows?|shreds?|wounds?|burns?|burning|sunders?|ignites?|ignited|mana reaves?|poisons?|reduces (?:\w+ )?(?:magic resist|armor(?: and magic resist)?))\b/gi,
  },
];

/** Splits a bullet into plain and highlighted runs, left to right. */
export function highlight(text: string): Segment[] {
  const marks: { start: number; end: number; tone: HighlightTone }[] = [];

  for (const { tone, pattern } of PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      const start = match.index ?? 0;
      const end = start + match[0].length;
      // First tone to claim a span keeps it; "physical damage" beats "damage".
      if (marks.some((m) => start < m.end && end > m.start)) continue;
      marks.push({ start, end, tone });
    }
  }

  marks.sort((a, b) => a.start - b.start);

  const segments: Segment[] = [];
  let at = 0;
  for (const mark of marks) {
    if (mark.start > at) segments.push({ text: text.slice(at, mark.start) });
    segments.push({ text: text.slice(mark.start, mark.end), tone: mark.tone });
    at = mark.end;
  }
  if (at < text.length) segments.push({ text: text.slice(at) });

  return segments;
}
