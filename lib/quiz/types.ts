/**
 * The quiz engine. Like the card engine it is entity-agnostic: a question
 * template says which entities it can ask about and how to build one question,
 * and everything downstream — the runner, grading, retry — sees only Questions.
 */
import type { CardBlock } from "@/lib/cards/types";
import type { Cost, Dataset } from "@/lib/data/types";
import type { Rng } from "@/lib/rng";

export type QuestionMode = "single" | "multi";

export type Option = {
  /** Stable within the question: a slug, or the literal value being chosen. */
  id: string;
  label: string;
  /** Longer body for options that are a paragraph rather than a name. */
  body?: string;
  /** Cost tier, when the option is a champion — drawn as the hex tile. */
  cost?: Cost;
};

export type Question = {
  /** `{entityType}:{slug}#{templateId}` — stable, never positional. */
  id: string;
  templateId: string;
  unitId: string;
  mode: QuestionMode;
  /** The ask, in one line. */
  lead: string;
  /** Substring of `lead` to highlight — the word the question turns on. */
  emphasis?: string;
  /** The subject, rendered with the same blocks the study cards use. */
  prompt: CardBlock[];
  options: Option[];
  /** Option ids. One for `single`, one or more for `multi`. */
  correct: string[];
};

export type QuestionTemplate<E> = {
  id: string;
  mode: QuestionMode;
  entityType: string;
  /** Every entity this template could ask about, before unit filtering. */
  candidates(data: Dataset): E[];
  slugOf(entity: E): string;
  /** Null when this entity cannot yield a fair question (too few distractors). */
  build(entity: E, data: Dataset, rng: Rng): Omit<Question, "unitId"> | null;
};

/** Narrows a template's candidates to the slice a unit drills. */
export type UnitPool =
  | { kind: "all" }
  | { kind: "cost"; cost: Cost }
  /** Traits by roster size — the axis that makes trait -> roster hard. */
  | { kind: "roster"; min: number; max?: number };

/**
 * A unit of the syllabus. Deliberately carries no progress, accuracy or
 * completion state — the Test section is a menu, not a tracker.
 */
export type Unit = {
  /** "1.1", "4.2" — the number the syllabus shows. */
  id: string;
  level: number;
  title: string;
  /** What this unit drills. */
  covers: string;
  /** What it assumes you already know. */
  assumes: string;
  templateIds: string[];
  pool?: UnitPool;
  /** Question count. Defaults to the whole pool. */
  length?: number;
  /** `cost-desc` runs 5-costs first — the units you actually pick. */
  order?: "shuffle" | "cost-desc";
};

export type Level = {
  level: number;
  title: string;
  blurb: string;
  /** FOUNDATION / INTERMEDIATE / ADVANCED — the rung of the ladder. */
  band: "FOUNDATION" | "INTERMEDIATE" | "ADVANCED";
  /** What the whole level assumes, e.g. "L1-L2". */
  assumes: string;
  units: Unit[];
};

export type Quiz = {
  unitId: string;
  title: string;
  questions: Question[];
};

/** One attempt's answers. Lives in React state and dies with the component. */
export type Answers = Record<string, string[]>;

export type Miss = {
  question: Question;
  given: string[];
};

export type Result = {
  total: number;
  correct: number;
  misses: Miss[];
};
