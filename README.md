# TFT Set 18 flashcards

Flashcards and quizzes for memorizing Teamfight Tactics Set 18 — champions,
traits, breakpoints and abilities. Built for in-game recall on a phone between
games.

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
| `npm test` | Unit tests — the data layer and every distractor rule |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run inspect` | Print what the data layer made of the source export |
| `npm run cards` | Print real study cards from every deck |
| `npm run quiz [unit]` | Print real questions, e.g. `npm run quiz 4.2` |

## Layout

```
data/            champions.json, traits.json (+ augments, wisps for phase 2)
lib/data/        loading, normalizing, the trait description parser, slugs
lib/cards/       card templates and the 12 study decks
lib/quiz/        question templates, distractor strategies, grading, session
components/      the design system: hex tiles, card blocks, runners, chrome
app/             the two sections: Study and Test
```

Study and Test share the data layer and nothing else — Study never grades, Test
never shows an ungraded card.

The look comes from a Claude Design canvas: bone and ink, Space Grotesk over
Karla, and one signature element — cost and trait breakpoints both live in a
hexagon, so the two ladders read the same way at a glance. Colours and metals
are tokens in `app/globals.css`; `components/tiers.ts` maps a cost or a
breakpoint colour to its swatch.

A card template and a question template are both config objects: entity type,
faces or options, and a stable id scheme (`{entityType}:{slug}#{templateId}`).
Nothing in either engine knows what a champion is. Adding augments means
writing templates and registering them.

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

## Not in v1

Augments and Wisps (the data is in `data/`, phase 2), persistence of any kind,
stats, score history, spaced repetition, accounts, items, emblems, portals, and
champion portraits — `Champion.portrait` is a documented empty slot.
