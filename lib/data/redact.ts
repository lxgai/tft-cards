/**
 * Masking for reverse-direction questions ("which champion has this ability?",
 * "which trait is this?"). The source text routinely names its own subject:
 * 27 of 36 trait descriptions contain their trait name, and 14 champion
 * abilities contain the champion's name ("Scarlet Buff: Cinderling gains...").
 *
 * Study decks always show the raw text. Only quiz prompts use these.
 */

export const MASK = "———";

const STOPWORDS = new Set(["the", "of", "and"]);

/** Name plus the word-parts worth masking: "The Elder Dragon" -> also "Elder", "Dragon". */
function nameForms(name: string): string[] {
  const parts = name
    .split(/[\s'’]+/)
    .filter((p) => p.length >= 4 && !STOPWORDS.has(p.toLowerCase()));
  return [name, ...parts].sort((a, b) => b.length - a.length);
}

/** Escape for use in a RegExp, treating either apostrophe as either apostrophe. */
function escape(s: string): string {
  return s
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/['’]/g, "['’]");
}

/**
 * Forms of 4+ characters also match their derivations, so "Krug" catches
 * "Kruglettes" and "Sprykin" catches "Sprykins". Shorter names (Vi, Lux) match
 * exactly, plus plural and possessive, so masking never eats an unrelated word.
 */
function pattern(form: string): RegExp {
  const suffix = form.length >= 4 ? "[a-z]{0,8}" : "(?:['’]s|s)?";
  return new RegExp("\\b" + escape(form) + suffix + "\\b", "gi");
}

/**
 * Mask every occurrence of `terms`, including plural and possessive forms
 * ("Brawlers", "Ravagers gain", "Taric's paired ally").
 */
export function maskTerms(text: string, terms: string[]): { text: string; hits: string[] } {
  const hits: string[] = [];
  let out = text;
  for (const term of terms) {
    for (const form of nameForms(term)) {
      const re = pattern(form);
      if (re.test(out)) {
        hits.push(form);
        out = out.replace(pattern(form), MASK);
      }
    }
  }
  // Collapse "——— ———" runs left behind by masking a multi-word name twice.
  return { text: out.replace(new RegExp("(?:" + MASK + "[ \\t]*){2,}", "g"), MASK + " "), hits };
}

/** True if any masked term still leaks through — used to raise a data warning. */
export function stillLeaks(text: string, terms: string[]): boolean {
  return terms.some((t) =>
    nameForms(t).some((f) => new RegExp("\\b" + escape(f), "i").test(text)),
  );
}
