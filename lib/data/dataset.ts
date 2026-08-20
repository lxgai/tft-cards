/**
 * Builds the normalized dataset from data/*.json. Pure and synchronous: the
 * whole set is ~46 KB and gets baked into the static export at build time.
 */
import championsRaw from "@/data/champions.json";
import traitsRaw from "@/data/traits.json";

import { slugify, assertUniqueSlugs } from "./slug";
import { normalizeAbility, normalizeTraitDescription, parseMana, isMeaningful } from "./text";
import { compareKey, parseDescription } from "./traitParser";
import { maskTerms, stillLeaks } from "./redact";
import { ABILITY_SUMMARIES } from "./ability-summaries";
import { NON_QUIZZABLE_TRAITS, TRAIT_DESCRIPTION_OVERRIDES } from "./overrides";
import {
  COSTS,
  TRAIT_TYPES,
  type Champion,
  type Cost,
  type DataWarning,
  type Dataset,
  type RawChampion,
  type RawTrait,
  type Slug,
  type TierColor,
  type Trait,
  type TraitTier,
  type TraitType,
} from "./types";

function asCost(n: number, who: string): Cost {
  if (!COSTS.includes(n as Cost)) throw new Error(`${who}: unexpected cost ${n}`);
  return n as Cost;
}

function asTraitType(s: string, who: string): TraitType {
  if (!TRAIT_TYPES.includes(s as TraitType)) throw new Error(`${who}: unexpected type ${s}`);
  return s as TraitType;
}

function buildTrait(raw: RawTrait, warn: (w: DataWarning) => void): Trait {
  const name = raw.name;
  const type = asTraitType(raw.type, name);

  if (raw.breakpoints.length !== raw.colors.length) {
    warn({
      kind: "shape-mismatch",
      entity: name,
      detail: `${raw.breakpoints.length} breakpoints vs ${raw.colors.length} colors`,
    });
  }

  const override = TRAIT_DESCRIPTION_OVERRIDES[name];
  if (override) {
    warn({ kind: "override", entity: name, detail: "description replaced by an authored one" });
  }
  const normalized = override ?? normalizeTraitDescription(raw.description);
  const parsed = parseDescription(normalized);

  // Solar is the one trait whose single breakpoint is written as a leading
  // "(3)" marker. The tier badge already carries the number; in the body it
  // just reads as debris.
  const description =
    parsed.shape === "single" && parsed.segments.length === 1 && !parsed.preamble
      ? normalized.replace(/^\(\d+\)\s*/, "")
      : normalized;
  const marked = new Set(parsed.segments.map((s) => s.breakpoint));
  const unmarked = raw.breakpoints.filter((b) => !marked.has(b));
  const spurious = [...marked].filter((b) => !raw.breakpoints.includes(b));
  if (parsed.segments.length > 0 && (unmarked.length || spurious.length)) {
    warn({
      kind: "trait-parse",
      entity: name,
      detail: `markers do not line up with breakpoints${
        unmarked.length ? ` — no marker for ${unmarked.join(", ")}` : ""
      }${spurious.length ? ` — marker for unlisted ${spurious.join(", ")}` : ""}`,
    });
  }

  const byBreakpoint = new Map(parsed.segments.map((s) => [s.breakpoint, s.text]));
  const tiers: TraitTier[] = raw.breakpoints.map((breakpoint, i) => {
    const text = byBreakpoint.get(breakpoint);
    return {
      breakpoint,
      color: (raw.colors[i] ?? 1) as TierColor,
      text: parsed.shape === "per-tier" && text && isMeaningful(text) ? text : null,
      quizzable: false,
    };
  });

  // A tier is only askable if no sibling tier reads the same after stripping.
  const tierKeyCounts = new Map<string, number>();
  for (const tier of tiers) {
    if (tier.text) tierKeyCounts.set(compareKey(tier.text), (tierKeyCounts.get(compareKey(tier.text)) ?? 0) + 1);
  }
  for (const tier of tiers) {
    tier.quizzable = tier.text !== null && tierKeyCounts.get(compareKey(tier.text)) === 1;
  }

  if (parsed.shape === "per-tier") {
    const blank = tiers.filter((t) => t.text === null).map((t) => t.breakpoint);
    if (blank.length) {
      warn({
        kind: "tier-text-missing",
        entity: name,
        detail: `no usable text for breakpoint ${blank.join(", ")}`,
      });
    }
    const shared = tiers.filter((t) => t.text !== null && !t.quizzable).map((t) => t.breakpoint);
    if (shared.length) {
      warn({
        kind: "tier-text-duplicate",
        entity: name,
        detail: `breakpoint ${shared.join(", ")} read identically once numbers are stripped`,
      });
    }
  }

  const masked = maskTerms(description, [name]);
  if (stillLeaks(masked.text, [name])) {
    warn({ kind: "redaction-miss", entity: name, detail: "own name survives redaction" });
  }

  return {
    slug: slugify(name),
    name,
    type,
    breakpoints: raw.breakpoints,
    tiers,
    shape: parsed.shape,
    description,
    redactedDescription: masked.text,
    preamble: parsed.preamble,
    sharedEffect: parsed.shape === "scaling" && isMeaningful(parsed.preamble) ? parsed.preamble : null,
    footnote: parsed.footnote,
    championSlugs: [],
    quizzable: !NON_QUIZZABLE_TRAITS.includes(name),
    quizzableTiers: false,
  };
}

function buildChampion(raw: RawChampion, warn: (w: DataWarning) => void): Champion {
  const name = raw.name;
  const ability = normalizeAbility(raw.ability);
  const terms = [name, ...raw.traits];
  const masked = maskTerms(ability, terms);
  if (stillLeaks(masked.text, terms)) {
    warn({ kind: "redaction-miss", entity: name, detail: "own name or trait survives redaction" });
  }

  const slug = slugify(name);
  const summary = ABILITY_SUMMARIES[slug] ?? [];
  if (summary.length === 0) {
    warn({ kind: "summary-missing", entity: name, detail: "no authored bullet summary" });
  }

  return {
    slug,
    name,
    cost: asCost(raw.cost, name),
    traitSlugs: raw.traits.map(slugify),
    traitNames: raw.traits,
    abilityName: raw.abilityName,
    mana: parseMana(raw.abilityMana),
    ability,
    summary,
    redactedSummary: summary.map((line) => maskTerms(line, terms).text),
    redactedAbility: masked.text,
    portrait: null,
  };
}

export function buildDataset(
  rawChampions: RawChampion[] = championsRaw as RawChampion[],
  rawTraits: RawTrait[] = traitsRaw as RawTrait[],
): Dataset {
  const warnings: DataWarning[] = [];
  const warn = (w: DataWarning) => warnings.push(w);

  const traits = rawTraits.map((t) => buildTrait(t, warn));
  const champions = rawChampions.map((c) => buildChampion(c, warn));

  assertUniqueSlugs(traits.map((t) => t.slug), "trait");
  assertUniqueSlugs(champions.map((c) => c.slug), "champion");

  const traitBySlug = new Map(traits.map((t) => [t.slug, t]));
  const championBySlug = new Map(champions.map((c) => [c.slug, c]));

  // Invert champions.json — traits.json carries no roster of its own.
  const roster = new Map<Slug, Champion[]>(traits.map((t) => [t.slug, []]));
  for (const champion of champions) {
    for (const traitSlug of champion.traitSlugs) {
      const bucket = roster.get(traitSlug);
      if (!bucket) throw new Error(`${champion.name} has unknown trait ${traitSlug}`);
      bucket.push(champion);
    }
  }

  for (const trait of traits) {
    const members = roster.get(trait.slug) ?? [];
    trait.championSlugs = members.map((c) => c.slug);
    if (members.length === 0) {
      trait.quizzable = false;
      warn({ kind: "empty-roster", entity: trait.name, detail: "no champions; excluded from questions" });
    }
    trait.quizzableTiers =
      trait.quizzable && trait.shape === "per-tier" && trait.tiers.some((t) => t.quizzable);
  }

  const byCost = Object.fromEntries(
    COSTS.map((cost) => [cost, champions.filter((c) => c.cost === cost)]),
  ) as Record<Cost, Champion[]>;

  return { champions, traits, championBySlug, traitBySlug, byCost, roster, warnings };
}

let cached: Dataset | null = null;

/** Memoized dataset. Build-time in RSC, first-call in the browser. */
export function getDataset(): Dataset {
  if (!cached) cached = buildDataset();
  return cached;
}
