---
name: ability-summaries
description: Write or revise the hand-written bullet summaries of a champion's ability in lib/data/ability-summaries.ts. Use when adding a champion, when a summary reads badly or is wrong, when a new set lands, or when extending the same treatment to augments.
---

# Writing ability summaries

`lib/data/ability-summaries.ts` holds one to seven bullets per champion. They
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

2. **One action, one bullet.** Do not fold two things into one line because
   they happen in the same sentence. Alistar's roar heals, cleanses disables,
   heals two allies, deals damage and stuns — that is five bullets. One to
   seven per champion.

3. **Keep the ability's own order.** The paragraph tells a sequence — wind up,
   fire, fall off — and the bullets follow it. Do not group the damage
   together or float the crowd control up. What makes the important parts
   findable is colour, not a reshuffle.

4. **Use the house vocabulary**, because `lib/cards/highlight.ts` finds the
   mechanic by matching it and colours it in place:

   | Class | Colour | Phrases it matches |
   |---|---|---|
   | damage | orange / purple | `physical damage`, `magic damage` |
   | control | yellow | `Stuns`, `Taunts`, `Knocks up`, `Sleeps`, `Charms`, `Disarms`, `crowd control` |
   | utility | blue | `Slows`, `Shreds`, `Wounds`, `Burns`/`Burning`, `Sunders`, `Ignites`/`Ignited`, `Mana Reaves`, `Poisons`, `Reduces … Armor`/`Magic Resist` |

   A bullet that names damage in words outside this list renders flat grey, and
   a test catches it. If a genuinely new mechanic needs a colour, add the
   pattern to `highlight.ts` rather than writing around it.

5. **Use a keyword only where the source uses it.** The glossary words are
   capitalised game terms with specific meanings. Xayah's source says "reduce
   Armor by", so the bullet says "Reduces Armor" — not "Sunders". Kayle's says
   "Shred" with a glossary line, so hers says "Shreds enemies hit (reduces
   Magic Resist)". Gloss the keyword in parentheses the first time it does
   real work: Wound, Burn, Shred, Sunder, Slow, Mana Reave.

6. **Short phrases**, at most 88 characters, no trailing period, and the whole
   summary shorter than the paragraph it replaces. If it is not shorter, it is
   a transcription.

7. **Lead with the verb**, third person. "Deals physical damage to the target",
   never "The champion deals physical damage to the target".

## Worked examples

Karma — source: *"Tether the current target, dealing magic damage over
seconds. Then release a burst of power around them, dealing magic damage to all
enemies in a Hex radius and% Slowing them for seconds."*

```
"Deals magic damage over time to the tethered target",
"Deals magic damage in a Hex radius",
"Slows enemies hit (reduces Attack Speed)",
```

Two damage bullets because there are two damage events, then the slow — the
order the source tells them in. The tether is delivery, not a separate action,
so it rides along in the first bullet rather than taking a line of its own.

Alistar — source: *"Roar, restoring Health, cleansing disables, and healing the
two lowest percent Health allies for. Then slam the current target, dealing
magic damage and Stunning them for seconds."*

```
"Heals self",
"Cleanses disables",
"Heals the two lowest-Health allies",
"Deals magic damage to the target",
"Stuns them",
```

Five actions, five bullets, in the order the roar performs them. On the card
the damage reads orange and the stun yellow, so they are findable without
having been moved.

Bad, for contrast:

```
"Gains a shield for 4 seconds"          // 4 is not in the source — invented
"Rakan shields himself"                 // names the champion; lead with the verb
"Heals self and cleanses disables"      // two actions in one bullet
"Deals fire damage to the target"       // not a house phrase; renders flat grey
```

## Conventions worth matching

- **Passive / Active:** prefix the bullet when the source does — `"Passive:
  heals on attack"`. Readers scan for it, and the source states passives
  first, so they generally lead.
- **Adaptor:** these abilities branch on AD versus AP. Give the branch its own
  bullet: `"Adaptor: heavily slows the target"`.
- **Riftbeast buffs** (Scarlet, Purple, Grey, Teal, Green, Slate, Orange, Red,
  Blue) get their own bullet, named: `"Grey Buff: Precision and Crit Chance,
  more when hurt"`.
- **Kayle has no mana bar.** Say so — `"Passive only, with no mana bar"`.
- **Delivery is not an action.** Tethering, leaping, blinking and dashing ride
  along with the damage they deliver, unless the movement is the point.
- The champion's own name is allowed where it is genuinely the mechanic's name
  (Krug's "Kruglettes"). `redactedSummary` masks it for any reverse question.

## Workflow

For one champion:

1. Read the source text — `npm run inspect` prints the normalized version, or
   read `data/champions.json` directly.
2. List the actions before writing any prose. That list is the bullet count.
3. Keep them in the order the ability performs them.
4. Edit the entry in `lib/data/ability-summaries.ts`, keyed by slug.
5. `npm test` — every rule above is an assertion in
   `lib/data/ability-summaries.test.ts`, run against all 65 champions.
6. `npm run cards` prints the card the bullets land on, so you can see whether
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
