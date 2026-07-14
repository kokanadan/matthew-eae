/* ==========================================================================
   NEON WULIN: CYBER RUMBLE — 3D presentation layer (Three.js)
   Stylized "flat cel-shaded anime punk" low-poly rig: bold black outlines,
   flat toon-shaded colors, exaggerated proportions (big head, short torso,
   long limbs) evocative of Panty & Stocking with Garterbelt, dressed in a
   neon cyberpunk arena.
   ========================================================================== */

(function (global) {
  "use strict";

  var THREE = global.THREE;

  var scene, camera, renderer, clock;
  var toonGradientTex = null;
  var models = {}; // uid -> { group, parts, baseY, facing }
  var tweens = []; // active animation tweens
  var container = null;
  var ambientMotes = null;

  // ---------------------------------------------------------------- helpers

  function makeToonGradient() {
    var c = document.createElement("canvas");
    c.width = 4; c.height = 1;
    var ctx = c.getContext("2d");
    var shades = [70, 130, 190, 255];
    for (var i = 0; i < 4; i++) {
      ctx.fillStyle = "rgb(" + shades[i] + "," + shades[i] + "," + shades[i] + ")";
      ctx.fillRect(i, 0, 1, 1);
    }
    var tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }

  function toonMat(color) {
    return new THREE.MeshToonMaterial({ color: color, gradientMap: toonGradientTex });
  }

  function unlitMat(color, opts) {
    opts = opts || {};
    return new THREE.MeshBasicMaterial(Object.assign({ color: color }, opts));
  }

  function addOutline(mesh, factor) {
    var outline = new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide }));
    outline.scale.setScalar(factor || 1.16);
    mesh.add(outline);
    return outline;
  }

  function part(geo, color, opts) {
    opts = opts || {};
    var mesh = new THREE.Mesh(geo, toonMat(color));
    mesh.castShadow = false;
    if (opts.outline !== false) addOutline(mesh, opts.outlineScale);
    return mesh;
  }

  function box(w, h, d, color, opts) { return part(new THREE.BoxGeometry(w, h, d), color, opts); }
  function sphere(r, color, opts) { return part(new THREE.SphereGeometry(r, 12, 10), color, opts); }
  function cyl(rt, rb, h, color, opts) { return part(new THREE.CylinderGeometry(rt, rb, h, 10), color, opts); }
  function cone(r, h, color, opts) { return part(new THREE.ConeGeometry(r, h, 10), color, opts); }

  function makeFaceTexture(pupilColor) {
    var c = document.createElement("canvas");
    c.width = 128; c.height = 96;
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 128, 96);
    // big anime eyes
    [40, 88].forEach(function (ex) {
      ctx.fillStyle = "#151018";
      ctx.beginPath();
      ctx.ellipse(ex, 46, 15, 19, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = pupilColor;
      ctx.beginPath();
      ctx.ellipse(ex, 50, 8, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(ex - 4, 42, 3.4, 4.4, 0, 0, Math.PI * 2);
      ctx.fill();
      // upper lash
      ctx.strokeStyle = "#151018";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(ex - 16, 33);
      ctx.quadraticCurveTo(ex, 20, ex + 16, 31);
      ctx.stroke();
    });
    // mouth (confident smirk)
    ctx.strokeStyle = "#151018";
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(50, 74);
    ctx.quadraticCurveTo(64, 82, 82, 70);
    ctx.stroke();
    var tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  function buildHair(build, color) {
    var g = new THREE.Group();
    // NOTE: head sphere radius is 0.62 — every piece here must clear that
    // radius (or be a larger shell sphere at the same center) or it renders
    // fully hidden inside the opaque head.
    switch (build.hair) {
      case "ponytailFin":
        var band = box(1.0, 0.3, 1.0, color, { outlineScale: 1.18 });
        band.position.set(0, 0.46, 0);
        g.add(band);
        var tail = cone(0.24, 0.95, color);
        tail.rotation.x = Math.PI * 0.55;
        tail.position.set(0, 0.4, -0.62);
        g.add(tail);
        break;
      case "leafCrown":
        for (var i = 0; i < 6; i++) {
          var leaf = cone(0.18, 0.46, color);
          var a = (i / 6) * Math.PI * 2;
          leaf.position.set(Math.cos(a) * 0.4, 0.58, Math.sin(a) * 0.4);
          leaf.rotation.z = Math.cos(a) * 0.5;
          leaf.rotation.x = Math.sin(a) * 0.5;
          g.add(leaf);
        }
        break;
      case "mohawk":
        var spike = box(0.18, 0.66, 0.9, color);
        spike.position.set(0, 0.78, 0);
        g.add(spike);
        break;
      case "buzz":
        g.add(sphere(0.7, color, { outlineScale: 1.12 }));
        break;
      case "sleekBob":
        var cap = sphere(0.72, color, { outlineScale: 1.1 });
        cap.scale.set(1, 0.9, 1.08);
        cap.position.y = 0.04;
        g.add(cap);
        break;
      case "slickback":
        var cap2 = sphere(0.7, color, { outlineScale: 1.1 });
        cap2.scale.set(1, 0.85, 1.05);
        g.add(cap2);
        var spike2 = box(0.32, 0.32, 0.55, color);
        spike2.position.set(0, 0.2, -0.45);
        spike2.rotation.x = -0.4;
        g.add(spike2);
        break;
      default:
        break;
    }
    return g;
  }

  function buildVisor(build, accent) {
    if (build.visor === "none") return null;
    var w = build.visor === "band" ? 1.04 : 0.9;
    var v = box(w, 0.17, 0.16, accent, { outline: false });
    v.material = unlitMat(accent, { transparent: true, opacity: 0.92 });
    if (build.visor === "shades") v.material = unlitMat("#111018");
    v.position.set(0, 0.07, 0.66);
    return v;
  }

  function buildAccessory(build, color, accent) {
    var g = new THREE.Group();
    switch (build.accessory) {
      case "finBlades":
        var b1 = cone(0.14, 0.5, accent); b1.rotation.z = Math.PI / 2; b1.position.set(0.5, 0, 0);
        g.add(b1);
        break;
      case "vineWhip":
        var whip = cyl(0.05, 0.08, 1.4, color);
        whip.rotation.z = 0.6;
        whip.position.set(0.55, -0.2, 0.1);
        g.add(whip);
        break;
      case "jetpack":
        var jp = cyl(0.18, 0.22, 0.9, "#3a3a44");
        jp.position.set(0, 0, -0.4);
        g.add(jp);
        var flame = cone(0.14, 0.4, accent);
        flame.position.set(0, -0.6, -0.4);
        flame.rotation.x = Math.PI;
        g.add(flame);
        break;
      case "gauntlets":
        [-0.62, 0.62].forEach(function (x) {
          var gaunt = box(0.42, 0.42, 0.42, accent);
          gaunt.position.set(x, -1.5, 0.1);
          g.add(gaunt);
        });
        break;
      case "chromeBlade":
        var blade = box(0.08, 1.1, 0.32, "#e9edf2");
        blade.position.set(0.6, -0.3, 0.2);
        blade.rotation.z = 0.5;
        g.add(blade);
        break;
      case "revolver":
        var gun = box(0.18, 0.22, 0.62, "#3a3a44");
        gun.position.set(0.62, -0.9, 0.3);
        g.add(gun);
        break;
      default:
        break;
    }
    return g;
  }

  function buildCharacterModel(unit, isEnemyGrunt) {
    var build = unit.build || { hair: "buzz", visor: "none", limbs: "slim", accessory: "none" };
    var color = unit.color || "#cccccc";
    var accent = unit.accent || "#ffffff";
    var skin = "#ffdcb8";
    var bulky = build.limbs === "bulky";
    var scaleAll = unit.kind === "boss" ? 1.9 : (unit.kind === "enforcer" ? 1.12 : (unit.kind === "drone" ? 0.85 : 1));

    var group = new THREE.Group();
    var legScale = bulky ? 0.3 : 0.2;

    if (unit.kind === "drone") {
      // small floating orb-bot, no legs
      var core = sphere(0.62, color);
      group.add(core);
      var ring = cyl(0.75, 0.75, 0.14, accent, { outline: false });
      ring.material = unlitMat(accent, { transparent: true, opacity: 0.85 });
      ring.rotation.x = Math.PI / 2.4;
      group.add(ring);
      var eye = sphere(0.2, "#151018", { outline: false });
      eye.position.set(0, 0, 0.68);
      group.add(eye);
      group.userData.hoverBase = 2.1;
      group.position.y = group.userData.hoverBase;
      group.scale.setScalar(scaleAll);
      return { group: group, headRef: core, isDrone: true };
    }

    // legs
    var hipY = 2.15;
    [-0.26, 0.26].forEach(function (x) {
      var leg = cyl(legScale, legScale * 0.85, hipY, "#20202a");
      leg.position.set(x, hipY / 2, 0);
      group.add(leg);
      var boot = box(0.34, 0.26, 0.5, accent);
      boot.position.set(x, 0.1, 0.08);
      group.add(boot);
    });

    // torso (short, per art style)
    var torsoH = 1.05;
    var torso = box(bulky ? 1.5 : 1.15, torsoH, bulky ? 0.75 : 0.58, color);
    torso.position.set(0, hipY + torsoH / 2, 0);
    group.add(torso);

    var beltY = hipY + 0.05;
    var belt = box((bulky ? 1.55 : 1.2), 0.16, (bulky ? 0.8 : 0.62), accent);
    belt.position.set(0, beltY, 0);
    group.add(belt);

    // arms
    var shoulderY = hipY + torsoH - 0.12;
    var armLen = 1.5;
    [-1, 1].forEach(function (side) {
      var armX = side * ((bulky ? 0.85 : 0.68));
      var arm = cyl(bulky ? 0.24 : 0.15, bulky ? 0.2 : 0.13, armLen, skin);
      arm.position.set(armX, shoulderY - armLen / 2 + 0.1, 0);
      arm.rotation.z = side * 0.12;
      var sleeve = cyl(bulky ? 0.28 : 0.18, bulky ? 0.26 : 0.17, armLen * 0.55, color);
      sleeve.position.y = armLen * 0.22;
      arm.add(sleeve);
      arm.name = side < 0 ? "armL" : "armR";
      group.add(arm);
    });

    // neck + head
    var headY = shoulderY + 0.55;
    var head = sphere(0.62, skin, { outlineScale: 1.06 });
    head.position.set(0, headY, 0);
    group.add(head);

    var pupilColor = accent;
    var face = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.72), new THREE.MeshBasicMaterial({ map: makeFaceTexture(pupilColor), transparent: true }));
    face.position.set(0, headY + 0.02, 0.65);
    group.add(face);

    var hair = buildHair(build, unit.kind === "boss" ? accent : color === "#ffffff" ? accent : shadeColor(color, -10) || color);
    hair.position.set(0, headY, 0);
    group.add(hair);

    var visor = buildVisor(build, accent);
    if (visor) { visor.position.y += headY; group.add(visor); }

    var acc = buildAccessory(build, color, accent);
    acc.position.set(0, shoulderY - 0.2, 0);
    group.add(acc);

    group.scale.setScalar(scaleAll);
    group.userData.hoverBase = 0;

    return { group: group, headRef: head };
  }

  function shadeColor(hex, amt) {
    try {
      var c = new THREE.Color(hex);
      var h = {}; c.getHSL(h);
      c.setHSL(h.h, h.s, Math.max(0, Math.min(1, h.l + amt / 100)));
      return "#" + c.getHexString();
    } catch (e) { return hex; }
  }

  // ------------------------------------------------------------- environment

  function buildGridTexture() {
    var c = document.createElement("canvas");
    c.width = c.height = 256;
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#0a0416";
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = "#ff2fd0";
    ctx.lineWidth = 3;
    ctx.strokeRect(1, 1, 254, 254);
    ctx.strokeStyle = "rgba(0,230,255,0.55)";
    ctx.lineWidth = 1.5;
    for (var i = 32; i < 256; i += 32) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
    }
    var tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 10);
    return tex;
  }

  function buildBuildingTexture(color) {
    var c = document.createElement("canvas");
    c.width = 64; c.height = 128;
    var ctx = c.getContext("2d");
    ctx.fillStyle = "#0c0a18";
    ctx.fillRect(0, 0, 64, 128);
    ctx.fillStyle = color;
    for (var y = 4; y < 128; y += 9) {
      for (var x = 4; x < 64; x += 10) {
        if (Math.random() > 0.45) { ctx.globalAlpha = 0.35 + Math.random() * 0.65; ctx.fillRect(x, y, 5, 5); }
      }
    }
    ctx.globalAlpha = 1;
    var tex = new THREE.CanvasTexture(c);
    return tex;
  }

  function buildEnvironment() {
    var floorGeo = new THREE.PlaneGeometry(140, 140);
    var floor = new THREE.Mesh(floorGeo, new THREE.MeshBasicMaterial({ map: buildGridTexture() }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);

    var skylineColors = ["#ff2fd0", "#00e6ff", "#7b3bff", "#ff2fd0"];
    for (var i = 0; i < 22; i++) {
      var w = 3 + Math.random() * 5;
      var h = 8 + Math.random() * 26;
      var d = 3 + Math.random() * 5;
      var color = skylineColors[i % skylineColors.length];
      var bld = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ map: buildBuildingTexture(color) }));
      var angle = (i / 22) * Math.PI * 2;
      var radius = 34 + Math.random() * 20;
      bld.position.set(Math.cos(angle) * radius, h / 2, Math.sin(angle) * radius - 10);
      scene.add(bld);
    }

    scene.fog = new THREE.Fog(0x0a0416, 22, 95);
    scene.background = new THREE.Color(0x0a0416);

    var hemi = new THREE.HemisphereLight(0xfff3fb, 0x2a1840, 0.65);
    scene.add(hemi);
    var key = new THREE.DirectionalLight(0xffffff, 1.15);
    key.position.set(6, 14, 10);
    scene.add(key);
    var fill = new THREE.DirectionalLight(0xffffff, 0.35);
    fill.position.set(-6, 8, 6);
    scene.add(fill);
    var rim1 = new THREE.PointLight(0xff2fd0, 0.9, 60);
    rim1.position.set(-14, 6, -6);
    scene.add(rim1);
    var rim2 = new THREE.PointLight(0x00e6ff, 0.9, 60);
    rim2.position.set(14, 6, 10);
    scene.add(rim2);

    // ambient data motes
    var moteCount = 60;
    var positions = new Float32Array(moteCount * 3);
    for (var m = 0; m < moteCount; m++) {
      positions[m * 3] = (Math.random() - 0.5) * 40;
      positions[m * 3 + 1] = Math.random() * 14;
      positions[m * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    var moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    var moteMat = new THREE.PointsMaterial({ color: 0x9fe8ff, size: 0.12, transparent: true, opacity: 0.75 });
    ambientMotes = new THREE.Points(moteGeo, moteMat);
    scene.add(ambientMotes);
  }

  // ------------------------------------------------------------------ layout

  var PARTY_POS = [
    [-8.4, 0, 5.2], [-5.1, 0, 5.9], [-1.7, 0, 6.3], [1.7, 0, 6.3], [5.1, 0, 5.9], [8.4, 0, 5.2]
  ];

  function enemyPositions(count) {
    if (count === 1) return [[0, 0, -8]];
    if (count === 2) return [[-3.6, 0, -8], [3.6, 0, -8]];
    return [[-6.4, 0, -8], [0, 0, -8.6], [6.4, 0, -8]];
  }

  function disposeGroup(group) {
    group.traverse(function (obj) {
      if (obj.geometry) obj.geometry.dispose && obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(function (m) { m.dispose && m.dispose(); });
        else obj.material.dispose && obj.material.dispose();
      }
    });
  }

  function spawnUnit(unit, position, facing) {
    var built = buildCharacterModel(unit);
    var inner = built.group; // idle bob / spin only, local origin at feet
    var root = new THREE.Group(); // tween-driven (lunge/knockback/death)
    var hoverBase = inner.userData.hoverBase || 0;
    inner.position.y = hoverBase;
    root.add(inner);
    root.position.set(position[0], position[1], position[2]);
    root.rotation.y = facing;
    scene.add(root);
    models[unit.uid] = {
      group: root,
      inner: inner,
      basePos: root.position.clone(),
      facing: facing,
      alive: true,
      isDrone: !!built.isDrone,
      hoverBase: hoverBase
    };
  }

  function spawnParty(units) {
    units.forEach(function (u, i) {
      // Face the camera (not each other) so faces/expressions are always readable.
      spawnUnit(u, PARTY_POS[i] || [0, 0, 6], 0);
    });
  }

  function clearEnemies() {
    Object.keys(models).forEach(function (uid) {
      if (uid.indexOf("enemy-") === 0) {
        scene.remove(models[uid].group);
        disposeGroup(models[uid].group);
        delete models[uid];
      }
    });
  }

  function spawnEnemies(units) {
    clearEnemies();
    var positions = enemyPositions(units.length);
    units.forEach(function (u, i) {
      spawnUnit(u, positions[i] || [0, 0, -3], 0);
    });
  }

  // -------------------------------------------------------------- animation

  function wait(ms) { return new Promise(function (res) { setTimeout(res, ms); }); }

  function addTween(duration, onUpdate, onDone) {
    return new Promise(function (resolve) {
      var start = performance.now();
      tweens.push({
        start: start,
        duration: duration,
        onUpdate: onUpdate,
        onDone: function () { if (onDone) onDone(); resolve(); }
      });
    });
  }

  function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }
  function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function getModel(uid) { return models[uid]; }

  async function playAttack(attackerUid, defenderUid, onImpact) {
    var a = getModel(attackerUid), d = getModel(defenderUid);
    if (!a) return;
    var targetPos = d ? d.group.position : a.group.position;
    var dir = new THREE.Vector3().subVectors(targetPos, a.basePos);
    dir.y = 0;
    var dist = Math.min(dir.length() * 0.42, 3.2);
    dir.normalize();
    var lungeTo = a.basePos.clone().addScaledVector(dir, dist);
    var baseRotY = a.group.rotation.y;
    var facingRotY = Math.atan2(dir.x, dir.z);

    await addTween(220, function (t) {
      var e = easeOutQuad(t);
      a.group.position.lerpVectors(a.basePos, lungeTo, e);
      a.group.rotation.y = baseRotY + (facingRotY - baseRotY) * e;
    });
    if (onImpact) onImpact();
    await wait(60);
    await addTween(260, function (t) {
      var e = easeInOutQuad(t);
      a.group.position.lerpVectors(lungeTo, a.basePos, e);
      a.group.rotation.y = facingRotY + (baseRotY - facingRotY) * e;
    }, function () { a.group.position.copy(a.basePos); a.group.rotation.y = baseRotY; });
  }

  async function playHit(uid) {
    var m = getModel(uid);
    if (!m) return;
    var originalMats = [];
    m.group.traverse(function (obj) {
      if (obj.material && obj.material.color && obj.material.emissive !== undefined) {
        originalMats.push({ mesh: obj, emissive: obj.material.emissive.clone() });
        obj.material.emissive.set(0xffffff);
      }
    });
    var basePos = m.group.position.clone();
    await addTween(260, function (t) {
      var s = Math.sin(t * Math.PI * 5) * (1 - t) * 0.28;
      m.group.position.x = basePos.x + s;
    }, function () {
      m.group.position.copy(basePos);
      originalMats.forEach(function (o) { o.mesh.material.emissive.copy(o.emissive); });
    });
  }

  async function playMiss(uid) {
    var m = getModel(uid);
    if (!m) return;
    var basePos = m.group.position.clone();
    await addTween(320, function (t) {
      m.group.position.y = basePos.y + Math.sin(t * Math.PI) * 0.9;
      m.group.position.x = basePos.x + Math.sin(t * Math.PI * 2) * 0.4;
    }, function () { m.group.position.copy(basePos); });
  }

  async function playGuard(uid) {
    var m = getModel(uid);
    if (!m) return;
    await addTween(180, function (t) {
      var e = easeOutQuad(t);
      m.group.scale.setScalar((1) * (1 - e * 0.12));
    });
  }

  async function playBoostGlow(uid) {
    var m = getModel(uid);
    if (!m) return;
    var meshes = [];
    m.group.traverse(function (obj) { if (obj.material && obj.material.emissive !== undefined) meshes.push(obj); });
    await addTween(700, function (t) {
      var s = Math.sin(t * Math.PI * 3) * 0.5 + 0.5;
      meshes.forEach(function (mesh) { mesh.material.emissive.setRGB(s * 0.8, s * 0.8, s * 0.4); });
    }, function () {
      meshes.forEach(function (mesh) { mesh.material.emissive.setRGB(0, 0, 0); });
    });
  }

  async function playDeath(uid) {
    var m = getModel(uid);
    if (!m) return;
    m.alive = false;
    var meshes = [];
    m.group.traverse(function (obj) { if (obj.material) meshes.push(obj.material); });
    await addTween(700, function (t) {
      m.group.rotation.z = m.facing === Math.PI ? -t * 1.3 : t * 1.3;
      m.group.position.y = m.basePos.y - t * 0.4;
      meshes.forEach(function (mat) { mat.transparent = true; mat.opacity = 1 - t; });
    }, function () { m.group.visible = false; });
  }

  function setGuardIdle(uid, guarding) {
    var m = getModel(uid);
    if (!m) return;
    m.guarding = guarding;
  }

  // ------------------------------------------------------------------ boot

  function init(containerEl) {
    container = containerEl;
    clock = new THREE.Clock();
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 300);
    camera.position.set(0, 15.5, 21);
    camera.lookAt(0, 0.5, -2.5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    toonGradientTex = makeToonGradient();
    buildEnvironment();

    window.addEventListener("resize", onResize);
    requestAnimationFrame(loop);
  }

  function onResize() {
    if (!container || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  function loop(now) {
    requestAnimationFrame(loop);
    var t = clock.getElapsedTime();

    for (var i = tweens.length - 1; i >= 0; i--) {
      var tw = tweens[i];
      var prog = Math.min(1, (performance.now() - tw.start) / tw.duration);
      tw.onUpdate(prog);
      if (prog >= 1) {
        tweens.splice(i, 1);
        tw.onDone();
      }
    }

    Object.keys(models).forEach(function (uid) {
      var m = models[uid];
      if (!m.alive) return;
      var bob = Math.sin(t * 2.2 + m.basePos.x) * (m.isDrone ? 0.35 : 0.12);
      m.inner.position.y = m.hoverBase + bob;
      if (m.isDrone) m.inner.rotation.y = t * 0.6;
    });

    if (ambientMotes) {
      var pos = ambientMotes.geometry.attributes.position;
      for (var p = 0; p < pos.count; p++) {
        var y = pos.getY(p) + 0.01;
        if (y > 14) y = 0;
        pos.setY(p, y);
      }
      pos.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  global.Engine = {
    init: init,
    spawnParty: spawnParty,
    spawnEnemies: spawnEnemies,
    clearEnemies: clearEnemies,
    playAttack: playAttack,
    playHit: playHit,
    playMiss: playMiss,
    playGuard: playGuard,
    playBoostGlow: playBoostGlow,
    playDeath: playDeath,
    wait: wait
  };
})(window);
