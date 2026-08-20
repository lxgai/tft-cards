---
name: ability-summaries
description: Write or revise the hand-written bullet summaries of a champion's ability in lib/data/ability-summaries.ts. Use when adding a champion, when a summary reads badly or is wrong, when a new set lands, or when extending the same treatment to augments.
---

# Writing ability summaries

`lib/data/ability-summaries.ts` holds two to five bullets per champion. They
are the **only authored content in the app** — everything else is derived from
`data/`. They exist because the source ability text is a paragraph with its
numbers stripped out, which is hard to rehearse from; bullets are what you
actually recall against.

Because they are authored, they are the one place the app could tell a lie.
The rules below exist to make that impossible, and `npm test` enforces them.

## The rules

1. **Never introduce a number the source does not contain.** Every digit in a
   bullet must appear in that champion's `ability` text. Sett's "100 mana" is
   fine — the source says 100. Writing "60 mana" or "300 damage" is not, and
   the test will fail. If the source stripped a value, describe the shape of
   the effect instead: "more damage if they are below a Health threshold".
2. **Two to five bullets**, each at most 88 characters, trimmed, no trailing
   period. Most abilities want three.
3. **Mechanic, not flavour.** Damage type (magic / physical / true), crowd
   control, the condition that changes the outcome, the trait-buff rider. Drop
   the scenery.
4. **Shorter than the source.** If the bullets are not shorter than the
   paragraph they replace, they are a transcription, not a summary.
5. **Every champion has an entry**, keyed by slug (`the-elder-dragon`,
   `kha-zix`, `master-yi`).
6. **Lead with the verb.** "Physical damage to the target", not "The champion
   deals physical damage to the target".

## Worked examples

Karma — source: *"Tether the current target, dealing magic damage over
seconds. Then release a burst of power around them, dealing magic damage to all
enemies in a Hex radius and% Slowing them for seconds."*

```
"Tethers the target for magic damage over time",
"Then bursts for magic damage in a Hex radius",
"Slows enemies hit, reducing their Attack Speed",
```

Three facts worth recalling: the damage type, that it hits an area, and that it
slows. The keyword glossary at the end of the source ("Slow: Reduce Attack
Speed") is folded into the bullet rather than given its own line.

Rakan — source: *"Gain Shield for seconds. Then grant the ally who has dealt
the most damage this combat decaying Attack Speed for seconds."*

```
"Shields self",
"Grants the highest-damage ally decaying Attack Speed",
```

Two bullets, because there are two things it does.

Bad, for contrast:

```
"Gains a shield for 4 seconds"        // 4 is not in the source — invented
"Rakan shields himself"               // names the champion; lead with the verb
"Grant the ally who has dealt the most damage this combat decaying Attack Speed for a duration"
                                      // a transcription, and over 88 chars
```

## Conventions worth matching

- **Passive / Active:** prefix the bullet when the source does — `"Passive:
  heals on attack"`. Readers scan for it.
- **Adaptor:** these abilities branch on AD versus AP. Write the shared effect
  as normal bullets and give the branch its own: `"Adaptor: heavily slows the
  target"`.
- **Riftbeast buffs** (Scarlet, Purple, Grey, Teal, Green, Slate, Orange, Red,
  Blue) get their own bullet, named: `"Grey Buff: Precision and Crit Chance,
  more when hurt"`.
- **Kayle has no mana bar.** Say so — `"Passive only, with no mana bar"`.
- The champion's own name is allowed where it is genuinely the mechanic's name
  (Krug's "Kruglettes"). `redactedSummary` masks it for any reverse question.

## Workflow

For one champion:

1. Read the source text — `npm run inspect` prints the normalized version, or
   read `data/champions.json` directly.
2. Edit the entry in `lib/data/ability-summaries.ts`, keyed by slug.
3. `npm test` — the rules above are all assertions in
   `lib/data/ability-summaries.test.ts`.
4. `npm run cards` prints the card the bullets land on, so you can see whether
   it reads.

For a whole new set, work in cost order and do a tier at a time; the 5-costs
have the most going on and are worth the most care.

## Where the bullets show up

Two card backs: `champ-ability` (the "Abilities by Cost" decks) and
`champ-profile` (every "Champions by Trait" deck). The bullets lead and the
source paragraph sits underneath as the reference, so a summary that drops
something important is visibly wrong rather than quietly wrong.

They are **not** used in the quiz. Unit 5.2 offers full ability text as
options, which is long on a phone — swapping in `redactedSummary` would be an
improvement, and the redaction already exists for it.
