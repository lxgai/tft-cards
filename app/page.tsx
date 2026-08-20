import Link from "next/link";

import { Screen, TabBar } from "@/components/chrome";
import { buildDecks } from "@/lib/cards/decks";
import { getDataset } from "@/lib/data/dataset";
import { LEVELS, UNITS } from "@/lib/quiz/curriculum";

export default function Home() {
  const data = getDataset();
  const decks = buildDecks(data);
  const cards = decks.reduce((n, deck) => n + deck.cards.length, 0);

  return (
    <Screen>
      <header className="px-5 pt-[30px] pb-[18px]">
        <p className="font-display text-[12px] font-bold tracking-[.16em] text-trace">
          SET 18 · {data.champions.length} CHAMPIONS · {data.traits.length} TRAITS
        </p>
        <h1 className="mt-2 font-display text-[38px] leading-[1.05] font-bold tracking-[-0.04em]">
          Know it
          <br />
          on sight.
        </h1>
      </header>

      <main className="flex flex-1 flex-col gap-[14px] px-5 pb-[18px]">
        <Link
          href="/study"
          className="flex flex-1 flex-col justify-between rounded-[20px] border-b-[5px] border-trace bg-surface p-[22px]"
        >
          <div>
            <div className="font-display text-[12px] font-bold tracking-[.14em] text-trace">
              STUDY
            </div>
            <div className="mt-[10px] font-display text-[30px] font-bold tracking-[-0.03em]">
              Flip
            </div>
            <p className="mt-[6px] text-[15px] leading-[1.45] text-slate">
              {decks.length} decks, {cards} cards. Nothing counted.
            </p>
          </div>
          <span className="text-[13px] font-medium text-slate">Swipe through, stop whenever.</span>
        </Link>

        <Link
          href="/test"
          className="flex flex-1 flex-col justify-between rounded-[20px] border-b-[5px] border-gold bg-ink p-[22px] text-on-ink"
        >
          <div>
            <div className="font-display text-[12px] font-bold tracking-[.14em] text-gold">TEST</div>
            <div className="mt-[10px] font-display text-[30px] font-bold tracking-[-0.03em]">
              Quiz
            </div>
            <p className="mt-[6px] text-[15px] leading-[1.45] text-on-ink-mute">
              {LEVELS.length} levels, {UNITS.length} units. Graded at the end, then forgotten.
            </p>
          </div>
          <span className="text-[13px] font-semibold text-gold">Open the syllabus</span>
        </Link>
      </main>

      <TabBar active="/" />
    </Screen>
  );
}
