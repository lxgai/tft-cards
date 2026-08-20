/**
 * Grading happens once, at the end of a completed quiz — never per question.
 * The result lives in React state and is gone when you navigate away.
 */
import type { Answers, Question, Quiz, Result } from "./types";

/** Multi-select is all-or-nothing: a partial roster is a wrong roster. */
export function isCorrect(question: Question, given: string[] | undefined): boolean {
  if (!given) return false;
  if (question.mode === "single") return given.length === 1 && given[0] === question.correct[0];
  const answer = new Set(given);
  return answer.size === question.correct.length && question.correct.every((id) => answer.has(id));
}

export function grade(quiz: Quiz, answers: Answers): Result {
  const misses = quiz.questions
    .filter((q) => !isCorrect(q, answers[q.id]))
    .map((question) => ({ question, given: answers[question.id] ?? [] }));
  return {
    total: quiz.questions.length,
    correct: quiz.questions.length - misses.length,
    misses,
  };
}

/** The option labels behind a set of ids, in the order the question shows them. */
export function labelsFor(question: Question, ids: string[]): string[] {
  return question.options.filter((o) => ids.includes(o.id)).map((o) => o.label);
}
