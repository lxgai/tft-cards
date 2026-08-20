import { notFound } from "next/navigation";

import { QuizPage } from "@/components/quiz-page";
import { UNITS } from "@/lib/quiz/curriculum";
import { unitSlug } from "@/lib/quiz/routes";

export const dynamicParams = false;

export function generateStaticParams() {
  return UNITS.map((unit) => ({ level: String(unit.level), unit: unitSlug(unit.id) }));
}

export default async function UnitPage({
  params,
}: {
  params: Promise<{ level: string; unit: string }>;
}) {
  const { level, unit: slug } = await params;
  const unit = UNITS.find((u) => unitSlug(u.id) === slug);
  if (!unit) notFound();
  return <QuizPage unitId={unit.id} backHref={`/test/${level}`} />;
}
