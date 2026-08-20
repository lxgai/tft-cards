/**
 * Hand-written bullet summaries of every champion's ability.
 *
 * These are AUTHORED, not scraped — the only content in the app that is not
 * derived from data/. They exist because the source ability text is a
 * paragraph with its numbers stripped out, which is hard to recall from; a
 * bullet list is what you actually rehearse.
 *
 * Rules, enforced by lib/data/ability-summaries.test.ts:
 *
 *   1. Never introduce a number the source does not contain. Every digit in a
 *      bullet must appear in that champion's ability text. This is the same
 *      no-invented-values rule the rest of the app follows, and it is the
 *      reason these can be trusted.
 *   2. One action, one bullet. Alistar's roar heals, cleanses, heals allies,
 *      damages and stuns — that is five bullets, not two. One to seven.
 *   3. Keep the ability's own order. The paragraph tells a sequence and the
 *      bullets follow it; what makes the important parts findable is the
 *      colour, not a reshuffle. See lib/cards/highlight.ts.
 *   4. House vocabulary, so the highlighter can find the mechanic:
 *        damage   "Deals physical damage …" / "Deals magic damage …"
 *        control  "Stuns / Taunts / Knocks up / Sleeps / Charms / Disarms …"
 *        utility  "Slows / Shreds / Wounds / Burns / Sunders / Reduces …"
 *      Use a keyword only where the source uses it; where the source says
 *      "reduce their Magic Resist" rather than "Shred", so do we.
 *   5. Short phrases, no trailing period, and shorter than the source.
 *
 * To write or revise one, use the `ability-summaries` skill in .claude/skills.
 */

export const ABILITY_SUMMARIES: Record<string, string[]> = {
  // ---------------------------------------------------------------- 1-cost
  akali: [
    "Deals physical damage to the target",
    "More damage if the target is Burning",
    "Adaptor: recasts if it kills",
  ],
  camille: ["Deals physical damage to the target", "Shields self"],
  cinderling: [
    "Deals physical damage to the target with five converging leaves",
    "Wounds them (reduces healing received)",
    "Burns them (true damage per second)",
    "Scarlet Buff: stacking Attack Damage each cast",
  ],
  karma: [
    "Deals magic damage over time to the tethered target",
    "Deals magic damage in a Hex radius",
    "Slows enemies hit (reduces Attack Speed)",
  ],
  kobuko: ["Heals over time", "Deals magic damage on the next attack"],
  leona: [
    "Passive: decaying Armor and Magic Resist at combat start",
    "Deals magic damage to the target",
    "Stuns them",
  ],
  ornn: [
    "Shields self",
    "Deals magic damage in a cone",
    "Quest: stores damage blocked as Forge Power, doubled at 3-star",
    "Grants an Artifact Anvil at the Forge Power threshold",
  ],
  pebbles: [
    "Drains its own Mana while channelling",
    "Deals magic damage each second",
    "Reduces their Magic Resist",
    "Teal Buff: Mana Regen the longer it channels",
  ],
  rakan: ["Shields self", "Grants the highest-damage ally decaying Attack Speed"],
  "rek-sai": [
    "Passive: heals each second, tripled after a cast",
    "Stuns adjacent enemies",
    "Deals magic damage to them",
  ],
  varus: [
    "Winds up, then fires a piercing arrow",
    "Deals physical damage down the line",
    "Damage falls off with each enemy pierced",
  ],
  veigar: [
    "Deals magic damage to the target",
    "More damage if they are below a Health threshold",
    "Permanent Ability Power on kill",
  ],
  xayah: [
    "Gains Attack Speed for the next attacks",
    "Deals physical damage with feathers on those attacks",
    "Reduces Armor",
  ],
  yorick: [
    "Passive: spawns a Spirit Walker on death",
    "Heals self",
    "Deals physical damage to the target",
  ],

  // ---------------------------------------------------------------- 2-cost
  alistar: [
    "Heals self",
    "Cleanses disables",
    "Heals the two lowest-Health allies",
    "Deals magic damage to the target",
    "Stuns them",
  ],
  caitlyn: ["Passive: every third attack becomes a Headshot", "Deals physical damage"],
  elise: [
    "Transforms into a spider, gaining max Health",
    "Deals bonus magic damage on attacks in Spider Form",
    "Heals on those attacks",
    "Later casts grant decaying Attack Speed",
  ],
  gromp: [
    "Deals magic damage to the first enemy hit",
    "Deals magic damage over time in a 1 hex radius",
    "Adaptor: heavily slows the target",
    "Purple Buff: stacking Ability Power over time",
  ],
  kayle: [
    "Passive only, with no mana bar",
    "Ascends by star level, stacking four bonuses",
    "Deals bonus magic damage on attacks",
    "Shreds enemies hit (reduces Magic Resist)",
    "Deals magic damage with waves to every other unit hit",
    "Gains infinite range at the last ascension",
  ],
  leblanc: [
    "Passive: chance to copy an ally after combat, rising with takedowns",
    "Deals magic damage to the target",
    "Deals magic damage to adjacent enemies",
  ],
  murkwolf: [
    "Deals physical damage to the lowest-Health enemy in range",
    "Deals bonus physical damage on the next attacks",
    "Grey Buff: Precision and Crit Chance, more when hurt",
  ],
  scuttlecrab: [
    "Passive: attacks become a dance",
    "Deals physical damage to all adjacent enemies",
    "Gains Durability while burrowed",
    "Heals over that duration",
    "Green Buff: heals allies who drop low",
  ],
  sejuani: [
    "Shields self",
    "Deals magic damage in a cone",
    "Deals magic damage in a line",
  ],
  shen: [
    "Shields self and a nearby damaged ally",
    "Both gain Attack Speed on their next attacks",
    "Deals bonus magic damage on those attacks",
  ],
  teemo: [
    "Deals magic damage to the nearest enemies with 2 mushroom clusters",
    "Deals magic damage to the target with a giant mushroom",
    "Chance to forage: a reroll, Tactician Health, or XP",
  ],
  warwick: [
    "Deals physical damage to the target",
    "Heals for part of the damage dealt",
    "Gains Attack Speed for the rest of combat",
  ],
  yunara: [
    "Dashes, then launches an orb",
    "Deals physical damage to the target",
    "Deals physical damage to nearby enemies as it splits",
  ],

  // ---------------------------------------------------------------- 3-cost
  azir: [
    "Gains Attack Speed",
    "Summons soldiers for the next few attacks",
    "Deals magic damage per soldier attack",
  ],
  cassiopeia: [
    "Poisons the target and the nearest unpoisoned enemy",
    "Deals magic damage over time",
    "Poisons stack",
  ],
  diana: ["Shields self", "Deals magic damage to the closest enemies"],
  fiddlesticks: [
    "Reduces the nearest enemies' Magic Resist",
    "Deals magic damage to them over time",
    "Heals for the drain",
  ],
  hecarim: [
    "Gains Armor and Magic Resist for 3 seconds",
    "Heals over that duration",
    "Deals magic damage to the nearest enemies",
    "Stuns them",
  ],
  "kha-zix": [
    "Deals magic damage to the farthest enemy in range",
    "More damage if they have no adjacent allies",
    "Refunds mana on an isolated target",
  ],
  "kog-maw": [
    "Deals physical damage to the two nearest enemies",
    "More damage to enemies below a Health threshold",
    "Adaptor: damages over time instead",
  ],
  krug: [
    "Passive: splits into two Kruglettes on death",
    "Gains max Health",
    "Deals damage rolling into the target",
    "Slate Buff: shields allies on death",
  ],
  "master-yi": [
    "Passive: every third attack is a Double Strike that hits twice",
    "Gains movement speed on takedown",
    "Adaptor: Double Strikes stack Attack Speed",
    "Adaptor: deals bonus damage and heals instead",
  ],
  rammus: [
    "Taunts nearby enemies onto itself",
    "Gains Shield, Armor and Magic Resist",
    "Deals physical damage when the shield breaks",
  ],
  raptor: [
    "Summons 4 untargetable Tinybeaks that copy its attacks",
    "Deals physical damage with each Tinybeak attack",
    "Orange Buff: physical damage reduces enemy Armor",
  ],
  rengar: [
    "Deals physical damage to the lowest-Health enemy in range",
    "Heals based on their missing Health",
  ],
  tristana: [
    "Gains infinite range and Attack Speed while the charge ticks",
    "Deals physical damage split within 2 hexes when it explodes",
    "Damage grows with attacks made while it ticks",
    "The charge jumps to a new target if the carrier dies",
  ],
  vi: [
    "Passive: heals on attack",
    "Heals self",
    "Gains Attack Speed and Durability",
    "Becomes immune to crowd control",
  ],

  // ---------------------------------------------------------------- 4-cost
  ahri: [
    "Targets the most-surrounded enemy in range",
    "Deals magic damage in a hex radius",
    "Damage falls off away from the epicentre",
  ],
  amumu: [
    "Passive: heals each second",
    "Deals magic damage to adjacent enemies each second",
    "Deals magic damage in an area",
    "Stuns enemies hit",
    "Longer stun if the target is Burning",
  ],
  "ancient-sentinel": [
    "Shields self",
    "Knocks up enemies in the fissure",
    "Deals magic damage to them",
    "Mana Reaves them (raises their next cast's cost)",
    "Blue Buff: allies gain Mana Regen on each cast",
  ],
  aphelios: [
    "Deals physical damage swiping the target repeatedly",
    "Swipe damage scales with the target's max Health",
    "Deals physical damage in a blast split within 2 Hexes",
  ],
  brambleback: [
    "Passive: leaps to the next target when one dies",
    "Deals physical damage on that leap",
    "Gains Attack Damage and ignores Armor",
    "Red Buff: attacks Burn and heal it",
  ],
  ezreal: [
    "Blinks away from the target",
    "Deals physical damage to them",
    "Gains Attack Speed",
    "Deals physical damage with a piercing blast every 5th cast",
    "Blast damage falls off per enemy pierced",
  ],
  lillia: [
    "Heals self",
    "Deals magic damage to nearby enemies",
    "Sleeps them",
    "Deals bonus max-Health magic damage when they wake",
  ],
  malphite: [
    "Shields self and becomes petrified",
    "Deals magic damage when the shield breaks",
  ],
  morgana: [
    "Passive: Omnivamp",
    "Deals magic damage to nearby enemies",
    "Curses them",
    "Deals magic damage per second in the withering zone",
    "Cursed enemies take more damage per curse",
  ],
  nidalee: [
    "Gains Attack Speed for the next attacks",
    "Deals magic damage with javelins",
    "Deals magic damage to the furthest, least-itemised enemy on the 3rd",
    "Adaptor: becomes a melee cougar instead",
  ],
  sett: [
    "Passive: 100 mana the first time it drops low each combat",
    "Heals rapidly while winding up",
    "Deals physical damage in a large cone",
  ],
  sivir: [
    "Deals physical damage to the target",
    "Deals physical damage on each bounce between nearby enemies",
    "A kill adds another bounce",
  ],
  soraka: [
    "Deals magic damage to the target",
    "Deals magic damage with each extra star",
    "Extra stars only if one has already fallen on them",
  ],
  zyra: [
    "Spawns plants around the battlefield",
    "Deals magic damage with each plant attack",
  ],

  // ---------------------------------------------------------------- 5-cost
  alune: [
    "Deals magic damage split among the nearest enemies",
    "Deals magic damage split across the whole board at full moon",
  ],
  ashe: [
    "Deals physical damage down the longest line of enemies",
    "Damage falls off per enemy hit",
    "Deals max-Health physical damage per second inside the rift",
    "Slows enemies in the rift (reduces Attack Speed)",
  ],
  draven: [
    "Passive: attacks hit random enemies in range",
    "Deals physical damage over time with bleeds",
    "Chance to hit harder and bleed more instead",
    "Deals physical damage with two axes to the most-bled enemy",
    "Consumes their bleeds, dealing the remainder instantly",
  ],
  gnar: [
    "Passive: builds Rage over time and on attack",
    "Transforms into Mega Gnar, gaining Health",
    "Deals physical damage to enemies in the area",
    "Reduces their Armor and Magic Resist",
    "Stuns them",
    "As Mega: throws the target at the farthest enemy",
  ],
  ivern: [
    "Passive: those shields can critically strike with Precision",
    "Shields allies",
    "Grants them Damage Amp",
    "Deals magic damage to enemies adjacent to them",
    "Grants stacking Attack Speed after enough casts",
  ],
  kennen: [
    "Gains Ability Power per Burning enemy while charging",
    "Shields self",
    "Deals magic damage rushing through a group",
    "Deals magic damage over time with the firestorm",
  ],
  lux: [
    "Passive: allies sharing a trait gain mana on each cast",
    "Deals magic damage to the largest group of enemies",
    "Damage falls off per enemy hit",
    "Fae Bonus: heals the lowest-Health ally for part of the damage",
  ],
  maokai: [
    "Passive: saplings jump out as damage is blocked, and on death",
    "Deals magic damage with each sapling",
    "Deals magic damage to the target",
    "Heals, scaling with missing Health",
  ],
  taric: [
    "Passive: the first time it or its pair drops low, shields nearby allies",
    "Heals",
    "Deals bonus magic damage on its next attacks and its pair's",
  ],
  "the-elder-dragon": [
    "Passive: attacks splash onto enemies adjacent to the target",
    "Becomes untargetable and gains Omnivamp while airborne",
    "Stuns every enemy on landing",
    "Ignites them",
    "Deals max-Health physical damage per second while Ignited",
    "Deals physical damage spewing fire in a line on later casts",
    "Buff: executes enemies below a Health threshold",
  ],
};
