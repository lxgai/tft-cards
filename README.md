# TFT Set 18 flashcards

Flashcards and quizzes for memorizing Teamfight Tactics Set 18 — champions,
traits, breakpoints and abilities. Built for in-game recall on a phone between
games: designed at 390px, tap targets at 44px and up, installable to a home
screen, and it works with no network.

Static site: no server, no database, no accounts, no analytics. **Nothing is
persisted.** No localStorage, no sessionStorage, no cookies, no IndexedDB, and
no state smuggled through the URL. A quiz is graded when you finish it, you see
the result, and the result is gone when you navigate away. That is deliberate.

## Commands

| | |
|---|---|
| `npm run dev` | Development server (no service worker) |
| `npm run build` | Static export to `./out`, then generate `out/sw.js` |
| `npm run preview` | Build and serve `./out` on :4321 |
| `npm run serve` | Serve an existing `./out` without rebuilding |
| `npm test` | 87 unit tests — the data layer and every distractor rule |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run inspect` | Print what the data layer made of the source export |
| `npm run cards` | Print real study cards from every deck |
| `npm run quiz [unit]` | Print real questions, e.g. `npm run quiz 4.2` |

The last three print real content to a terminal, which is the fastest way to
check a data or generation change without opening a browser.

## The two sections

**Study** — 47 decks, 341 cards, in three sections. Pick a deck, flip through
it. Tap the card or press space to flip, swipe or use the arrow keys to move,
shuffle if you want a different order. Nothing is scored and nothing is counted.

| Section | Deck | Front | Back |
|---|---|---|---|
| By cost | 1-cost … 5-cost traits | Champion | Its traits, each with its breakpoint metals |
| By cost | 1-cost … 5-cost abilities | Champion | Ability name, mana, and what it does |
| Traits | Trait descriptions | Trait | Type, breakpoint ladder, effect |
| Traits | Trait rosters | Trait | Every champion with it, grouped by cost |
| By trait | "Lunar champions", one per trait (35) | Champion | Its traits *and* its ability |

A champion in three traits appears in three of the by-trait decks, as the same
card: a card id names its content, not where you met it.

**Test** — 6 levels, 22 units, presented as a syllabus rather than a progress
tracker: no completion marks, no accuracy, no locking, no "recommended next".

| | Level | Units |
|---|---|---|
| L1 | Roster index | Champion → cost, all 65 mixed |
| L2 | Trait vocabulary | Type, breakpoints, description → trait |
| L3 | Champion → traits | Per cost tier, then mixed (multi-select) |
| L4 | Trait → roster | Uniques, then small / medium / Riftbeast (multi-select) |
| L5 | Abilities | Name, effect, reverse, mana |
| L6 | Synthesis | Trait pairs, odd one out, next breakpoint, mixed final |

Grading happens once, at the end, so you can answer straight through. The
results screen shows the score, every question you missed with its answer, and
an option to retry just the misses — a new attempt held in memory that dies
with the page.

## Layout

```
data/            champions.json, traits.json (+ augments, wisps for phase 2)
lib/data/        loading, normalizing, the trait description parser, slugs
lib/cards/       card templates and the 12 study decks
lib/quiz/        question templates, distractor strategies, grading, session
components/      hex tiles, card blocks, the two runners, chrome
app/             routes for Study and Test
scripts/         the inspection printers, the service worker build, the preview server
```

Study and Test share the data layer and nothing else — Study never grades, Test
never shows an ungraded card.

A card template and a question template are both config objects: entity type,
faces or options, and a stable id scheme (`{entityType}:{slug}#{templateId}`).
Neither engine knows what a champion is; both render through the same generic
blocks (`subject`, `text`, `chips`, `group`, `kv`, `tiers`, `note`, `caveat`).

### Adding augments (phase 2)

`data/augments.json` is already in the repo. The work is: a loader and
normalizer in `lib/data/`, card templates registered in `lib/cards/templates.ts`
with decks in `decks.ts`, question templates in `lib/quiz/templates.ts` with
units in `curriculum.ts`. No engine change, no UI change — if a new template
needs a block shape that does not exist yet, add it to `CardBlock` and render it
in `components/blocks.tsx`.

## Design

The look comes from a Claude Design canvas: bone and ink, Space Grotesk over
Karla, IBM Plex Mono for labels. One signature element — cost tiers and trait
breakpoints both live in a hexagon, so the two ladders read the same way at a
glance. Colours and metals are tokens in `app/globals.css`; `components/tiers.ts`
maps a cost or a breakpoint colour to its swatch.

A single committed palette, no dark variant: inverting it would lose the tier
metals the whole design is built around. Fonts are self-hosted by `next/font`
rather than fetched from Google, so typography survives offline.

Two deliberate departures from the canvas: it drew per-question right/wrong
feedback, which contradicts grading at the end, so that treatment is used on the
results screen instead; and its placeholder content is replaced by real data
everywhere. Its muted greys are kept for labels and counters, but any sentence
meant to be read uses `#5B564E` — `#A39D92` body text is 2.5:1.

## Offline

`scripts/build-sw.mjs` runs after `next build` and writes `out/sw.js`: a service
worker that precaches every file the export produced, versioned by a hash of
their contents so a new build supersedes the old cache. With it registered the
whole app — all 12 decks, all 22 units — opens and runs with no network.

It caches **the built application only**: HTML, JS, CSS, fonts, the icon. No
answer, score or deck position is written there or anywhere else. The app is
still stateless between page loads.

Deploy note: serve `sw.js` with a short or no-store cache header, or browsers
will hold an old worker past a deploy. Everything under `/_next/static` is
content-hashed and safe to cache forever.

## About the source data

`data/champions.json` and `data/traits.json` are a scrape of the Set 18 client
export, and they have quirks the code handles explicitly rather than papering
over. `npm run inspect` reports all of it. In short:

- **Numbers are stripped.** Descriptions read "gain a Shield for seconds". The
  app never restores, guesses or displays a number that isn't in the data, and
  never asks a question whose answer would be one.
- **`effects` is empty on all 36 traits**, so per-breakpoint effects are parsed
  out of the description's `(2)` / `(3)` markers. The result is classified, not
  trusted: 10 traits genuinely differ per breakpoint, 14 have one effect that
  simply grows, and 12 have a single breakpoint or none. Only the first group
  gets breakpoint-specific questions. Two breakpoints that read identically
  once numbers are gone (Inferno 5 and 7) are never asked about.
- **Text names its own subject.** 27 trait descriptions contain their trait
  name and 14 abilities contain their champion's. Study decks show the raw
  text; reverse questions ("whose ability is this?") mask it out first.
- **Eclipse has no champions.** It is described by its activation condition and
  excluded from every generated question.

## Decisions worth knowing

- **Distractor rules are the spec, and the tests are the spec's enforcement.**
  Breakpoint distractors are real arrays lifted from other traits; roster
  distractors are same-cost non-members; mana distractors are deduplicated by
  value because 12 of 32 mana values are shared. `lib/quiz/quiz.test.ts` asserts
  each rule across eight seeds and every unit. Change a strategy, run the tests.
- **Quizzes are drawn in the browser** with a fresh seed, so the same unit gives
  different questions each time. A prerendered page would bake one draw in
  forever. Study decks prerender.
- **L4 multi-select shows the whole roster**: 8 options for a 2–3 champion
  trait, 12 for 5–7, 16 for Riftbeast's 10. Not a sampled subset.
- **Unit 4.3 is one question**, because Riftbeast is the only trait with 8 or
  more champions.
- **Unit 5.2 runs 5-costs first**, then 4, 3, 2, 1 — the expensive units are the
  ones you actually pick.
- **L1 is a single mixed unit.** Per-tier cost drills were cut: with one tier
  per quiz the answer never changes.

## Not in v1

Augments and Wisps (the data is in `data/`, phase 2), persistence of any kind,
stats, score history, spaced repetition, accounts, items, emblems, portals, and
champion portraits — `Champion.portrait` is a documented empty slot, and the
study card front already has a hex sized for it.
