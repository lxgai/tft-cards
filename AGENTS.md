<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# TFT Set 18 flashcards

A static flashcard app for memorizing TFT Set 18, used on a phone between
games. Read `README.md` for what it does and how it is laid out. This file is
the short list of things that will bite you.

## Before you say you are done

```
npm run typecheck && npm run lint && npm test && npm run build
```

For a data or generation change, also eyeball the output: `npm run inspect`
prints what the parser made of the source, `npm run cards` prints real study
cards, `npm run quiz 4.2` prints a real unit. These are faster than a browser
and catch content problems the tests do not describe.

## Hard constraints

**Never add persistence.** No localStorage, sessionStorage, cookies, IndexedDB,
or state encoded in the URL. Not for convenience, not for a "small" preference,
not for a draft answer. A quiz attempt lives in React state and dies with the
component; that is the product, not an oversight. The one exception already in
the tree is the service worker's Cache Storage, which holds built application
files and nothing else — do not put state there.

**Never invent a number.** The source export has had its numeric values
stripped: descriptions read "gain a Shield for seconds". Do not restore, infer
or fill in a value, and never generate a question whose answer would be one.
Where the data cannot support something, say so in the UI — there is already a
`caveat` block and a "not spelled out in the source data" treatment for this.

**Grading happens once, at the end of a quiz.** No per-question right/wrong
feedback, however tempting; answering straight through is the point. The
correct/wrong visual treatment belongs on the results screen.

**Study never grades. Test never shows an ungraded card.** The two sections
share `lib/data` and nothing else.

## Conventions

- **Ids are `{entityType}:{slug}#{templateId}`**, derived from names, never
  positional and never the display text. Slugs come from `lib/data/slug.ts`.
- **The card and quiz engines are entity-agnostic.** Adding a new subject
  (augments are next) means writing templates and registering them, not
  touching the engines or the UI. If a template needs a shape that does not
  exist, extend `CardBlock` and render it in `components/blocks.tsx`.
- **Distractor rules are enforced by tests**, not by convention.
  `lib/quiz/quiz.test.ts` runs every rule across eight seeds and every unit.
  If you change a strategy in `lib/quiz/distractors.ts`, the test tells you
  what you broke. A "random" distractor makes the quiz worthless.
- **Reverse questions mask their subject.** 27 trait descriptions name their
  own trait and 14 abilities name their own champion. `lib/data/redact.ts`
  handles it; study decks always show the raw text.
- **Quizzes are drawn client-side** with a fresh seed (`components/quiz-page.tsx`).
  Do not move that to build time — a prerendered page bakes one draw in forever.
  Study decks do prerender.

## Design

The look comes from a Claude Design canvas. Colours, metals and type live as
tokens in `app/globals.css`; `components/tiers.ts` maps a cost or breakpoint
colour to its swatch.

- **Use the exact values.** Sizes and spacings come from the design; do not
  round them to a Tailwind scale step or a 4/8px grid.
- **One committed palette, no dark mode.** Inverting it loses the tier metals
  the design is built around.
- **Cost and breakpoint tiers are hexagons**, everywhere, always. That is the
  signature element.
- **Contrast:** the muted greys (`trace`, `mute`) are for labels, counters and
  eyebrows. Any sentence meant to be read uses `slate` or darker.
- Mobile first at 390px. Tap targets 44px and up. No hover-only interaction.

## Gotchas

- Tailwind v4: write base rules inside `@layer base`. An unlayered rule beats
  every layered utility — a bare `a { color: inherit }` silently killed every
  text colour on a link here once.
- `output: "export"` is on. No server, no API routes, no middleware. A route
  handler needs `export const dynamic = "force-static"`.
- `npm run build` runs `next build` and then `scripts/build-sw.mjs`. The service
  worker's precache list can only be generated after the build, because the
  asset names are content-hashed.
