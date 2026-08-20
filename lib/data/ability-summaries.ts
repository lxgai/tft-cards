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
 *   2. Two to five bullets, each a short phrase — no trailing period.
 *   3. Say the mechanic, not the flavour: damage type, crowd control, the
 *      condition that changes the outcome.
 *   4. Every champion has an entry.
 *
 * To write or revise one, use the `ability-summaries` skill in .claude/skills.
 */

export const ABILITY_SUMMARIES: Record<string, string[]> = {
  // ---------------------------------------------------------------- 1-cost
  akali: [
    "Physical damage to the target",
    "More damage if the target is Burning",
    "Adaptor: recasts if it kills",
  ],
  camille: ["Physical damage to the target", "Shields self"],
  cinderling: [
    "Five leaves converge on the target for physical damage",
    "Applies Wound and Burn",
    "Scarlet Buff: stacking Attack Damage each cast",
  ],
  karma: [
    "Tethers the target for magic damage over time",
    "Then bursts for magic damage in a Hex radius",
    "Slows enemies hit, reducing their Attack Speed",
  ],
  kobuko: ["Heals over time", "Next attack becomes a bash for magic damage"],
  leona: [
    "Passive: decaying Armor and Magic Resist at combat start",
    "Active: magic damage to the target",
    "Stuns it",
  ],
  ornn: [
    "Shields self and deals magic damage in a cone",
    "Quest: stores damage blocked as Forge Power, doubled at 3-star",
    "Hitting the threshold grants an Artifact Anvil",
  ],
  pebbles: [
    "Channels a laser, draining its own Mana",
    "Magic damage each second and shreds Magic Resist",
    "Teal Buff: Mana Regen the longer it channels",
  ],
  rakan: ["Shields self", "Grants the highest-damage ally decaying Attack Speed"],
  "rek-sai": [
    "Passive: heals each second, tripled after a cast",
    "Active: magic damage to adjacent enemies",
    "Stuns them",
  ],
  varus: [
    "Winds up, then fires a piercing arrow",
    "Physical damage down the line",
    "Damage falls off with each enemy pierced",
  ],
  veigar: [
    "Magic damage to the target",
    "More damage if they are below a Health threshold",
    "Permanent Ability Power on kill",
  ],
  xayah: [
    "Attack Speed for the next few attacks",
    "Those attacks become feathers dealing physical damage",
    "Shreds Armor",
  ],
  yorick: [
    "Passive: spawns a Spirit Walker on death",
    "Active: heals self",
    "Physical damage to the target",
  ],

  // ---------------------------------------------------------------- 2-cost
  alistar: [
    "Heals self and cleanses disables",
    "Also heals the two lowest-Health allies",
    "Magic damage to the target and stuns it",
  ],
  caitlyn: [
    "Passive: every third attack becomes a Headshot",
    "The Headshot deals physical damage",
  ],
  elise: [
    "Transforms into a spider, gaining max Health",
    "Spider attacks deal bonus magic damage and heal",
    "Later casts grant decaying Attack Speed",
  ],
  gromp: [
    "Bubble explodes on the first enemy for magic damage",
    "Lingering magic damage in a 1 hex radius",
    "Adaptor: heavily slows the target",
    "Purple Buff: stacking Ability Power over time",
  ],
  kayle: [
    "Passive only, with no mana bar",
    "Ascends by star level, stacking four bonuses",
    "Bonus magic damage, then Shred, then waves, then infinite range",
  ],
  leblanc: [
    "Passive: chance to copy an ally after combat, rising with takedowns",
    "Active: magic damage to the target and adjacent enemies",
  ],
  murkwolf: [
    "Leaps to the lowest-Health enemy in range for physical damage",
    "Next attacks deal bonus physical damage",
    "Grey Buff: Precision and Crit Chance, more when hurt",
  ],
  scuttlecrab: [
    "Passive: attacks hit every adjacent enemy",
    "Active: burrows for Durability and healing",
    "Green Buff: heals allies who drop low",
  ],
  sejuani: [
    "Shields self",
    "Cleaves a cone for magic damage",
    "Strikes a line for magic damage",
  ],
  shen: [
    "Shields self and a nearby damaged ally",
    "Both gain Attack Speed on their next attacks",
    "Those attacks deal bonus magic damage",
  ],
  teemo: [
    "Throws 2 mushroom clusters for magic damage",
    "Then a giant mushroom at the target",
    "Chance to forage: a reroll, Tactician Health, or XP",
  ],
  warwick: [
    "Physical damage to the target",
    "Heals for part of the damage dealt",
    "Attack Speed for the rest of combat",
  ],
  yunara: [
    "Dashes, then launches an orb",
    "Physical damage to the target",
    "The orb splits onto nearby enemies",
  ],

  // ---------------------------------------------------------------- 3-cost
  azir: [
    "Gains Attack Speed and summons soldiers",
    "Attacks become commands for the next few attacks",
    "Each soldier deals magic damage per attack",
  ],
  cassiopeia: [
    "Poisons the target and the nearest unpoisoned enemy",
    "Magic damage over time",
    "Poisons stack",
  ],
  diana: ["Shields self", "Sends a moonlight orb at the closest enemies", "Magic damage"],
  fiddlesticks: [
    "Shreds Magic Resist on the nearest enemies",
    "Drains them over time for magic damage",
    "Heals for the drain",
  ],
  hecarim: [
    "Armor, Magic Resist and healing for 3 seconds",
    "Spectral riders hit the nearest enemies for magic damage",
    "Stuns them",
  ],
  "kha-zix": [
    "Leaps to the farthest enemy in range",
    "Magic damage",
    "More damage and mana back if the target is isolated",
  ],
  "kog-maw": [
    "Acid hits the two nearest enemies for physical damage",
    "Hurt enemies take more",
    "Adaptor: damages over time instead",
  ],
  krug: [
    "Passive: splits into two Kruglettes on death",
    "Active: gains max Health, then rolls into the target",
    "Slate Buff: shields allies on death",
  ],
  "master-yi": [
    "Passive: every third attack hits twice",
    "Movement speed on takedown",
    "Adaptor: Double Strikes stack Attack Speed, or deal bonus damage and heal",
  ],
  rammus: [
    "Taunts nearby enemies onto itself",
    "Shield plus Armor and Magic Resist",
    "Physical damage when the shield breaks",
  ],
  raptor: [
    "Summons 4 untargetable Tinybeaks",
    "They copy its attacks for physical damage",
    "Orange Buff: physical damage shreds Armor",
  ],
  rengar: [
    "Jumps to the lowest-Health enemy in range",
    "Physical damage",
    "Heals based on their missing Health",
  ],
  tristana: [
    "Charges the target, gaining infinite range and Attack Speed",
    "The charge explodes for physical damage split within 2 hexes",
    "Damage grows with attacks made while it ticks",
    "The charge jumps to a new target if the carrier dies",
  ],
  vi: [
    "Passive: heals on attack",
    "Active: heals, then gains Attack Speed and Durability",
    "Immune to crowd control for the duration",
  ],

  // ---------------------------------------------------------------- 4-cost
  ahri: [
    "Bombs the most-surrounded enemy in range",
    "Magic damage in a hex radius",
    "Damage falls off away from the centre",
  ],
  amumu: [
    "Passive: heals and damages adjacent enemies each second",
    "Active: magic damage in an area, then a stun",
    "Longer stun if the target is Burning",
  ],
  "ancient-sentinel": [
    "Shields self, then fissures toward the most enemies",
    "Knocks up and deals magic damage",
    "Mana Reaves those hit",
    "Blue Buff: allies gain Mana Regen on each cast",
  ],
  aphelios: [
    "Swipes the target repeatedly for physical damage",
    "Damage scales with the target's max Health",
    "Finishes with a blast split within 2 Hexes",
  ],
  brambleback: [
    "Passive: leaps to the next target on a kill",
    "Active: Attack Damage, and ignores Armor",
    "Red Buff: attacks Burn and heal it",
  ],
  ezreal: [
    "Blinks away, physical damage, gains Attack Speed",
    "Every 5th cast spends the stacks on a piercing blast",
    "Blast damage falls off per enemy pierced",
  ],
  lillia: [
    "Heals, then sends butterflies at nearby enemies",
    "Magic damage and Sleep",
    "Waking them deals bonus max-Health magic damage",
  ],
  malphite: [
    "Shields self and petrifies",
    "A wave of magic damage when the shield breaks",
  ],
  morgana: [
    "Passive: Omnivamp",
    "Blast deals magic damage and curses nearby enemies",
    "Leaves a withering zone ticking magic damage",
    "Curses stack into more damage taken",
  ],
  nidalee: [
    "Attacks become javelins dealing magic damage",
    "The 3rd javelin hits the furthest, least-itemised enemy",
    "Adaptor: becomes a melee cougar instead",
  ],
  sett: [
    "Passive: 100 mana the first time it drops low each combat",
    "Active: winds up, healing rapidly",
    "Physical damage in a large cone",
  ],
  sivir: [
    "Crossblade hits the target for physical damage",
    "Bounces between nearby enemies",
    "A kill adds another bounce",
  ],
  soraka: [
    "Calls a star on the target for magic damage",
    "Extra stars if a star has already hit them",
  ],
  zyra: [
    "Spawns plants around the battlefield",
    "They attack the nearest enemy for magic damage",
  ],

  // ---------------------------------------------------------------- 5-cost
  alune: [
    "Moonshards split magic damage among the nearest enemies",
    "At full moon, crashes it for magic damage split across the whole board",
  ],
  ashe: [
    "Arrow pierces the longest line for physical damage",
    "Damage falls off per enemy hit",
    "Leaves a rift dealing max-Health physical damage per second",
    "The rift slows enemies inside it",
  ],
  draven: [
    "Passive: attacks hit random enemies and apply bleeds",
    "Chance for bonus damage and extra bleeds",
    "Active: two axes at the most-bled enemy",
    "Consumes their bleeds, dealing the remaining damage instantly",
  ],
  gnar: [
    "Builds Rage over time and on attack",
    "Transforms and leaps into the largest group",
    "Physical damage, shreds Armor and Magic Resist, stuns",
    "As Mega: throws the target at the farthest enemy",
  ],
  ivern: [
    "Passive: these shields can critically strike with Precision",
    "Shields allies and grants Damage Amp",
    "Magic damage to enemies adjacent to them",
    "After enough casts, also grants stacking Attack Speed",
  ],
  kennen: [
    "Charges up, gaining Ability Power per Burning enemy",
    "Shields, then rushes a group for magic damage",
    "Leaves a firestorm splitting magic damage over time",
  ],
  lux: [
    "Passive: allies sharing a trait gain mana on each cast",
    "Laser at the largest group for magic damage",
    "Damage falls off per enemy hit",
    "Fae Bonus: heals the lowest-Health ally for part of the damage",
  ],
  maokai: [
    "Passive: saplings jump out as damage is blocked, and on death",
    "Saplings deal magic damage",
    "Active: magic damage to the target, plus a heal scaling with missing Health",
  ],
  taric: [
    "Passive: the first time it or its paired ally drops low, shields nearby allies",
    "Active: heals",
    "It and its pair deal bonus magic damage on their next attacks",
  ],
  "the-elder-dragon": [
    "Passive: attacks splash onto enemies adjacent to the target",
    "Flies up untargetable with Omnivamp, then lands stunning and Igniting everyone",
    "Ignite burns for max-Health physical damage per second",
    "Buff: executes enemies below a Health threshold",
  ],
};
