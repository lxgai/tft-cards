import type { CardBlock } from "@/lib/cards/types";

import { Hex } from "./hex";
import { costSwatch, tierSwatch } from "./tiers";

/**
 * Renders the generic blocks a card face or quiz prompt is built from. This is
 * the only place that knows what a block looks like, which is what lets the
 * card and quiz engines stay ignorant of champions and traits.
 */
export function Blocks({ blocks }: { blocks: CardBlock[] }) {
  const rendered: React.ReactNode[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const next = blocks[i + 1];

    // An ability name and its mana cost belong on one line.
    if (block.type === "subject" && next?.type === "kv") {
      i++;
      rendered.push(
        <div key={i} className="flex items-center justify-between gap-3">
          <h3 className="font-display text-[19px] font-bold tracking-[-0.02em]">{block.text}</h3>
          <span className="flex-none rounded-full bg-bone px-[11px] py-1 text-[13px] font-semibold text-slate">
            {next.value}
          </span>
        </div>,
      );
      continue;
    }

    rendered.push(<Block key={i} block={block} />);
  }

  return <>{rendered}</>;
}

function Block({ block }: { block: CardBlock }) {
  switch (block.type) {
    case "subject":
      return (
        <h3 className="font-display text-[19px] font-bold tracking-[-0.02em]">{block.text}</h3>
      );

    case "text":
      return (
        <div className="flex flex-col gap-3">
          {block.text.split("\n\n").map((paragraph, i) => (
            <p key={i} className="text-[16px] leading-[1.55] text-pretty text-ink-soft">
              {/* Single newlines are real breaks — they separate a trait's
                  breakpoint lines, which run together as one blob otherwise. */}
              {paragraph.split("\n").map((line, j, all) => (
                <span key={j}>
                  {line}
                  {j < all.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
          ))}
        </div>
      );

    case "chips":
      return (
        <div className="flex flex-wrap gap-[7px]">
          {block.items.map((chip) => (
            <span
              key={chip.label}
              className="flex items-center gap-[7px] rounded-full bg-bone px-3 py-[7px] text-[14px] font-semibold"
            >
              {chip.label}
              {chip.tiers?.length ? (
                <span className="flex gap-[3px]" aria-hidden>
                  {chip.tiers.map((color, i) => (
                    <span
                      key={i}
                      className="size-[7px] rounded-full"
                      style={{ background: tierSwatch(color).fill }}
                    />
                  ))}
                </span>
              ) : null}
            </span>
          ))}
        </div>
      );

    case "group":
      return (
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11.5px] font-medium tracking-[.09em] text-mute uppercase">
            {block.label}
          </span>
          <div className="flex flex-wrap gap-[6px]">
            {block.items.map((name) => (
              <span
                key={name}
                className="flex items-center gap-2 rounded-full bg-bone py-[3px] pr-3 pl-[3px] text-[14px] font-semibold"
              >
                <Hex swatch={costSwatch(block.cost)} width={20} height={23} fontSize={11}>
                  {block.cost}
                </Hex>
                {name}
              </span>
            ))}
          </div>
        </div>
      );

    case "kv":
      return (
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-mono text-[11.5px] font-medium tracking-[.09em] text-mute uppercase">
            {block.label}
          </span>
          <span className="text-[15px] font-semibold">{block.value}</span>
        </div>
      );

    case "bullets":
      return (
        <ul className="flex flex-col gap-[10px]">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-[10px]">
              <span className="hex mt-[7px] h-[9px] w-2 flex-none bg-ink" aria-hidden />
              <span className="text-[16px] leading-[1.4] text-pretty">{item}</span>
            </li>
          ))}
        </ul>
      );

    case "tiers":
      return <Tiers items={block.items} />;

    case "note":
      return <p className="text-[13.5px] leading-[1.5] text-pretty text-slate">{block.text}</p>;

    case "caveat":
      return <p className="text-[12px] font-medium text-trace">{block.text}</p>;
  }
}

function Tiers({ items }: { items: Extract<CardBlock, { type: "tiers" }>["items"] }) {
  // Five breakpoints have to fit 390px, so the ladder shrinks rather than wraps.
  const width = items.length > 4 ? 44 : 52;
  const described = items.some((tier) => tier.text);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {items.map((tier) => (
          <div key={tier.breakpoint} className="flex flex-1 flex-col items-center gap-[7px]">
            <Hex swatch={tierSwatch(tier.color)} width={width} height={Math.round(width * 1.135)}>
              {tier.breakpoint}
            </Hex>
            <span className="font-display text-[10.5px] font-semibold tracking-[.1em] text-trace">
              {tierSwatch(tier.color).label}
            </span>
          </div>
        ))}
      </div>

      {described ? (
        <ul className="flex flex-col gap-[10px]">
          {items.map((tier) => (
            <li key={tier.breakpoint} className="flex gap-[10px]">
              <span
                className="mt-[6px] size-[9px] flex-none rounded-full"
                style={{ background: tierSwatch(tier.color).fill }}
                aria-hidden
              />
              <p className="text-[15px] leading-[1.5] text-pretty text-ink-soft">
                <span className="font-display font-bold">({tier.breakpoint})</span>{" "}
                {tier.text ?? <span className="text-trace">not spelled out in the source data</span>}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
