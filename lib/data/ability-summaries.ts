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
 *   3. Order by class: every damage bullet, then every crowd-control bullet,
 *      then every utility bullet. Anything else may sit where it reads best.
 *      An ability that deals damage leads with damage.
 *   4. Openers are fixed, so the classes are machine-checkable:
 *        damage   "Deals ..."
 *        control  "Stuns / Taunts / Knocks up / Sleeps / Charms / Disarms ..."
 *        utility  "Slows / Shreds / Wounds / Burns / Sunders / Reduces /
 *                  Ignites / Mana Reaves / Poisons ..."
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
  kobuko: ["Deals magic damage on the next attack", "Heals over time"],
  leona: [
    "Deals magic damage to the target",
    "Stuns them",
    "Passive: decaying Armor and Magic Resist at combat start",
  ],
  ornn: [
    "Deals magic damage in a cone",
    "Shields self",
    "Quest: stores damage blocked as Forge Power, doubled at 3-star",
    "Grants an Artifact Anvil at the Forge Power threshold",
  ],
  pebbles: [
    "Deals magic damage each second while channelling",
    "Reduces their Magic Resist",
    "Drains its own Mana while channelling",
    "Teal Buff: Mana Regen the longer it channels",
  ],
  rakan: ["Shields self", "Grants the highest-damage ally decaying Attack Speed"],
  "rek-sai": [
    "Deals magic damage to adjacent enemies",
    "Stuns them",
    "Passive: heals each second, tripled after a cast",
  ],
  varus: [
    "Deals physical damage down a line",
    "Damage falls off with each enemy pierced",
    "Winds up before firing",
  ],
  veigar: [
    "Deals magic damage to the target",
    "More damage if they are below a Health threshold",
    "Permanent Ability Power on kill",
  ],
  xayah: [
    "Deals physical damage on the next few attacks",
    "Reduces Armor",
    "Gains Attack Speed for those attacks",
  ],
  yorick: [
    "Deals physical damage to the target",
    "Heals self",
    "Passive: spawns a Spirit Walker on death",
  ],

  // ---------------------------------------------------------------- 2-cost
  alistar: [
    "Deals magic damage to the target",
    "Stuns them",
    "Heals self",
    "Cleanses disables",
    "Heals the two lowest-Health allies",
  ],
  caitlyn: ["Deals physical damage", "Passive: every third attack becomes a Headshot"],
  elise: [
    "Deals bonus magic damage on attacks in Spider Form",
    "Transforms into a spider, gaining max Health",
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
    "Deals bonus magic damage on attacks",
    "Deals magic damage with waves to every other unit hit",
    "Shreds enemies hit (reduces Magic Resist)",
    "Passive only, with no mana bar",
    "Ascends by star level, stacking four bonuses",
    "Gains infinite range at the last ascension",
  ],
  leblanc: [
    "Deals magic damage to the target",
    "Deals magic damage to adjacent enemies",
    "Passive: chance to copy an ally after combat, rising with takedowns",
  ],
  murkwolf: [
    "Deals physical damage to the lowest-Health enemy in range",
    "Deals bonus physical damage on the next attacks",
    "Grey Buff: Precision and Crit Chance, more when hurt",
  ],
  scuttlecrab: [
    "Deals physical damage to all adjacent enemies",
    "Passive: attacks become that dance",
    "Gains Durability while burrowed",
    "Heals over that duration",
    "Green Buff: heals allies who drop low",
  ],
  sejuani: [
    "Deals magic damage in a cone",
    "Deals magic damage in a line",
    "Shields self",
  ],
  shen: [
    "Deals bonus magic damage on its next attack and the ally's",
    "Shields self and a nearby damaged ally",
    "Both gain Attack Speed",
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
    "Deals physical damage to the target",
    "Deals physical damage to nearby enemies as the orb splits",
    "Dashes before launching it",
  ],

  // ---------------------------------------------------------------- 3-cost
  azir: [
    "Deals magic damage per soldier attack",
    "Summons soldiers for the next few attacks",
    "Gains Attack Speed",
  ],
  cassiopeia: [
    "Deals magic damage over time",
    "Poisons the target and the nearest unpoisoned enemy",
    "Poisons stack",
  ],
  diana: ["Deals magic damage to the closest enemies", "Shields self"],
  fiddlesticks: [
    "Deals magic damage to the nearest enemies over time",
    "Reduces their Magic Resist",
    "Heals for the drain",
  ],
  hecarim: [
    "Deals magic damage to the nearest enemies",
    "Stuns them",
    "Gains Armor and Magic Resist for 3 seconds",
    "Heals over that duration",
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
    "Deals damage rolling into the target",
    "Gains max Health first",
    "Passive: splits into two Kruglettes on death",
    "Slate Buff: shields allies on death",
  ],
  "master-yi": [
    "Deals bonus damage on Double Strikes (Adaptor)",
    "Heals from them in that branch",
    "Passive: every third attack is a Double Strike that hits twice",
    "Adaptor: stacks Attack Speed instead",
    "Gains movement speed on takedown",
  ],
  rammus: [
    "Deals physical damage when the shield breaks",
    "Taunts nearby enemies onto itself",
    "Gains Shield, Armor and Magic Resist",
  ],
  raptor: [
    "Deals physical damage with each Tinybeak attack",
    "Summons 4 untargetable Tinybeaks that copy its attacks",
    "Orange Buff: physical damage reduces enemy Armor",
  ],
  rengar: [
    "Deals physical damage to the lowest-Health enemy in range",
    "Heals based on their missing Health",
  ],
  tristana: [
    "Deals physical damage split within 2 hexes when the charge explodes",
    "Damage grows with attacks made while it ticks",
    "Gains infinite range and Attack Speed while it ticks",
    "The charge jumps to a new target if the carrier dies",
  ],
  vi: [
    "Heals self",
    "Gains Attack Speed and Durability",
    "Becomes immune to crowd control",
    "Passive: heals on attack",
  ],

  // ---------------------------------------------------------------- 4-cost
  ahri: [
    "Deals magic damage in a hex radius",
    "Damage falls off away from the epicentre",
    "Targets the most-surrounded enemy in range",
  ],
  amumu: [
    "Deals magic damage in an area",
    "Deals magic damage to adjacent enemies each second",
    "Stuns enemies hit",
    "Longer stun if the target is Burning",
    "Passive: heals each second",
  ],
  "ancient-sentinel": [
    "Deals magic damage along the fissure",
    "Knocks up enemies hit",
    "Mana Reaves them (raises their next cast's cost)",
    "Shields self",
    "Blue Buff: allies gain Mana Regen on each cast",
  ],
  aphelios: [
    "Deals physical damage swiping the target repeatedly",
    "Deals physical damage in a blast split within 2 Hexes",
    "Swipe damage scales with the target's max Health",
  ],
  brambleback: [
    "Deals physical damage on the leap to a new target",
    "Passive: leaps whenever the target dies",
    "Gains Attack Damage and ignores Armor",
    "Red Buff: attacks Burn and heal it",
  ],
  ezreal: [
    "Deals physical damage to the target",
    "Deals physical damage with a piercing blast every 5th cast",
    "Blast damage falls off per enemy pierced",
    "Gains Attack Speed, which the blast spends",
    "Blinks away from the target",
  ],
  lillia: [
    "Deals magic damage to nearby enemies",
    "Deals bonus max-Health magic damage when they wake",
    "Sleeps them",
    "Heals self",
  ],
  malphite: [
    "Deals magic damage when the shield breaks",
    "Shields self and becomes petrified",
  ],
  morgana: [
    "Deals magic damage to nearby enemies",
    "Deals magic damage per second in the withering zone",
    "Curses enemies hit",
    "Cursed enemies take more damage per curse",
    "Passive: Omnivamp",
  ],
  nidalee: [
    "Deals magic damage with javelins on the next attacks",
    "Deals magic damage to the furthest, least-itemised enemy on the 3rd",
    "Gains Attack Speed for those attacks",
    "Adaptor: becomes a melee cougar instead",
  ],
  sett: [
    "Deals physical damage in a large cone",
    "Heals rapidly while winding up",
    "Passive: 100 mana the first time it drops low each combat",
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
    "Deals magic damage with each plant attack",
    "Spawns plants around the battlefield",
  ],

  // ---------------------------------------------------------------- 5-cost
  alune: [
    "Deals magic damage split among the nearest enemies",
    "Deals magic damage split across the whole board at full moon",
  ],
  ashe: [
    "Deals physical damage down the longest line of enemies",
    "Deals max-Health physical damage per second inside the rift",
    "Slows enemies in the rift (reduces Attack Speed)",
    "Arrow damage falls off per enemy hit",
  ],
  draven: [
    "Deals physical damage with two axes to the most-bled enemy",
    "Deals physical damage over time with bleeds",
    "Consumes their bleeds, dealing the remainder instantly",
    "Passive: attacks hit random enemies in range",
    "Chance to hit harder and bleed more instead",
  ],
  gnar: [
    "Deals physical damage to enemies in the area",
    "Stuns them",
    "Reduces their Armor and Magic Resist",
    "Passive: builds Rage over time and on attack",
    "Transforms into Mega Gnar, gaining Health",
    "As Mega: throws the target at the farthest enemy",
  ],
  ivern: [
    "Deals magic damage to enemies adjacent to shielded allies",
    "Shields allies",
    "Grants them Damage Amp",
    "Passive: those shields can critically strike with Precision",
    "Grants stacking Attack Speed after enough casts",
  ],
  kennen: [
    "Deals magic damage rushing through a group",
    "Deals magic damage over time with the firestorm",
    "Shields self",
    "Gains Ability Power per Burning enemy while charging",
  ],
  lux: [
    "Deals magic damage to the largest group of enemies",
    "Damage falls off per enemy hit",
    "Passive: allies sharing a trait gain mana on each cast",
    "Fae Bonus: heals the lowest-Health ally for part of the damage",
  ],
  maokai: [
    "Deals magic damage to the target",
    "Deals magic damage with each sapling",
    "Heals, scaling with missing Health",
    "Passive: saplings jump out as damage is blocked, and on death",
  ],
  taric: [
    "Deals bonus magic damage on its next attacks and its pair's",
    "Heals",
    "Passive: the first time it or its pair drops low, shields nearby allies",
  ],
  "the-elder-dragon": [
    "Deals physical damage splashing onto enemies adjacent to the target",
    "Deals max-Health physical damage per second while Ignited",
    "Deals physical damage spewing fire in a line on later casts",
    "Stuns every enemy on landing",
    "Ignites them",
    "Becomes untargetable and gains Omnivamp while airborne",
    "Buff: executes enemies below a Health threshold",
  ],
};
