/**
 * Splits a normalized trait description into a preamble, per-breakpoint
 * segments keyed by their `(n)` marker, and a trailing footnote.
 *
 * The parse is imperfect by necessity: `effects` is empty on all 36 traits,
 * so the breakpoint structure only exists as `(2)` / `(3)` markers inside
 * prose that has had every number stripped out of it. What comes back is
 * classified rather than trusted — see `classify`.
 */
import { isMeaningful } from "./text";
import type { TierShape } from "./types";

const MARKER = /\((\d+)\)/g;

export type ParsedDescription = {
  preamble: string;
  segments: { breakpoint: number; text: string }[];
  footnote: string | null;
  shape: TierShape;
};

/**
 * Identity of a fragment for "do these two tiers say the same thing?".
 * Digits are kept: Elderwood's "Plants star up to 2-star" and "...3-star"
 * are two different effects, and those particular numbers survived stripping.
 */
export function compareKey(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Number-stripping leaves lines that are pure punctuation: Riftbeast's
 * "+ + + +", Eldritch's ",,,". They carried values that no longer exist.
 */
function dropDebrisLines(text: string): string {
  return text
    .split("\n")
    .filter((line) => /[A-Za-z]/.test(line) || line.trim() === "")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * A trailing blank-line block after the last breakpoint is a glossary or a
 * flavour line ("Burn: Deals a percent of...", "...the moon brings death"),
 * not part of that breakpoint's effect.
 */
function splitFootnote(text: string): { text: string; footnote: string | null } {
  const idx = text.indexOf("\n\n");
  if (idx === -1) return { text, footnote: null };
  const head = text.slice(0, idx).trim();
  const tail = text.slice(idx + 2).trim();
  if (!isMeaningful(tail)) return { text, footnote: null };
  return { text: head, footnote: tail };
}

/**
 * `per-tier` when at least three quarters of the breakpoints carry text that
 * is both meaningful and distinct. Anything less is a trait whose breakpoints
 * all do the same thing, only more so (Brawler, Adaptor, Hunter, ...) — real
 * information, but it belongs to the trait, not to any one breakpoint.
 */
function classify(segments: { text: string }[]): TierShape {
  if (segments.length <= 1) return "single";
  const distinct = new Set(
    segments.map((s) => s.text).filter(isMeaningful).map(compareKey),
  );
  const needed = Math.max(2, Math.ceil(segments.length * 0.75));
  return distinct.size >= needed ? "per-tier" : "scaling";
}

export function parseDescription(description: string): ParsedDescription {
  const matches = [...description.matchAll(MARKER)];
  if (matches.length === 0) {
    return { preamble: description, segments: [], footnote: null, shape: "single" };
  }

  const preamble = description.slice(0, matches[0].index).trim();
  const segments = matches.map((m, i) => {
    const start = (m.index ?? 0) + m[0].length;
    const end =
      i + 1 < matches.length ? (matches[i + 1].index ?? description.length) : description.length;
    return { breakpoint: Number(m[1]), text: description.slice(start, end).trim() };
  });

  const last = segments[segments.length - 1];
  const { text, footnote } = splitFootnote(last.text);
  last.text = text;
  for (const segment of segments) segment.text = dropDebrisLines(segment.text);

  return { preamble, segments, footnote, shape: classify(segments) };
}
