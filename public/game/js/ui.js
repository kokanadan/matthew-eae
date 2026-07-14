/* ==========================================================================
   NEON WULIN: CYBER RUMBLE — DOM/UI layer
   Renders HUD cards, action/target menus, log, banners and screens.
   Pure DOM manipulation; holds no battle logic.
   ========================================================================== */

(function (global) {
  "use strict";

  var D = global.GameData;
  var ELEMENT_ICON = {
    water: "💧",
    wood: "🌿",
    fire: "🔥",
    earth: "⛰️",
    metal: "⚙️",
    physical: "⭐"
  };

  var els = {};

  function $(id) { return document.getElementById(id); }

  function init() {
    els.enemyHud = $("enemy-hud");
    els.partyHud = $("party-hud");
    els.log = $("battle-log");
    els.prompt = $("turn-prompt");
    els.actionButtons = $("action-buttons");
    els.targetButtons = $("target-buttons");
    els.waveBanner = $("wave-banner");
    els.titleScreen = $("title-screen");
    els.endScreen = $("end-screen");
    els.helpOverlay = $("help-overlay");
    els.legendTitle = $("legend-title");
    els.legendHelp = $("legend-help");
    var legendHtml = buildLegendHTML();
    if (els.legendTitle) els.legendTitle.innerHTML = legendHtml;
    if (els.legendHelp) els.legendHelp.innerHTML = legendHtml;
  }

  function buildLegendHTML() {
    var order = ["water", "wood", "fire", "earth", "metal", "physical"];
    return order.map(function (el) {
      var color = D.ELEMENT_COLOR[el];
      if (el === "physical") {
        return '<div class="legend-card" style="border-color:' + color + '"><b style="color:' + color + '">' + ELEMENT_ICON[el] + ' PHYSICAL</b><div>Neutral to all elements. The only element that can land a CRITICAL hit, which leaves the target VULNERABLE (bonus damage) for its next 2 hits taken.</div></div>';
      }
      var strong = D.STRONG_AGAINST[el];
      var weak = Object.keys(D.STRONG_AGAINST).find(function (k) { return D.STRONG_AGAINST[k] === el; });
      var boosts = D.NURTURES[el];
      var boostedBy = Object.keys(D.NURTURES).find(function (k) { return D.NURTURES[k] === el; });
      return '<div class="legend-card" style="border-color:' + color + '"><b style="color:' + color + '">' + ELEMENT_ICON[el] + " " + el.toUpperCase() + "</b><div>" +
        "2x vs <b>" + weak_label(strong) + "</b> &middot; 0.5x vs <b>" + weak_label(weak) + "</b><br>" +
        "Boosted by <b>" + weak_label(boostedBy) + "</b> &middot; boosts <b>" + weak_label(boosts) + "</b>" +
        "</div></div>";
    }).join("");

    function weak_label(k) { return D.ELEMENT_LABEL[k] || k; }
  }

  function hpFrac(u) { return Math.max(0, u.hp) / u.maxHp; }

  function statusChips(unit) {
    var chips = [];
    if (unit.guarding) chips.push('<span class="status-chip chip-guard">GUARD</span>');
    if (unit.boostedNext) chips.push('<span class="status-chip chip-boost">BOOST READY</span>');
    if (unit.statuses.burn) chips.push('<span class="status-chip chip-burn">BURN x' + (unit.statuses.burn.ticks.length - unit.statuses.burn.idx) + '</span>');
    if (unit.statuses.vulnerable) chips.push('<span class="status-chip chip-vuln">VULNERABLE</span>');
    return chips.join("");
  }

  function cardHTML(unit, extraClass) {
    var frac = hpFrac(unit);
    var cls = ["unit-card"];
    if (!unit.alive) cls.push("dead");
    else if (unit.acted) cls.push("acted");
    if (extraClass) cls.push(extraClass);
    return (
      '<div class="' + cls.join(" ") + '" data-uid="' + unit.uid + '">' +
      '<div class="unit-top">' +
      '<div class="unit-badge" style="background:' + unit.color + '22;border-color:' + unit.color + '">' + ELEMENT_ICON[unit.element] + "</div>" +
      '<div><div class="unit-name">' + unit.name + '</div><div class="unit-title">' + (unit.title || D.ELEMENT_LABEL[unit.element]) + "</div></div>" +
      "</div>" +
      '<div class="hp-bar-track"><div class="hp-bar-fill' + (frac < 0.3 ? " low" : "") + '" style="width:' + Math.round(frac * 100) + '%"></div></div>' +
      '<div class="hp-text">' + Math.max(0, unit.hp) + " / " + unit.maxHp + "</div>" +
      '<div class="status-row">' + statusChips(unit) + "</div>" +
      "</div>"
    );
  }

  function renderHUD(battle, opts) {
    opts = opts || {};
    var selectable = opts.selectableUids || [];
    var targetable = opts.targetableUids || [];

    els.enemyHud.innerHTML = battle.enemies.map(function (u) {
      var extra = targetable.indexOf(u.uid) !== -1 ? "targetable" : "";
      return cardHTML(u, extra);
    }).join("");

    els.partyHud.innerHTML = battle.party.map(function (u) {
      var extra = selectable.indexOf(u.uid) !== -1 ? "selectable" : (targetable.indexOf(u.uid) !== -1 ? "targetable" : "");
      return cardHTML(u, extra);
    }).join("");

    if (opts.onCardClick) {
      [els.enemyHud, els.partyHud].forEach(function (root) {
        root.querySelectorAll(".unit-card.selectable, .unit-card.targetable").forEach(function (card) {
          card.addEventListener("click", function () { opts.onCardClick(card.getAttribute("data-uid")); });
        });
      });
    }
  }

  function setPrompt(text) { els.prompt.textContent = text || ""; }

  function setActionButtons(buttons) {
    els.actionButtons.innerHTML = "";
    (buttons || []).forEach(function (b) {
      var btn = document.createElement("button");
      btn.className = "btn small-btn " + (b.cls || "btn-cyan");
      btn.textContent = b.label;
      btn.disabled = !!b.disabled;
      btn.addEventListener("click", b.onClick);
      els.actionButtons.appendChild(btn);
    });
  }

  function log(text, cls) {
    var line = document.createElement("div");
    if (cls) line.className = cls;
    line.textContent = text;
    els.log.appendChild(line);
    while (els.log.children.length > 60) els.log.removeChild(els.log.firstChild);
    els.log.scrollTop = els.log.scrollHeight;
  }

  function clearLog() { els.log.innerHTML = ""; }

  var bannerTimer = null;
  function showWaveBanner(text) {
    els.waveBanner.textContent = text;
    els.waveBanner.classList.add("show");
    if (bannerTimer) clearTimeout(bannerTimer);
    bannerTimer = setTimeout(function () { els.waveBanner.classList.remove("show"); }, 2200);
  }

  function showTitle() { els.titleScreen.classList.remove("hidden"); }
  function hideTitle() { els.titleScreen.classList.add("hidden"); }

  function showEnd(victory, message) {
    els.endScreen.classList.remove("hidden");
    var h = els.endScreen.querySelector("h1");
    var p = els.endScreen.querySelector("p");
    h.textContent = victory ? "MISSION CLEAR" : "SYSTEM CRASH";
    h.style.color = victory ? "" : "#ff6b6b";
    p.textContent = message || "";
  }
  function hideEnd() { els.endScreen.classList.add("hidden"); }

  function toggleHelp(forceShow) {
    if (!els.helpOverlay) return;
    var show = typeof forceShow === "boolean" ? forceShow : els.helpOverlay.classList.contains("hidden");
    els.helpOverlay.classList.toggle("hidden", !show);
  }

  function logForEvent(evt) {
    if (!evt || !evt.text) return;
    var cls = "";
    if (evt.type === "attack" && evt.crit) cls = "log-crit";
    else if (evt.type === "boostEffect" || evt.type === "boostGranted") cls = "log-boost";
    else if (evt.type === "death") cls = "log-death";
    else if (evt.type === "info" || evt.type === "phase" || evt.type === "roundStart") cls = "log-info";
    log(evt.text, cls);
  }

  global.UI = {
    init: init,
    renderHUD: renderHUD,
    setPrompt: setPrompt,
    setActionButtons: setActionButtons,
    log: log,
    clearLog: clearLog,
    logForEvent: logForEvent,
    showWaveBanner: showWaveBanner,
    showTitle: showTitle,
    hideTitle: hideTitle,
    showEnd: showEnd,
    hideEnd: hideEnd,
    toggleHelp: toggleHelp,
    buildLegendHTML: buildLegendHTML
  };
})(window);
