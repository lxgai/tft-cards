/**
 * Question templates for Set 18.
 *
 * Two rules hold everywhere:
 *   - a prompt never shows the thing it is asking for, and never shows the
 *     champion's cost (that is L1's answer, and a hint everywhere else)
 *   - options are shuffled, so the correct one is never in a fixed position
 */
import type { CardBlock } from "@/lib/cards/types";
import { COSTS, type Champion, type Dataset, type Slug, type Trait } from "@/lib/data/types";
import { pick, sample, shuffle, type Rng } from "@/lib/rng";

import {
  confusableTraits,
  distinctManaValues,
  nonMembersOfSameCosts,
  realBreakpointArrays,
  sameCostAbilities,
  sameCostChampions,
  sameTypeTraits,
} from "./distractors";
import type { Option, Question, QuestionTemplate } from "./types";

/** Single-select questions offer four options unless the domain has fewer. */
const OPTIONS = 4;
/** A champion has 1–3 traits; six options keeps the guess-rate honest. */
const CHAMP_TRAITS_OPTIONS = 6;

/**
 * How many champions to show when asking for a whole roster. Scaled so the
 * ratio of right to wrong stays roughly constant — selecting 10 of 16 is the
 * same skill as selecting 2 of 8, and 65 tap targets is not a phone question.
 */
function rosterOptionCount(correct: number): number {
  if (correct <= 3) return 8;
  if (correct <= 7) return 12;
  return 16;
}

type Draft = Omit<Question, "unitId">;

function championOption(c: Champion): Option {
  return { id: c.slug, label: c.name, cost: c.cost };
}

function traitOption(t: Trait): Option {
  return { id: t.slug, label: t.name };
}

function draft(
  templateId: string,
  entityType: string,
  slug: string,
  mode: Question["mode"],
  lead: string,
  prompt: CardBlock[],
  options: Option[],
  correct: string[],
  rng: Rng,
  emphasis?: string,
): Draft {
  return {
    id: `${entityType}:${slug}#${templateId}`,
    templateId,
    mode,
    lead,
    emphasis,
    prompt,
    options: shuffle(options, rng),
    correct,
  };
}

const subject = (text: string): CardBlock[] => [{ type: "subject", text }];

/** A short handle for a paragraph-length option, for the results screen. */
function firstClause(text: string): string {
  const sentence = text.split(/(?<=[.!?])\s|\n/)[0].trim();
  return sentence.length > 64 ? `${sentence.slice(0, 61).trimEnd()}…` : sentence;
}

// ------------------------------------------------------------ L1 roster index

/** Champion -> cost. Options are always 1 through 5. */
export const championCostTemplate: QuestionTemplate<Champion> = {
  id: "champ-cost",
  mode: "single",
  entityType: "champion",
  candidates: (d) => d.champions,
  slugOf: (c) => c.slug,
  build: (c, _d, rng) =>
    draft(
      "champ-cost",
      "champion",
      c.slug,
      "single",
      "What does this champion cost?",
      subject(c.name),
      COSTS.map((cost) => ({ id: String(cost), label: `${cost}-cost` })),
      [String(c.cost)],
      rng,
    ),
};

// -------------------------------------------------------- L2 trait vocabulary

/** Trait -> Origin / Class / Unique. Three options, because there are three. */
export const traitTypeTemplate: QuestionTemplate<Trait> = {
  id: "trait-type",
  mode: "single",
  entityType: "trait",
  candidates: (d) => d.traits.filter((t) => t.quizzable),
  slugOf: (t) => t.slug,
  build: (t, _d, rng) =>
    draft(
      "trait-type",
      "trait",
      t.slug,
      "single",
      "Origin, Class, or Unique?",
      subject(t.name),
      ["Origin", "Class", "Unique"].map((v) => ({ id: v, label: v })),
      [t.type],
      rng,
    ),
};

/** Trait -> its breakpoints. Distractors are real arrays from other traits. */
export const traitBreakpointsTemplate: QuestionTemplate<Trait> = {
  id: "trait-breakpoints",
  mode: "single",
  entityType: "trait",
  // Uniques all activate at 1, which makes them a free point rather than a question.
  candidates: (d) => d.traits.filter((t) => t.quizzable && t.type !== "Unique"),
  slugOf: (t) => t.slug,
  build: (t, d, rng) => {
    const label = (bps: number[]) => bps.join(" / ");
    const wrong = realBreakpointArrays(t, d, OPTIONS - 1, rng);
    if (wrong.length < OPTIONS - 1) return null;
    return draft(
      "trait-breakpoints",
      "trait",
      t.slug,
      "single",
      "Which breakpoints does this trait have?",
      subject(t.name),
      [t.breakpoints, ...wrong].map((bps) => ({ id: bps.join("-"), label: label(bps) })),
      [t.breakpoints.join("-")],
      rng,
    );
  },
};

/** Description -> which trait. The trait's own name is masked out first. */
export const descriptionTraitTemplate: QuestionTemplate<Trait> = {
  id: "description-trait",
  mode: "single",
  entityType: "trait",
  candidates: (d) => d.traits.filter((t) => t.quizzable),
  slugOf: (t) => t.slug,
  build: (t, d, rng) => {
    const wrong = sameTypeTraits(t, d, OPTIONS - 1, rng);
    if (wrong.length < OPTIONS - 1) return null;
    return draft(
      "description-trait",
      "trait",
      t.slug,
      "single",
      "Which trait is this?",
      [{ type: "text", text: t.redactedDescription }],
      [t, ...wrong].map(traitOption),
      [t.slug],
      rng,
    );
  },
};

// ------------------------------------------------------ L3 champion -> traits

export const championTraitsTemplate: QuestionTemplate<Champion> = {
  id: "champ-traits",
  mode: "multi",
  entityType: "champion",
  candidates: (d) => d.champions,
  slugOf: (c) => c.slug,
  build: (c, d, rng) => {
    const wrong = confusableTraits(c, d, CHAMP_TRAITS_OPTIONS - c.traitSlugs.length, rng);
    const own = c.traitSlugs.map((s) => d.traitBySlug.get(s)!);
    return draft(
      "champ-traits",
      "champion",
      c.slug,
      "multi",
      `Select all ${c.traitSlugs.length} of this champion's traits.`,
      subject(c.name),
      [...own, ...wrong].map(traitOption),
      c.traitSlugs,
      rng,
    );
  },
};

// --------------------------------------------------------- L4 trait -> roster

/** A Unique trait belongs to exactly one champion — the warm-up. */
export const uniqueTraitChampionTemplate: QuestionTemplate<Trait> = {
  id: "unique-champion",
  mode: "single",
  entityType: "trait",
  candidates: (d) => d.traits.filter((t) => t.quizzable && t.championSlugs.length === 1),
  slugOf: (t) => t.slug,
  build: (t, d, rng) => {
    const champion = d.championBySlug.get(t.championSlugs[0])!;
    const wrong = nonMembersOfSameCosts(t, d, OPTIONS - 1, rng);
    if (wrong.length < OPTIONS - 1) return null;
    return draft(
      "unique-champion",
      "trait",
      t.slug,
      "single",
      "Whose trait is this?",
      subject(t.name),
      [champion, ...wrong].map(championOption),
      [champion.slug],
      rng,
    );
  },
};

/** Trait -> every champion in it. Wrong options are same-cost non-members. */
export const traitRosterTemplate: QuestionTemplate<Trait> = {
  id: "trait-roster",
  mode: "multi",
  entityType: "trait",
  candidates: (d) => d.traits.filter((t) => t.quizzable && t.championSlugs.length >= 2),
  slugOf: (t) => t.slug,
  build: (t, d, rng) => {
    const members = t.championSlugs.map((s) => d.championBySlug.get(s)!);
    const wrong = nonMembersOfSameCosts(t, d, rosterOptionCount(members.length) - members.length, rng);
    return draft(
      "trait-roster",
      "trait",
      t.slug,
      "multi",
      `Select all ${members.length} ${t.name} champions.`,
      [],
      [...members, ...wrong].map(championOption),
      t.championSlugs,
      rng,
      t.name,
    );
  },
};

// ------------------------------------------------------------- L5 abilities

export const abilityNameTemplate: QuestionTemplate<Champion> = {
  id: "champ-ability-name",
  mode: "single",
  entityType: "champion",
  candidates: (d) => d.champions,
  slugOf: (c) => c.slug,
  build: (c, d, rng) => {
    const wrong = sameCostAbilities(c, d, OPTIONS - 1, rng);
    if (wrong.length < OPTIONS - 1) return null;
    return draft(
      "champ-ability-name",
      "champion",
      c.slug,
      "single",
      "What is this champion's ability called?",
      subject(c.name),
      [c, ...wrong].map((x) => ({ id: x.slug, label: x.abilityName })),
      [c.slug],
      rng,
    );
  },
};

/**
 * Champion -> what the ability does. Every option is redacted, not just the
 * right one: an unmasked distractor naming its own champion would rule itself
 * out for free.
 */
export const abilityEffectTemplate: QuestionTemplate<Champion> = {
  id: "champ-ability-effect",
  mode: "single",
  entityType: "champion",
  candidates: (d) => d.champions,
  slugOf: (c) => c.slug,
  build: (c, d, rng) => {
    const wrong = sameCostAbilities(c, d, OPTIONS - 1, rng);
    if (wrong.length < OPTIONS - 1) return null;
    return draft(
      "champ-ability-effect",
      "champion",
      c.slug,
      "single",
      "What does this champion's ability do?",
      subject(c.name),
      [c, ...wrong].map((x) => ({ id: x.slug, label: firstClause(x.redactedAbility), body: x.redactedAbility })),
      [c.slug],
      rng,
    );
  },
};

/** Ability text -> which champion. */
export const abilityChampionTemplate: QuestionTemplate<Champion> = {
  id: "ability-champ",
  mode: "single",
  entityType: "champion",
  candidates: (d) => d.champions,
  slugOf: (c) => c.slug,
  build: (c, d, rng) => {
    const wrong = sameCostAbilities(c, d, OPTIONS - 1, rng);
    if (wrong.length < OPTIONS - 1) return null;
    return draft(
      "ability-champ",
      "champion",
      c.slug,
      "single",
      "Whose ability is this?",
      [{ type: "text", text: c.redactedAbility }],
      [c, ...wrong].map(championOption),
      [c.slug],
      rng,
    );
  },
};

/** Champion -> mana. Kayle's "0 / 0" is a fact worth knowing, so she is in. */
export const manaTemplate: QuestionTemplate<Champion> = {
  id: "champ-mana",
  mode: "single",
  entityType: "champion",
  candidates: (d) => d.champions,
  slugOf: (c) => c.slug,
  build: (c, d, rng) => {
    const wrong = distinctManaValues(c, d, OPTIONS - 1, rng);
    if (wrong.length < OPTIONS - 1) return null;
    const label = (raw: string) => (raw === "0 / 0" ? "0 / 0 — no mana bar" : raw);
    return draft(
      "champ-mana",
      "champion",
      c.slug,
      "single",
      "What is this champion's mana?",
      subject(c.name),
      [c.mana.raw, ...wrong].map((raw) => ({ id: raw, label: label(raw) })),
      [c.mana.raw],
      rng,
    );
  },
};

// ------------------------------------------------------------ L6 synthesis

/** Which champion has both of these traits? Distractors have exactly one. */
export const traitPairTemplate: QuestionTemplate<Champion> = {
  id: "trait-pair-champion",
  mode: "single",
  entityType: "champion",
  candidates: (d) =>
    d.champions.filter((c) => {
      if (c.traitSlugs.length < 2) return false;
      // Only champions a trait pair identifies uniquely — and only pairs where
      // neither trait does it alone, or "Caustic and Invoker" is just Caustic.
      return c.traitSlugs.some((a) =>
        c.traitSlugs.some((b) => a !== b && isSynthesisPair(d, a, b)),
      );
    }),
  slugOf: (c) => c.slug,
  build: (c, d, rng) => {
    const pairs = c.traitSlugs.flatMap((a) =>
      c.traitSlugs.filter((b) => b > a && isSynthesisPair(d, a, b)).map((b) => [a, b] as const),
    );
    if (!pairs.length) return null;
    const [a, b] = pick(pairs, rng);
    const traitA = d.traitBySlug.get(a)!;
    const traitB = d.traitBySlug.get(b)!;

    // A champion with one of the two traits is the mistake worth making.
    const halfRight = [...new Set([...traitA.championSlugs, ...traitB.championSlugs])]
      .filter((s) => s !== c.slug)
      .map((s) => d.championBySlug.get(s)!);
    const wrong = sample(halfRight, OPTIONS - 1, rng);
    if (wrong.length < OPTIONS - 1) return null;

    return draft(
      "trait-pair-champion",
      "champion",
      c.slug,
      "single",
      `Which champion is both ${traitA.name} and ${traitB.name}?`,
      [{ type: "chips", items: [{ label: traitA.name }, { label: traitB.name }] }],
      [c, ...wrong].map(championOption),
      [c.slug],
      rng,
    );
  },
};

function isSynthesisPair(d: Dataset, a: Slug, b: Slug): boolean {
  const first = d.traitBySlug.get(a)!;
  const second = d.traitBySlug.get(b)!;
  if (first.championSlugs.length < 2 || second.championSlugs.length < 2) return false;
  const members = new Set(second.championSlugs);
  return first.championSlugs.filter((s) => members.has(s)).length === 1;
}

/** Odd one out: three members and one impostor from the same cost tiers. */
export const oddOneOutTemplate: QuestionTemplate<Trait> = {
  id: "not-in-trait",
  mode: "single",
  entityType: "trait",
  candidates: (d) => d.traits.filter((t) => t.quizzable && t.championSlugs.length >= 3),
  slugOf: (t) => t.slug,
  build: (t, d, rng) => {
    const members = sample(
      t.championSlugs.map((s) => d.championBySlug.get(s)!),
      OPTIONS - 1,
      rng,
    );
    const [impostor] = nonMembersOfSameCosts(t, d, 1, rng);
    if (!impostor || members.length < OPTIONS - 1) return null;
    return draft(
      "not-in-trait",
      "trait",
      t.slug,
      "single",
      `Which of these is not ${t.name}?`,
      [],
      [impostor, ...members].map(championOption),
      [impostor.slug],
      rng,
      "not",
    );
  },
};

/** "You have 3 Infernos — which of these gets you to 5?" */
export const reachBreakpointTemplate: QuestionTemplate<Trait> = {
  id: "reach-breakpoint",
  mode: "single",
  entityType: "trait",
  candidates: (d) =>
    d.traits.filter((t) => t.quizzable && t.breakpoints.length >= 2 && t.championSlugs.length >= 2),
  slugOf: (t) => t.slug,
  build: (t, d, rng) => {
    const i = Math.floor(rng() * (t.breakpoints.length - 1));
    const [have, next] = [t.breakpoints[i], t.breakpoints[i + 1]];
    const member = pick(
      t.championSlugs.map((s) => d.championBySlug.get(s)!),
      rng,
    );
    const wrong = nonMembersOfSameCosts(t, d, OPTIONS - 1, rng);
    if (wrong.length < OPTIONS - 1) return null;
    return draft(
      "reach-breakpoint",
      "trait",
      t.slug,
      "single",
      `You have ${have} ${t.name}. Which of these gets you toward ${next}?`,
      [],
      [member, ...wrong].map(championOption),
      [member.slug],
      rng,
      t.name,
    );
  },
};

export const QUESTION_TEMPLATES = [
  championCostTemplate,
  traitTypeTemplate,
  traitBreakpointsTemplate,
  descriptionTraitTemplate,
  championTraitsTemplate,
  uniqueTraitChampionTemplate,
  traitRosterTemplate,
  abilityNameTemplate,
  abilityEffectTemplate,
  abilityChampionTemplate,
  manaTemplate,
  traitPairTemplate,
  oddOneOutTemplate,
  reachBreakpointTemplate,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
] as unknown as QuestionTemplate<any>[];

export const templateById = new Map(QUESTION_TEMPLATES.map((t) => [t.id, t]));

export { sameCostChampions };
