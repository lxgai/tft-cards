/**
 * Turns a syllabus unit into one quiz attempt. Pure: same unit and seed give
 * the same questions, which is what makes the distractor rules testable.
 */
import type { Champion, Dataset, Trait } from "@/lib/data/types";
import { makeRng, shuffle } from "@/lib/rng";

import { templateById } from "./templates";
import type { Question, Quiz, Unit, UnitPool } from "./types";

type Entity = Champion | Trait;

function inPool(entity: Entity, pool: UnitPool | undefined, data: Dataset): boolean {
  if (!pool || pool.kind === "all") return true;
  if (pool.kind === "cost") return "cost" in entity && entity.cost === pool.cost;
  if (pool.kind === "roster") {
    if (!("championSlugs" in entity)) return false;
    const size = entity.championSlugs.length;
    return size >= pool.min && (pool.max === undefined || size <= pool.max);
  }
  void data;
  return true;
}

export function buildQuiz(unit: Unit, data: Dataset, seed: number): Quiz {
  const rng = makeRng(seed);

  const pairs = unit.templateIds.flatMap((templateId) => {
    const template = templateById.get(templateId);
    if (!template) throw new Error(`Unknown question template: ${templateId}`);
    return template
      .candidates(data)
      .filter((e: Entity) => inPool(e, unit.pool, data))
      .map((entity: Entity) => ({ template, entity }));
  });

  const ordered =
    unit.order === "cost-desc"
      ? // 5-costs first: the expensive units are the ones you actually pick.
        shuffle(pairs, rng).sort(
          (a, b) =>
            (("cost" in b.entity ? b.entity.cost : 0) as number) -
            (("cost" in a.entity ? a.entity.cost : 0) as number),
        )
      : shuffle(pairs, rng);

  const wanted = unit.length ?? ordered.length;
  const questions: Question[] = [];
  const seen = new Set<string>();

  for (const { template, entity } of ordered) {
    if (questions.length >= wanted) break;
    const built = template.build(entity, data, rng);
    // A template returns null when it cannot build a fair question for this
    // entity — too few distractors. Skip it and take the next candidate.
    if (!built || seen.has(built.id)) continue;
    seen.add(built.id);
    questions.push({ ...built, unitId: unit.id });
  }

  return { unitId: unit.id, title: unit.title, questions };
}

/**
 * A new attempt over just the questions missed, options reshuffled so it is a
 * second look rather than a memory of where the right answer sat. Held in
 * memory only — leaving the page discards it.
 */
export function retryQuiz(quiz: Quiz, missed: Question[], seed: number): Quiz {
  const rng = makeRng(seed);
  return {
    unitId: quiz.unitId,
    title: `${quiz.title} — retry`,
    questions: shuffle(missed, rng).map((q) => ({ ...q, options: shuffle(q.options, rng) })),
  };
}
