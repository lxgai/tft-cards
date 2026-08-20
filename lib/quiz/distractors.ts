/**
 * Distractor strategies. Random wrong answers make a quiz worthless: every
 * strategy here picks wrong answers that are plausible for the *reason* the
 * question is hard, and none of them can return something that is also correct.
 */
import type { Champion, Dataset, Trait } from "@/lib/data/types";
import { sample, shuffle, type Rng } from "@/lib/rng";

/** Drops anything in `correct`, then takes up to `n` in preference order. */
function take<T>(pools: T[][], correct: Set<T>, n: number, rng: Rng): T[] {
  const out: T[] = [];
  const seen = new Set<T>(correct);
  for (const pool of pools) {
    for (const item of shuffle(pool, rng)) {
      if (out.length >= n) return out;
      if (seen.has(item)) continue;
      seen.add(item);
      out.push(item);
    }
  }
  return out;
}

/** Champions of the same cost tier — the pool that makes a cost question honest. */
export function sameCostChampions(champion: Champion, data: Dataset): Champion[] {
  return data.byCost[champion.cost].filter((c) => c !== champion);
}

/**
 * Wrong champions for "who is in this trait?": same cost tier as one of the
 * real members, and not in the trait. Confusing a Riftbeast with another
 * 2-cost is the mistake worth training against.
 */
export function nonMembersOfSameCosts(trait: Trait, data: Dataset, n: number, rng: Rng): Champion[] {
  const members = new Set(trait.championSlugs);
  const costs = new Set(trait.championSlugs.map((s) => data.championBySlug.get(s)!.cost));
  const sameCost = data.champions.filter((c) => costs.has(c.cost) && !members.has(c.slug));
  const anyCost = data.champions.filter((c) => !members.has(c.slug));
  return take([sameCost, anyCost], new Set(), n, rng);
}

/**
 * Wrong traits for "what does this champion bring?": first traits that share a
 * champion with one of the right answers (the near-miss you actually make),
 * then traits of the same type.
 */
export function confusableTraits(champion: Champion, data: Dataset, n: number, rng: Rng): Trait[] {
  const own = new Set(champion.traitSlugs);
  const ownTraits = champion.traitSlugs.map((s) => data.traitBySlug.get(s)!);

  const neighbours = new Set<Trait>();
  for (const trait of ownTraits) {
    for (const slug of trait.championSlugs) {
      for (const other of data.championBySlug.get(slug)!.traitSlugs) {
        if (!own.has(other)) neighbours.add(data.traitBySlug.get(other)!);
      }
    }
  }

  // `quizzable` keeps Eclipse out: it has no champions, so offering it as a
  // trait a champion might have is offering an impossible answer.
  const ownTypes = new Set(ownTraits.map((t) => t.type));
  const askable = data.traits.filter((t) => t.quizzable && !own.has(t.slug));
  const sameType = askable.filter((t) => ownTypes.has(t.type));

  return take([[...neighbours].filter((t) => t.quizzable), sameType, askable], new Set(), n, rng);
}

/** Traits of the same type — for "which trait is this description?". */
export function sameTypeTraits(trait: Trait, data: Dataset, n: number, rng: Rng): Trait[] {
  const sameType = data.traits.filter((t) => t !== trait && t.type === trait.type && t.quizzable);
  const rest = data.traits.filter((t) => t !== trait && t.quizzable);
  return take([sameType, rest], new Set(), n, rng);
}

/**
 * Breakpoint arrays are always *real* ones lifted from other traits, preferring
 * the same trait type. A fabricated array would teach a shape that isn't in the
 * game, and would be guessable by its own implausibility.
 */
export function realBreakpointArrays(trait: Trait, data: Dataset, n: number, rng: Rng): number[][] {
  const key = (bps: number[]) => bps.join("/");
  const own = key(trait.breakpoints);

  const byKey = new Map<string, number[]>();
  const add = (pool: Trait[], into: Map<string, number[]>) => {
    for (const t of pool) if (key(t.breakpoints) !== own) into.set(key(t.breakpoints), t.breakpoints);
  };

  const sameType = new Map<string, number[]>();
  add(data.traits.filter((t) => t.type === trait.type && t.quizzable), sameType);
  add(data.traits.filter((t) => t.quizzable), byKey);
  for (const k of sameType.keys()) byKey.delete(k);

  return take([[...sameType.values()], [...byKey.values()]], new Set(), n, rng);
}

/** Abilities from same-cost champions — never the champion's own. */
export function sameCostAbilities(champion: Champion, data: Dataset, n: number, rng: Rng): Champion[] {
  return sample(sameCostChampions(champion, data), n, rng);
}

/**
 * Mana values from same-cost champions, deduplicated by the value itself:
 * 12 of the 32 distinct mana values in Set 18 are shared by two or more
 * champions, so picking by champion would offer the right answer twice.
 */
export function distinctManaValues(champion: Champion, data: Dataset, n: number, rng: Rng): string[] {
  const seen = new Set([champion.mana.raw]);
  const pool = shuffle(sameCostChampions(champion, data), rng)
    .map((c) => c.mana.raw)
    .filter((raw) => !seen.has(raw) && seen.add(raw));
  if (pool.length >= n) return pool.slice(0, n);
  const wider = shuffle(data.champions, rng)
    .map((c) => c.mana.raw)
    .filter((raw) => !seen.has(raw) && seen.add(raw));
  return [...pool, ...wider].slice(0, n);
}
