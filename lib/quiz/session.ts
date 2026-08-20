"use client";

/**
 * One quiz attempt, held in React state.
 *
 * Nothing here touches localStorage, sessionStorage, cookies, IndexedDB or the
 * URL. Unmounting the component ends the attempt — that is the design, not an
 * oversight. Answers accumulate ungraded; grading happens once, on submit.
 */
import { useCallback, useMemo, useState } from "react";

import { retryQuiz } from "./generate";
import { grade } from "./score";
import type { Answers, Question, Quiz, Result } from "./types";

export type Session = {
  quiz: Quiz;
  index: number;
  question: Question | undefined;
  answers: Answers;
  /** Set once the quiz is submitted; null while answering. */
  result: Result | null;
  isLast: boolean;
  answeredCount: number;

  select(optionId: string): void;
  goTo(index: number): void;
  next(): void;
  previous(): void;
  submit(): void;
  /** Start a fresh attempt over the questions missed. Returns false if none. */
  retryMisses(): boolean;
};

export function useQuizSession(initialQuiz: Quiz): Session {
  const [quiz, setQuiz] = useState(initialQuiz);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<Result | null>(null);

  const question = quiz.questions[index];

  const select = useCallback(
    (optionId: string) => {
      if (!question || result) return;
      setAnswers((prev) => {
        const current = prev[question.id] ?? [];
        if (question.mode === "single") return { ...prev, [question.id]: [optionId] };
        const next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [question.id]: next };
      });
    },
    [question, result],
  );

  const goTo = useCallback(
    (to: number) => setIndex(Math.max(0, Math.min(to, quiz.questions.length - 1))),
    [quiz.questions.length],
  );

  const submit = useCallback(() => setResult(grade(quiz, answers)), [quiz, answers]);

  const retryMisses = useCallback(() => {
    if (!result?.misses.length) return false;
    setQuiz(retryQuiz(quiz, result.misses.map((m) => m.question), result.misses.length * 31 + index));
    setAnswers({});
    setResult(null);
    setIndex(0);
    return true;
  }, [quiz, result, index]);

  const answeredCount = useMemo(
    () => quiz.questions.filter((q) => (answers[q.id]?.length ?? 0) > 0).length,
    [quiz.questions, answers],
  );

  return {
    quiz,
    index,
    question,
    answers,
    result,
    isLast: index === quiz.questions.length - 1,
    answeredCount,
    select,
    goTo,
    next: () => goTo(index + 1),
    previous: () => goTo(index - 1),
    submit,
    retryMisses,
  };
}
