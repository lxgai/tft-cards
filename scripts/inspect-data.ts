/** Prints what the data layer made of the source export. `npm run inspect`. */
import { buildDataset } from "@/lib/data/dataset";

const d = buildDataset();

const pad = (s: string, n: number) => s.padEnd(n);
console.log(`champions ${d.champions.length}  traits ${d.traits.length}\n`);

console.log("--- trait shapes ---");
for (const shape of ["per-tier", "scaling", "single"] as const) {
  const ts = d.traits.filter((t) => t.shape === shape);
  console.log(`\n${shape} (${ts.length}): ${ts.map((t) => t.name).join(", ")}`);
}

console.log("\n--- per-tier traits, tier by tier ---");
for (const t of d.traits.filter((t) => t.shape === "per-tier")) {
  console.log(`\n${t.name} [${t.type}] roster ${t.championSlugs.length}`);
  if (t.preamble) console.log(`  preamble: ${t.preamble.replace(/\n/g, " / ")}`);
  for (const tier of t.tiers) {
    console.log(`  (${tier.breakpoint}) c${tier.color}: ${tier.text?.replace(/\n/g, " / ") ?? "— no text in data"}`);
  }
  if (t.footnote) console.log(`  footnote: ${t.footnote.replace(/\n/g, " / ")}`);
}

console.log("\n--- scaling traits: the one effect that grows ---");
for (const t of d.traits.filter((t) => t.shape === "scaling")) {
  console.log(`${pad(t.name, 14)} bp ${pad(t.breakpoints.join("/"), 10)} ${t.sharedEffect?.replace(/\n/g, " / ") ?? "(no shared effect text!)"}`);
}

console.log("\n--- single traits ---");
for (const t of d.traits.filter((t) => t.shape === "single")) {
  console.log(`${pad(t.name, 15)} ${t.description.replace(/\n/g, " / ").slice(0, 110)}`);
}

console.log("\n--- redaction spot check ---");
for (const name of ["Cinderling", "Akali", "The Elder Dragon", "Master Yi", "Kayle"]) {
  const c = d.champions.find((c) => c.name === name)!;
  console.log(`\n${c.name}: ${c.redactedAbility.replace(/\n/g, " / ").slice(0, 200)}`);
}
for (const name of ["Brawler", "Riftbeast"]) {
  const t = d.traits.find((t) => t.name === name)!;
  console.log(`\n${t.name}: ${t.redactedDescription.replace(/\n/g, " / ").slice(0, 200)}`);
}

console.log("\n--- normalized ability spot check ---");
for (const name of ["Ornn", "Veigar", "Teemo", "Varus"]) {
  const c = d.champions.find((c) => c.name === name)!;
  console.log(`\n${c.name} (${c.mana.raw}): ${c.ability.replace(/\n/g, " / ")}`);
}

console.log(`\n--- ${d.warnings.length} warnings ---`);
for (const w of d.warnings) console.log(`  [${pad(w.kind, 18)}] ${pad(w.entity, 16)} ${w.detail}`);
