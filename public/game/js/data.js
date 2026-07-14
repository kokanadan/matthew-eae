/* ==========================================================================
   NEON WULIN: CYBER RUMBLE — game data
   Elements, characters, enemies, waves. Pure data + pure helper functions.
   Loaded as a plain global script (no ES modules) so the game can be opened
   directly from disk (file://) with no server or build step.
   ========================================================================== */

(function (global) {
  "use strict";

  // ---- Element identifiers -------------------------------------------------
  var EL = {
    WATER: "water",
    WOOD: "wood",
    FIRE: "fire",
    EARTH: "earth",
    METAL: "metal",
    PHYSICAL: "physical"
  };

  var ELEMENT_COLOR = {
    water: "#33b5ff",
    wood: "#3ddc6a",
    fire: "#ff3b3b",
    earth: "#b5772f",
    metal: "#b9c2cc",
    physical: "#ffd23d"
  };

  var ELEMENT_LABEL = {
    water: "WATER",
    wood: "WOOD",
    fire: "FIRE",
    earth: "EARTH",
    metal: "METAL",
    physical: "PHYSICAL"
  };

  // "Overcoming" cycle: key is STRONG against value (deals 2x to it).
  var STRONG_AGAINST = {
    water: "fire",
    fire: "metal",
    metal: "wood",
    wood: "earth",
    earth: "water"
  };

  // "Generating" cycle: key NURTURES/boosts value (attacking value with key
  // deals neutral damage to value, but grants value's owner a boosted next
  // attack with a unique side effect).
  var NURTURES = {
    water: "wood",
    wood: "fire",
    fire: "earth",
    earth: "metal",
    metal: "water"
  };

  /**
   * Compute the elemental multiplier and whether a "boost" proc should be
   * granted to the defender. Physical is neutral to (and from) everything.
   * Returns { multiplier: number, boostProc: boolean, relation: string }
   */
  function getElementalOutcome(attackerElement, defenderElement) {
    if (attackerElement === EL.PHYSICAL || defenderElement === EL.PHYSICAL) {
      return { multiplier: 1, boostProc: false, relation: "neutral" };
    }
    if (STRONG_AGAINST[attackerElement] === defenderElement) {
      return { multiplier: 2, boostProc: false, relation: "strong" };
    }
    if (STRONG_AGAINST[defenderElement] === attackerElement) {
      return { multiplier: 0.5, boostProc: false, relation: "weak" };
    }
    if (NURTURES[attackerElement] === defenderElement) {
      return { multiplier: 1, boostProc: true, relation: "nurture" };
    }
    // Same element, or no defined relation (shouldn't happen with 5 elements).
    return { multiplier: 1, boostProc: false, relation: "neutral" };
  }

  // ---- Playable characters -------------------------------------------------
  // Body/hair proportions & accessory tags are consumed by engine.js to build
  // the stylized low-poly / cel-shaded model for each character.
  var CHARACTERS = [
    {
      id: "rinse",
      name: "RINSE",
      title: "Data-Tide Runner",
      element: EL.WATER,
      color: ELEMENT_COLOR.water,
      accent: "#dff7ff",
      maxHp: 145,
      atk: 24,
      def: 8,
      baseEvasion: 0.08,
      skillName: "Riptide Slash",
      boostName: "TIDAL SURGE",
      boostDesc: "Whole party's evasion soars for 3 turns.",
      build: { hair: "ponytailFin", visor: "narrow", limbs: "slim", accessory: "finBlades" }
    },
    {
      id: "bramble",
      name: "BRAMBLE",
      title: "Nanoflora Blade",
      element: EL.WOOD,
      color: ELEMENT_COLOR.wood,
      accent: "#eaffef",
      maxHp: 155,
      atk: 22,
      def: 9,
      baseEvasion: 0.06,
      skillName: "Vine Lash",
      boostName: "BLOOM PROTOCOL",
      boostDesc: "Healing circle mends the party each turn for 3 turns and saps enemy evasion.",
      build: { hair: "leafCrown", visor: "none", limbs: "slim", accessory: "vineWhip" }
    },
    {
      id: "blaze",
      name: "BLAZE",
      title: "Redline Arsonist",
      element: EL.FIRE,
      color: ELEMENT_COLOR.fire,
      accent: "#fff1df",
      maxHp: 130,
      atk: 28,
      def: 6,
      baseEvasion: 0.07,
      skillName: "Exhaust Flare",
      boostName: "MELTDOWN RUSH",
      boostDesc: "Sears the target with burn that worsens over 3 turns.",
      build: { hair: "mohawk", visor: "shard", limbs: "slim", accessory: "jetpack" }
    },
    {
      id: "slab",
      name: "SLAB",
      title: "Foundation Wrecker",
      element: EL.EARTH,
      color: ELEMENT_COLOR.earth,
      accent: "#ffe9c7",
      maxHp: 180,
      atk: 20,
      def: 13,
      baseEvasion: 0.03,
      skillName: "Bedrock Slam",
      boostName: "TREMOR PROTOCOL",
      boostDesc: "The whole party's attack is fortified for 2 turns.",
      build: { hair: "buzz", visor: "none", limbs: "bulky", accessory: "gauntlets" }
    },
    {
      id: "chrome",
      name: "CHROME",
      title: "Ghost-Alloy Reaper",
      element: EL.METAL,
      color: ELEMENT_COLOR.metal,
      accent: "#f2f6ff",
      maxHp: 148,
      atk: 25,
      def: 10,
      baseEvasion: 0.09,
      skillName: "Razor Wire Cross",
      boostName: "AEGIS PLATING",
      boostDesc: "The party shrugs off damage and resists status for a turn.",
      build: { hair: "sleekBob", visor: "band", limbs: "slim", accessory: "chromeBlade" }
    },
    {
      id: "jackpot",
      name: "JACKPOT",
      title: "Golden Trigger",
      element: EL.PHYSICAL,
      color: ELEMENT_COLOR.physical,
      accent: "#fff8e1",
      maxHp: 138,
      atk: 27,
      def: 7,
      baseEvasion: 0.08,
      critChance: 0.3,
      critMult: 2.0,
      skillName: "Lucky Shot",
      boostName: null,
      boostDesc: "Crits leave foes VULNERABLE — exposed to bonus damage for 2 hits.",
      build: { hair: "slickback", visor: "shades", limbs: "slim", accessory: "revolver" }
    }
  ];

  // ---- Enemy templates ------------------------------------------------------
  var ENEMY_TEMPLATES = {
    droneFire: { name: "SCRAP DRONE-F", element: EL.FIRE, maxHp: 70, atk: 13, def: 4, evasion: 0.05, kind: "drone" },
    droneWater: { name: "SCRAP DRONE-W", element: EL.WATER, maxHp: 70, atk: 13, def: 4, evasion: 0.05, kind: "drone" },
    droneEarth: { name: "SCRAP DRONE-E", element: EL.EARTH, maxHp: 78, atk: 12, def: 6, evasion: 0.03, kind: "drone" },
    enforcerWood: { name: "NEON ENFORCER", element: EL.WOOD, maxHp: 112, atk: 19, def: 8, evasion: 0.07, kind: "enforcer" },
    enforcerMetal: { name: "CHROME ENFORCER", element: EL.METAL, maxHp: 112, atk: 19, def: 9, evasion: 0.06, kind: "enforcer" },
    enforcerFire: { name: "BLAZE ENFORCER", element: EL.FIRE, maxHp: 108, atk: 21, def: 7, evasion: 0.06, kind: "enforcer" },
    boss: {
      name: "OVERSEER PRIME",
      element: EL.EARTH,
      maxHp: 620,
      atk: 24,
      def: 11,
      evasion: 0.05,
      kind: "boss",
      cycleElements: [EL.EARTH, EL.METAL, EL.WATER, EL.WOOD, EL.FIRE],
      overloadEvery: 3
    }
  };

  var WAVES = [
    {
      label: "WAVE 1 — BACK ALLEY SCRAPPERS",
      enemies: ["droneFire", "droneWater", "droneEarth"]
    },
    {
      label: "WAVE 2 — NEON DISTRICT ENFORCERS",
      enemies: ["enforcerWood", "enforcerMetal", "enforcerFire"]
    },
    {
      label: "FINAL WAVE — OVERSEER PRIME",
      enemies: ["boss"]
    }
  ];

  global.GameData = {
    EL: EL,
    ELEMENT_COLOR: ELEMENT_COLOR,
    ELEMENT_LABEL: ELEMENT_LABEL,
    STRONG_AGAINST: STRONG_AGAINST,
    NURTURES: NURTURES,
    getElementalOutcome: getElementalOutcome,
    CHARACTERS: CHARACTERS,
    ENEMY_TEMPLATES: ENEMY_TEMPLATES,
    WAVES: WAVES
  };
})(window);
