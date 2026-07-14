/* ==========================================================================
   NEON WULIN: CYBER RUMBLE — game orchestrator
   Wires GameData + Battle (logic) + Engine (3D) + UI (DOM) together.
   ========================================================================== */

(function () {
  "use strict";

  var battle = null;
  var actingUnit = null;
  var inputLocked = false;

  function renderStatic() {
    UI.renderHUD(battle, {});
  }

  async function playEventsSequentially(events) {
    for (var i = 0; i < events.length; i++) {
      var evt = events[i];
      switch (evt.type) {
        case "attack":
          UI.logForEvent(evt);
          await Engine.playAttack(evt.attackerUid, evt.defenderUid, function () {
            Engine.playHit(evt.defenderUid);
            renderStatic();
          });
          renderStatic();
          break;
        case "miss":
          UI.logForEvent(evt);
          await Engine.playAttack(evt.attackerUid, evt.defenderUid, function () {
            Engine.playMiss(evt.defenderUid);
          });
          break;
        case "guard":
          UI.logForEvent(evt);
          await Engine.playGuard(evt.uid);
          renderStatic();
          break;
        case "boostGranted":
          UI.logForEvent(evt);
          await Engine.playBoostGlow(evt.uid);
          renderStatic();
          break;
        case "boostEffect":
          UI.logForEvent(evt);
          renderStatic();
          await Engine.wait(250);
          break;
        case "death":
          UI.logForEvent(evt);
          await Engine.playDeath(evt.uid);
          renderStatic();
          break;
        case "waveClear":
          UI.logForEvent(evt);
          UI.showWaveBanner("WAVE CLEAR!");
          await Engine.wait(1000);
          break;
        case "waveStart":
          Engine.spawnEnemies(battle.enemies);
          UI.showWaveBanner(evt.label);
          renderStatic();
          UI.logForEvent(evt);
          await Engine.wait(700);
          break;
        case "statusApplied":
        case "burnTick":
        case "healTick":
        case "info":
        case "phase":
        case "roundStart":
          UI.logForEvent(evt);
          renderStatic();
          await Engine.wait(180);
          break;
        default:
          UI.logForEvent(evt);
          renderStatic();
      }
    }
  }

  function refreshIdlePrompt() {
    actingUnit = null;
    var candidates = Battle.getActingCandidates(battle).map(function (u) { return u.uid; });
    UI.setPrompt(candidates.length ? "Choose a party member to command" : "Standing by...");
    UI.setActionButtons([]);
    UI.renderHUD(battle, { selectableUids: candidates, onCardClick: handleActorCardClick });
  }

  function handleActorCardClick(uid) {
    if (inputLocked || battle.phase !== "player") return;
    var unit = Battle.getUnit(battle, uid);
    if (!unit || !unit.alive || unit.acted || unit.team !== "party") return;
    showActionMenuFor(unit);
  }

  function showActionMenuFor(unit) {
    actingUnit = unit;
    UI.setPrompt(unit.name + "'S ORDERS — " + unit.skillName + " (" + GameData.ELEMENT_LABEL[unit.element] + ")");
    UI.renderHUD(battle, {});
    UI.setActionButtons([
      { label: "⚔ ATTACK", cls: "btn-cyan", onClick: enterTargetMode },
      { label: "\u{1F6E1} GUARD", cls: "btn-gold", onClick: doGuard },
      { label: "CANCEL", cls: "btn-pink", onClick: refreshIdlePrompt }
    ]);
  }

  function enterTargetMode() {
    if (!actingUnit) return;
    var targets = battle.party.concat(battle.enemies).filter(function (u) { return u.alive; }).map(function (u) { return u.uid; });
    UI.setPrompt("Choose a target for " + actingUnit.skillName + " — allies can be struck to trigger their elemental boost!");
    UI.setActionButtons([{ label: "CANCEL", cls: "btn-pink", onClick: function () { showActionMenuFor(actingUnit); } }]);
    UI.renderHUD(battle, { targetableUids: targets, onCardClick: handleTargetClick });
  }

  async function handleTargetClick(uid) {
    if (!actingUnit || inputLocked) return;
    var attacker = actingUnit;
    actingUnit = null;
    inputLocked = true;
    UI.setActionButtons([]);
    UI.setPrompt("");
    renderStatic();
    var events = Battle.performPlayerAttack(battle, attacker.uid, uid);
    await playEventsSequentially(events);
    await afterPlayerAction();
    inputLocked = false;
  }

  async function doGuard() {
    if (!actingUnit || inputLocked) return;
    var attacker = actingUnit;
    actingUnit = null;
    inputLocked = true;
    UI.setActionButtons([]);
    UI.setPrompt("");
    renderStatic();
    var events = Battle.performPlayerGuard(battle, attacker.uid);
    await playEventsSequentially(events);
    await afterPlayerAction();
    inputLocked = false;
  }

  async function afterPlayerAction() {
    if (Battle.isDefeat(battle)) {
      battle.phase = "defeat";
      UI.showEnd(false, "The squad is down. Reboot and try again, runner.");
      return;
    }
    if (Battle.isPlayerPhaseComplete(battle) || Battle.getAliveEnemies(battle).length === 0) {
      await runEnemyPhaseSequence();
    } else {
      refreshIdlePrompt();
    }
  }

  async function runEnemyPhaseSequence() {
    inputLocked = true;
    UI.setPrompt("ENEMY PHASE");
    var startEvents = Battle.beginEnemyPhase(battle);
    await playEventsSequentially(startEvents);

    var done = false;
    while (!done) {
      var step = Battle.stepEnemyPhase(battle);
      await playEventsSequentially(step.events);
      done = step.done;
    }

    var finishEvents = Battle.finishRound(battle);
    await playEventsSequentially(finishEvents);

    if (battle.phase === "victory") {
      UI.showEnd(true, "All hostile waves neutralized. The squad jacks out into the neon night.");
      inputLocked = false;
      return;
    }
    if (battle.phase === "defeat") {
      UI.showEnd(false, "The squad is down. Reboot and try again, runner.");
      inputLocked = false;
      return;
    }
    inputLocked = false;
    refreshIdlePrompt();
  }

  function startGame() {
    UI.hideTitle();
    UI.hideEnd();
    UI.clearLog();
    battle = Battle.createBattle();
    Engine.spawnParty(battle.party);
    Engine.spawnEnemies(battle.enemies);
    UI.showWaveBanner(GameData.WAVES[0].label);
    UI.log(GameData.WAVES[0].label, "log-info");
    refreshIdlePrompt();
  }

  // Read-only introspection hook for automated testing/debugging.
  window.__debugGetBattle = function () { return battle; };

  function boot() {
    UI.init();
    Engine.init(document.getElementById("canvas-container"));
    UI.showTitle();

    document.getElementById("start-btn").addEventListener("click", startGame);
    document.getElementById("restart-btn").addEventListener("click", startGame);
    document.getElementById("help-btn").addEventListener("click", function () { UI.toggleHelp(); });
    document.getElementById("help-close-btn").addEventListener("click", function () { UI.toggleHelp(false); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
