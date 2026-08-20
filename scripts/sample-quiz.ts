/** Prints real questions from every unit. `npm run quiz [unitId]`. */
import { buildDataset } from "@/lib/data/dataset";
import { LEVELS, UNITS, findUnit } from "@/lib/quiz/curriculum";
import { buildQuiz } from "@/lib/quiz/generate";
import type { Question } from "@/lib/quiz/types";

const data = buildDataset();
const only = process.argv[2];

function show(q: Question, n: number) {
  console.log(`\n  ${n}. ${q.lead}`);
  for (const b of q.prompt) {
    if (b.type === "subject") console.log(`     « ${b.text} »`);
    if (b.type === "text") console.log(b.text.split("\n").map((l) => `     ${l}`).join("\n"));
    if (b.type === "chips") console.log(`     ${b.items.map((i) => `‹${i.label}›`).join(" ")}`);
  }
  for (const o of q.options) {
    const mark = q.correct.includes(o.id) ? "✓" : " ";
    console.log(`     [${mark}] ${o.label}${o.body ? `\n           ${o.body.replace(/\n+/g, " ").slice(0, 150)}` : ""}`);
  }
  console.log(`     id: ${q.id}`);
}

if (only) {
  const quiz = buildQuiz(findUnit(only)!, data, 7);
  console.log(`${quiz.unitId} ${quiz.title} — ${quiz.questions.length} questions`);
  quiz.questions.forEach((q, i) => show(q, i + 1));
} else {
  for (const level of LEVELS) {
    console.log(`\n\n═══ L${level.level} · ${level.title} — ${level.blurb}`);
    for (const unit of level.units) {
      const quiz = buildQuiz(unit, data, 7);
      console.log(`\n${unit.id}  ${unit.title}  (${quiz.questions.length} questions)`);
      console.log(`     covers: ${unit.covers}`);
      console.log(`     assumes: ${unit.assumes}`);
      show(quiz.questions[0], 1);
    }
  }
  console.log(`\n\n${UNITS.length} units.`);
}
