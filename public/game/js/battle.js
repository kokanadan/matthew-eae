/* ==========================================================================
   NEON WULIN: CYBER RUMBLE — battle engine (pure logic, no rendering/DOM)
   Consumed by ui.js / main.js. Depends on GameData (data.js).
   ========================================================================== */

(function (global) {
  "use strict";

  var D = global.GameData;
  var BOOST_BONUS_MULT = 1.75;
  var GUARD_REDUCTION = 0.5;
  var VULNERABLE_BONUS = 0.5;
  var VULNERABLE_HITS = 2;
  var BASE_WAVE_HEAL_PCT = 0.15;
  var MAX_EVASION = 0.85;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function makeUnit(def, team, uid) {
    return {
      uid: uid,
      team: team, // 'party' | 'enemy'
      name: def.name,
      title: def.title || null,
      element: def.element,
      color: def.color || D.ELEMENT_COLOR[def.element],
      accent: def.accent || "#ffffff",
      maxHp: def.maxHp,
      hp: def.maxHp,
      atk: def.atk,
      def: def.def,
      baseEvasion: def.baseEvasion != null ? def.baseEvasion : (def.evasion != null ? def.evasion : 0.05),
      critChance: def.critChance || 0,
      critMult: def.critMult || 1.5,
      alive: true,
      acted: false,
      guarding: false,
      boostedNext: false,
      statuses: { burn: null, vulnerable: null },
      skillName: def.skillName || "Strike",
      boostName: def.boostName || null,
      build: def.build || null,
      kind: def.kind || (team === "party" ? "hero" : "grunt"),
      cycleElements: def.cycleElements || null,
      overloadEvery: def.overloadEvery || null,
      _turnsTaken: 0
    };
  }

  function freshBuffBucket() {
    return { evasion: null, evasionDebuff: null, atk: null, dmgReduction: null, statusImmune: null, heal: null };
  }

  function createBattle() {
    var battle = {
      party: D.CHARACTERS.map(function (c, i) { return makeUnit(c, "party", "party-" + c.id); }),
      enemies: [],
      waveIndex: -1,
      round: 1,
      phase: "intro", // intro | player | enemy | waveclear | victory | defeat
      buffs: { party: freshBuffBucket(), enemy: freshBuffBucket() },
      enemyQueue: [],
      log: []
    };
    startWave(battle, 0);
    return battle;
  }

  function startWave(battle, idx) {
    var wave = D.WAVES[idx];
    battle.waveIndex = idx;
    battle.enemies = wave.enemies.map(function (key, i) {
      var tpl = D.ENEMY_TEMPLATES[key];
      var unit = makeUnit(tpl, "enemy", "enemy-" + idx + "-" + i + "-" + key);
      return unit;
    });
    battle.round = 1;
    battle.phase = "player";
    battle.buffs = { party: battle.buffs ? battle.buffs.party : freshBuffBucket(), enemy: freshBuffBucket() };
    battle.party.forEach(function (u) { u.acted = false; u.guarding = false; });
    battle.enemies.forEach(function (u) { u.acted = false; u.guarding = false; });
    return { type: "waveStart", label: wave.label, text: wave.label };
  }

  function getUnit(battle, uid) {
    var found = battle.party.find(function (u) { return u.uid === uid; });
    if (found) return found;
    return battle.enemies.find(function (u) { return u.uid === uid; });
  }

  function getAliveParty(battle) { return battle.party.filter(function (u) { return u.alive; }); }
  function getAliveEnemies(battle) { return battle.enemies.filter(function (u) { return u.alive; }); }
  function getActingCandidates(battle) { return getAliveParty(battle).filter(function (u) { return !u.acted; }); }

  function effectiveEvasion(battle, unit) {
    var bucket = battle.buffs[unit.team];
    var e = unit.baseEvasion;
    if (bucket.evasion) e += bucket.evasion.magnitude;
    if (bucket.evasionDebuff) e += bucket.evasionDebuff.magnitude;
    return clamp(e, 0, MAX_EVASION);
  }

  function effectiveAtk(battle, unit) {
    var bucket = battle.buffs[unit.team];
    var mult = 1;
    if (bucket.atk) mult += bucket.atk.magnitude;
    return unit.atk * mult;
  }

  function setTeamBuff(battle, team, key, value) {
    battle.buffs[team][key] = value;
  }

  function isTeamImmune(battle, team) {
    return !!battle.buffs[team].statusImmune;
  }

  function applyBurn(battle, target, events) {
    if (isTeamImmune(battle, target.team)) {
      events.push({ type: "info", text: target.name + " is shielded from status effects!" });
      return;
    }
    target.statuses.burn = { ticks: [0.05, 0.08, 0.12], idx: 0 };
    events.push({ type: "statusApplied", uid: target.uid, status: "burn", text: target.name + " is set ABLAZE!" });
  }

  function applyVulnerable(battle, target, events) {
    if (isTeamImmune(battle, target.team)) return;
    target.statuses.vulnerable = { hitsLeft: VULNERABLE_HITS, bonus: VULNERABLE_BONUS };
    events.push({ type: "statusApplied", uid: target.uid, status: "vulnerable", text: target.name + " is left VULNERABLE!" });
  }

  function applyBoostSideEffect(battle, unit, defender, events) {
    var team = unit.team;
    var foeTeam = team === "party" ? "enemy" : "party";
    switch (unit.element) {
      case D.EL.WATER:
        setTeamBuff(battle, team, "evasion", { turnsLeft: 3, magnitude: 0.35 });
        events.push({ type: "boostEffect", text: (unit.boostName || "TIDAL SURGE") + "! " + (team === "party" ? "Your" : "The enemy") + " team's evasion surges!" });
        break;
      case D.EL.WOOD:
        setTeamBuff(battle, team, "heal", { turnsLeft: 3, magnitude: 0.08 });
        setTeamBuff(battle, foeTeam, "evasionDebuff", { turnsLeft: 3, magnitude: -0.2 });
        events.push({ type: "boostEffect", text: (unit.boostName || "BLOOM PROTOCOL") + "! A healing circle blooms, and enemy evasion withers!" });
        break;
      case D.EL.FIRE:
        if (defender && defender.alive) applyBurn(battle, defender, events);
        events.push({ type: "boostEffect", text: (unit.boostName || "MELTDOWN RUSH") + " ignites the target!" });
        break;
      case D.EL.EARTH:
        setTeamBuff(battle, team, "atk", { turnsLeft: 2, magnitude: 0.35 });
        events.push({ type: "boostEffect", text: (unit.boostName || "TREMOR PROTOCOL") + "! " + (team === "party" ? "Your" : "The enemy") + " team's attack is fortified!" });
        break;
      case D.EL.METAL:
        setTeamBuff(battle, team, "dmgReduction", { turnsLeft: 1, magnitude: 0.5 });
        setTeamBuff(battle, team, "statusImmune", { turnsLeft: 1 });
        events.push({ type: "boostEffect", text: (unit.boostName || "AEGIS PLATING") + "! " + (team === "party" ? "Your" : "The enemy") + " team hunkers down, damage reduced and status-proof!" });
        break;
      default:
        break;
    }
  }

  /**
   * Core resolution for one attack: attacker -> defender.
   * Returns an array of event objects describing what happened.
   */
  function resolveAttack(battle, attacker, defender) {
    var events = [];
    if (!attacker.alive || !defender.alive) return events;

    var evasion = effectiveEvasion(battle, defender);
    var evaded = Math.random() < evasion;
    if (evaded) {
      events.push({ type: "miss", attackerUid: attacker.uid, defenderUid: defender.uid, text: defender.name + " evades " + attacker.name + "'s attack!" });
      return events;
    }

    var outcome = D.getElementalOutcome(attacker.element, defender.element);
    var wasBoosted = attacker.boostedNext;
    var dmgMultiplier = outcome.multiplier;

    if (wasBoosted) {
      attacker.boostedNext = false;
      dmgMultiplier *= BOOST_BONUS_MULT;
    }

    var crit = false;
    if (attacker.element === D.EL.PHYSICAL && Math.random() < attacker.critChance) {
      crit = true;
      dmgMultiplier *= attacker.critMult;
    }

    if (defender.statuses.vulnerable && defender.statuses.vulnerable.hitsLeft > 0) {
      dmgMultiplier *= (1 + defender.statuses.vulnerable.bonus);
      defender.statuses.vulnerable.hitsLeft -= 1;
      if (defender.statuses.vulnerable.hitsLeft <= 0) defender.statuses.vulnerable = null;
    }

    if (defender.guarding) dmgMultiplier *= GUARD_REDUCTION;

    var teamReduction = battle.buffs[defender.team].dmgReduction;
    if (teamReduction) dmgMultiplier *= (1 - teamReduction.magnitude);

    var atkPower = effectiveAtk(battle, attacker);
    var raw = Math.max(1, atkPower - defender.def * 0.5);
    var damage = Math.max(1, Math.round(raw * dmgMultiplier));

    defender.hp = clamp(defender.hp - damage, 0, defender.maxHp);

    events.push({
      type: "attack",
      attackerUid: attacker.uid,
      defenderUid: defender.uid,
      damage: damage,
      crit: crit,
      relation: outcome.relation,
      boosted: wasBoosted,
      hpAfter: defender.hp,
      text: attacker.name + " hits " + defender.name + " for " + damage +
        (crit ? " (CRITICAL!)" : "") +
        (outcome.relation === "strong" ? " — SUPER EFFECTIVE!" : outcome.relation === "weak" ? " — resisted..." : "") +
        (wasBoosted ? " [BOOSTED]" : "")
    });

    if (wasBoosted) applyBoostSideEffect(battle, attacker, defender, events);

    if (crit) applyVulnerable(battle, defender, events);

    if (outcome.boostProc && defender.alive) {
      defender.boostedNext = true;
      events.push({ type: "boostGranted", uid: defender.uid, text: defender.name + " senses power building for their next move!" });
    }

    if (defender.hp <= 0) {
      defender.alive = false;
      defender.boostedNext = false;
      events.push({ type: "death", uid: defender.uid, text: defender.name + " is taken down!" });
    }

    return events;
  }

  function performPlayerAttack(battle, attackerUid, defenderUid) {
    var attacker = getUnit(battle, attackerUid);
    var defender = getUnit(battle, defenderUid);
    if (!attacker || !defender || attacker.team !== "party" || attacker.acted || !attacker.alive) return [];
    var events = resolveAttack(battle, attacker, defender);
    attacker.acted = true;
    return events;
  }

  function performPlayerGuard(battle, attackerUid) {
    var unit = getUnit(battle, attackerUid);
    if (!unit || unit.team !== "party" || unit.acted || !unit.alive) return [];
    unit.guarding = true;
    unit.acted = true;
    return [{ type: "guard", uid: unit.uid, text: unit.name + " braces for impact!" }];
  }

  function isPlayerPhaseComplete(battle) {
    return getActingCandidates(battle).length === 0;
  }

  function beginEnemyPhase(battle) {
    battle.phase = "enemy";
    battle.enemyQueue = getAliveEnemies(battle).map(function (u) { return u.uid; });
    return [{ type: "phase", text: "ENEMY PHASE" }];
  }

  function pickRandomTarget(list) {
    if (list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
  }

  function stepEnemyPhase(battle) {
    var events = [];
    if (battle.enemyQueue.length === 0) return { events: events, done: true };
    var uid = battle.enemyQueue.shift();
    var enemy = getUnit(battle, uid);
    if (!enemy || !enemy.alive) return { events: events, done: battle.enemyQueue.length === 0 };

    enemy._turnsTaken += 1;

    if (enemy.cycleElements && enemy.cycleElements.length) {
      enemy.element = enemy.cycleElements[(enemy._turnsTaken - 1) % enemy.cycleElements.length];
      enemy.color = D.ELEMENT_COLOR[enemy.element];
      events.push({ type: "info", text: enemy.name + " channels " + D.ELEMENT_LABEL[enemy.element] + " energy!" });
    }

    var aliveParty = getAliveParty(battle);
    if (aliveParty.length === 0) return { events: events, done: true };

    if (enemy.overloadEvery && enemy._turnsTaken % enemy.overloadEvery === 0) {
      events.push({ type: "info", text: enemy.name + " unleashes an OVERLOAD SURGE on the whole party!" });
      aliveParty.forEach(function (target) {
        var savedAtk = enemy.atk;
        enemy.atk = Math.round(savedAtk * 0.6);
        var evs = resolveAttack(battle, enemy, target);
        enemy.atk = savedAtk;
        events.push.apply(events, evs);
      });
    } else {
      var target = pickRandomTarget(aliveParty);
      var evs = resolveAttack(battle, enemy, target);
      events.push.apply(events, evs);
    }

    enemy.acted = true;
    return { events: events, done: battle.enemyQueue.length === 0 };
  }

  function tickTeamBuffs(battle, team, events) {
    var bucket = battle.buffs[team];
    Object.keys(bucket).forEach(function (key) {
      var buff = bucket[key];
      if (!buff) return;
      if (key === "heal") {
        var members = (team === "party" ? battle.party : battle.enemies).filter(function (u) { return u.alive; });
        members.forEach(function (u) {
          var healAmt = Math.round(u.maxHp * buff.magnitude);
          u.hp = clamp(u.hp + healAmt, 0, u.maxHp);
        });
        if (members.length) {
          events.push({ type: "healTick", team: team, text: (team === "party" ? "Your" : "The enemy") + " team's healing circle mends the wounded!" });
        }
      }
      buff.turnsLeft -= 1;
      if (buff.turnsLeft <= 0) bucket[key] = null;
    });
  }

  function tickBurns(battle, units, events) {
    units.forEach(function (u) {
      if (!u.alive || !u.statuses.burn) return;
      var burn = u.statuses.burn;
      var pct = burn.ticks[burn.idx] != null ? burn.ticks[burn.idx] : burn.ticks[burn.ticks.length - 1];
      var dmg = Math.max(1, Math.round(u.maxHp * pct));
      u.hp = clamp(u.hp - dmg, 0, u.maxHp);
      events.push({ type: "burnTick", uid: u.uid, damage: dmg, hpAfter: u.hp, text: u.name + " suffers " + dmg + " burn damage!" });
      burn.idx += 1;
      if (u.hp <= 0) {
        u.alive = false;
        events.push({ type: "death", uid: u.uid, text: u.name + " succumbs to the flames!" });
      }
      if (burn.idx >= burn.ticks.length) u.statuses.burn = null;
    });
  }

  function isWaveClear(battle) { return getAliveEnemies(battle).length === 0; }
  function isDefeat(battle) { return getAliveParty(battle).length === 0; }
  function isLastWave(battle) { return battle.waveIndex === D.WAVES.length - 1; }

  /**
   * Called after enemy phase completes: applies upkeep (burn/heal/buff ticks),
   * checks win/lose/wave-clear, and either starts a new round, advances the
   * wave, or ends the battle. Returns an events array.
   */
  function finishRound(battle) {
    var events = [];

    tickBurns(battle, battle.party.concat(battle.enemies), events);

    if (isDefeat(battle)) {
      battle.phase = "defeat";
      events.push({ type: "defeat", text: "Your party has fallen..." });
      return events;
    }

    if (isWaveClear(battle)) {
      if (isLastWave(battle)) {
        battle.phase = "victory";
        events.push({ type: "victory", text: "OVERSEER PRIME is destroyed! The city breathes free tonight." });
        return events;
      }
      var healPct = BASE_WAVE_HEAL_PCT;
      battle.party.forEach(function (u) {
        if (!u.alive) return;
        var amt = Math.round(u.maxHp * healPct);
        u.hp = clamp(u.hp + amt, 0, u.maxHp);
        u.statuses.burn = null;
        u.statuses.vulnerable = null;
        u.boostedNext = false;
      });
      battle.buffs.party = freshBuffBucket();
      battle.buffs.enemy = freshBuffBucket();
      events.push({ type: "waveClear", text: "Wave cleared! The squad patches up and pushes forward." });
      var startEvt = startWave(battle, battle.waveIndex + 1);
      events.push(startEvt);
      return events;
    }

    tickTeamBuffs(battle, "party", events);
    tickTeamBuffs(battle, "enemy", events);

    battle.round += 1;
    battle.phase = "player";
    battle.party.forEach(function (u) { u.acted = false; u.guarding = false; });
    battle.enemies.forEach(function (u) { u.guarding = false; });
    events.push({ type: "roundStart", round: battle.round, text: "— Round " + battle.round + " —" });
    return events;
  }

  global.Battle = {
    BOOST_BONUS_MULT: BOOST_BONUS_MULT,
    createBattle: createBattle,
    startWave: startWave,
    getUnit: getUnit,
    getAliveParty: getAliveParty,
    getAliveEnemies: getAliveEnemies,
    getActingCandidates: getActingCandidates,
    effectiveEvasion: effectiveEvasion,
    performPlayerAttack: performPlayerAttack,
    performPlayerGuard: performPlayerGuard,
    isPlayerPhaseComplete: isPlayerPhaseComplete,
    beginEnemyPhase: beginEnemyPhase,
    stepEnemyPhase: stepEnemyPhase,
    finishRound: finishRound,
    isWaveClear: isWaveClear,
    isDefeat: isDefeat
  };
})(window);
