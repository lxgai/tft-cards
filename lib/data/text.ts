/**
 * Text normalization for the Set 18 export.
 *
 * The two source files are broken in different ways:
 *   traits.json    paragraph breaks are the literal two characters \ and n
 *   champions.json no newlines at all; paragraph breaks are runs of 4 spaces
 *
 * Numeric values have been stripped throughout ("gain a Shield for seconds").
 * We never restore them and never guess. We only remove artifacts left behind
 * by that stripping — empty parentheticals and live-UI readout tails.
 */

/** The literal two-character sequence backslash-n, as it sits in traits.json. */
const LITERAL_NEWLINE = /\\n/g;
/** "(Forge Power:  /  )", "(Reds Foraged: )" — labelled but valueless. */
const HOLLOW_PAREN = /\((?:[A-Za-z][\w' ]*:)?[\s\d|/]*\)/g;
/** "(minimum )" — the floor value was stripped. */
const HOLLOW_MINIMUM = /\(\s*minimum\s*\)/gi;
/** "Current bonus:%" — a live stack counter with nothing to count. */
const HOLLOW_COUNTER = /\bCurrent bonus:\s*%?/gi;
/** Whole lines that are live-UI readouts: "Seeds: |", "Current Biome:". */
const UI_TAIL_LINE = /^[ \t]*(?:Current|Next|Seeds)\b[^:\n]*:[ \t]*[\d\s|/%]*$/gim;

function tidy(s: string): string {
  return s
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/[ \t]+([.,;:])/g, "$1")
    .replace(/\(\s*\)/g, "")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** traits.json: literal `\n` -> real newline, then strip UI readout lines. */
export function normalizeTraitDescription(raw: string): string {
  return tidy(raw.replace(LITERAL_NEWLINE, "\n").replace(UI_TAIL_LINE, ""));
}

/** champions.json: runs of 3+ spaces -> paragraph break, then strip artifacts. */
export function normalizeAbility(raw: string): string {
  return tidy(
    raw
      .replace(HOLLOW_PAREN, "")
      .replace(HOLLOW_MINIMUM, "")
      .replace(HOLLOW_COUNTER, "")
      .replace(/[ \t]{3,}/g, "\n\n"),
  );
}

/** "0 / 30" -> { start: 0, max: 30 }. Kayle is "0 / 0"; that is real data. */
export function parseMana(raw: string): { raw: string; start: number; max: number } {
  const m = raw.match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);
  if (!m) throw new Error(`Unparseable abilityMana: ${JSON.stringify(raw)}`);
  return { raw: raw.trim(), start: Number(m[1]), max: Number(m[2]) };
}

/**
 * Is this fragment worth showing or quizzing? After number-stripping many
 * per-breakpoint segments are punctuation debris: ",", "|", "OR", "+ per cast".
 */
export function isMeaningful(text: string): boolean {
  const bare = text
    .replace(/\b(?:or|and)\b/gi, "")
    .replace(/[^A-Za-z]/g, "")
    .trim();
  return bare.length >= 3;
}
