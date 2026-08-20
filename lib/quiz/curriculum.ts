/**
 * The syllabus: an ordered menu of units, each with what it covers and what it
 * assumes. Nothing here records what you have done — no completion, no
 * accuracy, no locking, no "recommended next". You know where you left off.
 */
import { COSTS } from "@/lib/data/types";

import type { Level, Unit } from "./types";

/**
 * Question counts. A unit shorter than its cap runs its whole pool: 4.1 is six
 * traits, 4.3 is Riftbeast alone.
 */
const DRILL = 12;
const MIXED = 15;

const costUnits = (
  prefix: string,
  level: number,
  templateId: string,
  covers: (cost: number) => string,
  assumes: string,
): Unit[] =>
  COSTS.map((cost, i) => ({
    id: `${prefix}.${i + 1}`,
    level,
    title: `${cost}-cost champions`,
    covers: covers(cost),
    assumes,
    templateIds: [templateId],
    pool: { kind: "cost", cost } as const,
  }));

export const LEVELS: Level[] = [
  {
    level: 1,
    title: "Roster index",
    band: "FOUNDATION",
    assumes: "nothing",
    blurb: "The foundation — every later level assumes it.",
    units: [
      {
        id: "1.1",
        level: 1,
        title: "Champion → cost",
        covers: "All 65 champions, mixed.",
        assumes: "Nothing.",
        templateIds: ["champ-cost"],
        length: MIXED,
      },
    ],
  },
  {
    level: 2,
    title: "Trait vocabulary",
    band: "FOUNDATION",
    assumes: "nothing",
    blurb: "Learnable without knowing a single champion.",
    units: [
      {
        id: "2.1",
        level: 2,
        title: "Trait → Origin / Class / Unique",
        covers: "Which of the three kinds each trait is.",
        assumes: "Nothing.",
        templateIds: ["trait-type"],
        length: DRILL,
      },
      {
        id: "2.2",
        level: 2,
        title: "Trait → breakpoints",
        covers: "Inferno 2/3/5/7 against Vanguard 2/4/6. Uniques are excluded — they all activate at 1.",
        assumes: "Nothing.",
        templateIds: ["trait-breakpoints"],
        length: DRILL,
      },
      {
        id: "2.3",
        level: 2,
        title: "Description → trait",
        covers: "Reading an effect and naming it, with the trait's own name masked out.",
        assumes: "2.1.",
        templateIds: ["description-trait"],
        length: DRILL,
      },
    ],
  },
  {
    level: 3,
    title: "Champion → traits",
    band: "INTERMEDIATE",
    assumes: "L1-L2",
    blurb: "Multi-select: most champions bring two or three.",
    units: [
      ...costUnits(
        "3",
        3,
        "champ-traits",
        (cost) => `Every ${cost}-cost champion's traits.`,
        "L1 and L2.",
      ),
      {
        id: "3.6",
        level: 3,
        title: "Mixed, all tiers",
        covers: "Champions from every cost tier.",
        assumes: "3.1 – 3.5.",
        templateIds: ["champ-traits"],
        length: MIXED,
      },
    ],
  },
  {
    level: 4,
    title: "Trait → roster",
    band: "INTERMEDIATE",
    assumes: "L1-L3",
    blurb: "The reverse direction, and much harder. This is the emblem-scouting skill.",
    units: [
      {
        id: "4.0",
        level: 4,
        title: "The 10 Unique traits",
        covers: "One champion each. The warm-up.",
        assumes: "L1.",
        templateIds: ["unique-champion"],
        pool: { kind: "roster", min: 1, max: 1 },
      },
      {
        id: "4.1",
        level: 4,
        title: "Small traits",
        covers: "Two to four champions: Solar, Lunar, Primal, Flora Fatalis, Rival, Summoner.",
        assumes: "4.0.",
        templateIds: ["trait-roster"],
        pool: { kind: "roster", min: 2, max: 4 },
      },
      {
        id: "4.2",
        level: 4,
        title: "Medium traits",
        covers: "Five to seven champions — 18 traits, the bulk of the board.",
        assumes: "4.1.",
        templateIds: ["trait-roster"],
        pool: { kind: "roster", min: 5, max: 7 },
        length: DRILL,
      },
      {
        id: "4.3",
        level: 4,
        title: "Riftbeast",
        covers: "The one large trait: 10 champions across every cost tier.",
        assumes: "4.2.",
        templateIds: ["trait-roster"],
        pool: { kind: "roster", min: 8 },
      },
    ],
  },
  {
    level: 5,
    title: "Abilities",
    band: "ADVANCED",
    assumes: "L1",
    blurb: "What the unit actually does when it casts.",
    units: [
      {
        id: "5.1",
        level: 5,
        title: "Champion → ability name",
        covers: "Putting a name to each ability.",
        assumes: "L1.",
        templateIds: ["champ-ability-name"],
        length: DRILL,
      },
      {
        id: "5.2",
        level: 5,
        title: "Champion → ability effect",
        covers: "What the ability does. Runs 5-costs first, then 4, 3, 2, 1.",
        assumes: "L1.",
        templateIds: ["champ-ability-effect"],
        order: "cost-desc",
        length: MIXED,
      },
      {
        id: "5.3",
        level: 5,
        title: "Ability → champion",
        covers: "Reading an ability and naming the champion, with names masked out.",
        assumes: "5.2.",
        templateIds: ["ability-champ"],
        length: DRILL,
      },
      {
        id: "5.4",
        level: 5,
        title: "Champion → mana",
        covers: "Starting and total mana, including the champions with no mana bar.",
        assumes: "L1.",
        templateIds: ["champ-mana"],
        length: DRILL,
      },
    ],
  },
  {
    level: 6,
    title: "Synthesis",
    band: "ADVANCED",
    assumes: "L1-L5",
    blurb: "No new facts — applied recall.",
    units: [
      {
        id: "6.1",
        level: 6,
        title: "Both of these traits",
        covers: "Which champion sits at the intersection of two traits.",
        assumes: "L3 and L4.",
        templateIds: ["trait-pair-champion"],
        length: 10,
      },
      {
        id: "6.2",
        level: 6,
        title: "Odd one out",
        covers: "Which of these four is not in the trait.",
        assumes: "L4.",
        templateIds: ["not-in-trait"],
        length: 10,
      },
      {
        id: "6.3",
        level: 6,
        title: "Hitting the next breakpoint",
        covers: "Given a trait count, which champion moves you up.",
        assumes: "L2 and L4.",
        templateIds: ["reach-breakpoint"],
        length: 10,
      },
      {
        id: "6.4",
        level: 6,
        title: "Mixed final",
        covers: "Any question type from any level.",
        assumes: "Everything above.",
        templateIds: [
          "champ-cost",
          "trait-type",
          "trait-breakpoints",
          "description-trait",
          "champ-traits",
          "unique-champion",
          "trait-roster",
          "champ-ability-name",
          "champ-ability-effect",
          "ability-champ",
          "champ-mana",
          "trait-pair-champion",
          "not-in-trait",
          "reach-breakpoint",
        ],
        length: 20,
      },
    ],
  },
];

export const UNITS: Unit[] = LEVELS.flatMap((l) => l.units);

export function findUnit(id: string): Unit | undefined {
  return UNITS.find((u) => u.id === id);
}
