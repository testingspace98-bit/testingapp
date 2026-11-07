// Deterministic cartoon renderer: window.setup(timeline) once, then window.draw(t) per frame.
// Every visual is a pure function of time, so frames can be rendered in any order.
"use strict";

const W = 1080, H = 1920;
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, u) => a + (b - a) * u;
const easeIO = (u) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(u, 0, 1));
const easeOut = (u) => 1 - Math.pow(1 - clamp(u, 0, 1), 3);
const backOut = (u) => { u = clamp(u, 0, 1); const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
const INK = "#1f2a52";

function shade(hex, f) { // f<0 darker, f>0 lighter
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const m = (c) => Math.round(f < 0 ? c * (1 + f) : c + (255 - c) * f);
  return "#" + [m(r), m(g), m(b)].map((c) => c.toString(16).padStart(2, "0")).join("");
}
function rand(seed) { // small deterministic PRNG
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function setT(id, tr) { const e = $(id); if (e) e.setAttribute("transform", tr); }
function setA(id, k, v) { const e = $(id); if (e) e.setAttribute(k, v); }

// ---------------------------------------------------------------- scenes
const SCENES = {
  hill: {
    ground(x) {
      if (x < 380) return 1450;
      if (x > 800) return 880;
      return 1450 - 570 * (1 - Math.cos(Math.PI * (x - 380) / 420)) / 2;
    },
    svg(g) {
      let d = "M 0 " + g(0);
      for (let x = 0; x <= W; x += 10) d += ` L ${x} ${g(x).toFixed(1)}`;
      const trail = d;
      d += ` L ${W} ${H} L 0 ${H} Z`;
      const r = rand(11);
      let flowers = "";
      for (let i = 0; i < 16; i++) {
        const x = 30 + r() * 1020, y = g(x) + 30 + r() * 300;
        const c = ["#ff7aa2", "#ffd23f", "#ffffff", "#b388ff"][i % 4];
        flowers += flower(x, y, 0.8 + r() * 0.6, c);
      }
      return `
        ${farHills(1240, "#b9e6a6", 3)}${farHills(1330, "#9bd98a", 7)}
        <path d="${d}" fill="url(#grass)" stroke="${shade("#5cb85c", -0.35)}" stroke-width="6"/>
        <path d="${trail}" transform="translate(0,26)" fill="none" stroke="#e8d7a5" stroke-width="22" stroke-linecap="round" stroke-dasharray="40 26" opacity=".7"/>
        ${flowers}
        <g transform="translate(770,${g(770)})">
          <rect x="-6" y="-210" width="12" height="210" rx="6" fill="#8d6e63" stroke="${INK}" stroke-width="4"/>
          <path id="flag" d="" fill="#ff4d5e" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        </g>`;
    },
    tick(t) {
      const w = (k) => (Math.sin(t * 5 + k) * 10).toFixed(1);
      setA("flag", "d", `M 6 -205 Q 50 ${-200 + +w(0)} 96 ${-185 + +w(1)} Q 50 ${-165 + +w(2)} 6 -150 Z`);
    },
  },
  river: {
    ground(x) {
      if (x < 330 || x > 770) return 1450;
      if (Math.abs(x - 460) < 75 || Math.abs(x - 655) < 75) return 1478;
      return 1540;
    },
    svg() {
      const r = rand(5);
      let reeds = "";
      for (const x of [300, 318, 790, 805, 1050]) reeds += `<path d="M ${x} 1460 q ${-8 + r() * 16} -60 ${-4 + r() * 8} -110" stroke="#3e8e41" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="${x - 1}" cy="1360" rx="7" ry="20" fill="#8d5a3b"/>`;
      let flowers = "";
      for (let i = 0; i < 12; i++) {
        const left = i % 2 === 0;
        const x = left ? 20 + r() * 270 : 820 + r() * 240;
        flowers += flower(x, 1500 + r() * 360, 0.8 + r() * 0.6, ["#ff7aa2", "#ffd23f", "#fff", "#b388ff"][i % 4]);
      }
      return `
        ${farHills(1250, "#b9e6a6", 4)}${farHills(1340, "#9bd98a", 9)}
        <rect x="300" y="1470" width="500" height="460" fill="url(#water)"/>
        <g id="waves" fill="none" stroke="#e1f7ff" stroke-width="6" stroke-linecap="round" opacity=".8"></g>
        <path d="M 0 1450 L 330 1450 Q 352 1452 360 1500 L 350 1920 L 0 1920 Z" fill="url(#grass)" stroke="${shade("#5cb85c", -0.35)}" stroke-width="6"/>
        <path d="M 1080 1450 L 770 1450 Q 748 1452 740 1500 L 750 1920 L 1080 1920 Z" fill="url(#grass)" stroke="${shade("#5cb85c", -0.35)}" stroke-width="6"/>
        ${stone(460)}${stone(655)}${reeds}${flowers}`;
    },
    tick(t) {
      let d = "";
      for (const [y, ph, amp] of [[1545, 0, 6], [1640, 2, 7], [1760, 4, 8], [1860, 1, 8]]) {
        const off = ((t * 60 + ph * 40) % 120);
        for (let x0 = 370 - 120 + off; x0 < 740; x0 += 120) {
          const a = Math.max(380, x0), b = Math.min(730, x0 + 60);
          if (b - a > 10) d += `M ${a} ${y} Q ${(a + b) / 2} ${y - amp} ${b} ${y} `;
        }
      }
      $("waves").innerHTML = `<path d="${d}"/>`;
    },
  },
};

function farHills(y, color, seed) {
  const r = rand(seed);
  let d = `M 0 ${H} L 0 ${y}`;
  for (let x = 0; x <= W + 200; x += 220) {
    d += ` Q ${x + 110} ${y - 90 - r() * 90} ${x + 220} ${y - r() * 30}`;
  }
  return `<path d="${d} L ${W} ${H} Z" fill="${color}"/>`;
}
function flower(x, y, s, c) {
  let p = "";
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    p += `<circle cx="${(Math.cos(a) * 9).toFixed(1)}" cy="${(Math.sin(a) * 9).toFixed(1)}" r="8" fill="${c}" stroke="${INK}" stroke-width="2.5"/>`;
  }
  return `<g transform="translate(${x.toFixed(0)},${y.toFixed(0)}) scale(${s.toFixed(2)})"><path d="M0 0 L0 26" stroke="#2e7d32" stroke-width="4"/>${p}<circle r="6" fill="#ffb300" stroke="${INK}" stroke-width="2.5"/></g>`;
}
function stone(x) {
  return `<g transform="translate(${x},1500)"><ellipse rx="86" ry="34" fill="#8e99a6" stroke="${INK}" stroke-width="6"/><ellipse cx="-14" cy="-12" rx="50" ry="12" fill="#b9c3cd"/></g>`;
}
function cloud(id, x, y, s) {
  return `<g id="${id}" transform="translate(${x},${y}) scale(${s})"><g fill="#fff" stroke="#d6ecfa" stroke-width="4">
    <ellipse cx="0" cy="0" rx="95" ry="48"/><circle cx="-45" cy="-22" r="45"/><circle cx="25" cy="-42" r="58"/><circle cx="72" cy="-8" r="40"/></g></g>`;
}

// ---------------------------------------------------------------- faces
const EXPR = {
  happy:      { tilt: 0,   by: 0,   curve: 12,  w: 22, open: 0,    eye: 1.0 },
  excited:    { tilt: -6,  by: -9,  curve: 18,  w: 27, open: 0.45, eye: 1.08 },
  worried:    { tilt: 20,  by: -5,  curve: -3,  w: 15, open: 0,    eye: 1.0 },
  sad:        { tilt: 24,  by: 0,   curve: -11, w: 17, open: 0,    eye: 0.92 },
  scared:     { tilt: 22,  by: -12, curve: -5,  w: 14, open: 0.35, eye: 1.18 },
  determined: { tilt: -20, by: 3,   curve: 5,   w: 18, open: 0,    eye: 0.95 },
};
const LOOK = { ahead: [5, 1], up: [4, -7], down: [3, 6] };

function faceSVG(p, x, y, s, beak) {
  const eye = (side, ex) => `
    <g id="${p}-eye${side}"><ellipse cx="${ex}" cy="0" rx="15" ry="18" fill="#fff" stroke="${INK}" stroke-width="4"/>
      <g id="${p}-pup${side}"><circle cx="${ex}" cy="0" r="9" fill="${INK}"/><circle cx="${ex + 3}" cy="-4" r="3.4" fill="#fff"/></g></g>`;
  return `<g transform="translate(${x},${y}) scale(${s})">
    <ellipse cx="-34" cy="22" rx="12" ry="7" fill="#ff8fab" opacity=".55"/><ellipse cx="38" cy="22" rx="12" ry="7" fill="#ff8fab" opacity=".55"/>
    ${eye("L", -18)}${eye("R", 20)}
    <path id="${p}-browL" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path id="${p}-browR" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/>
    ${beak ? "" : `<path id="${p}-mouth" transform="translate(2,30)" fill="#7a2636" stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`}
  </g>`;
}

function applyFace(p, e, talk, blink, look, beak) {
  const k = Math.sin((e.tilt * Math.PI) / 180) * 11;
  const y0 = -30 + e.by;
  setA(`${p}-browL`, "d", `M -29 ${(y0 + k).toFixed(1)} L -7 ${(y0 - k).toFixed(1)}`);
  setA(`${p}-browR`, "d", `M 9 ${(y0 - k).toFixed(1)} L 31 ${(y0 + k).toFixed(1)}`);
  const es = e.eye * blink;
  setT(`${p}-eyeL`, `translate(-18,0) scale(${e.eye.toFixed(3)},${es.toFixed(3)}) translate(18,0)`);
  setT(`${p}-eyeR`, `translate(20,0) scale(${e.eye.toFixed(3)},${es.toFixed(3)}) translate(-20,0)`);
  const lk = LOOK[look] || LOOK.ahead;
  setT(`${p}-pupL`, `translate(${lk[0]},${lk[1]})`);
  setT(`${p}-pupR`, `translate(${lk[0]},${lk[1]})`);
  if (beak) return;
  const open = clamp(e.open + talk, 0, 1.2);
  const c = e.curve, w = e.w + talk * 4;
  const top = c > 0 ? c * 0.35 : c;
  const bot = Math.max(top, c) + open * 34;
  setA(`${p}-mouth`, "d", `M ${-w} 0 Q 0 ${top.toFixed(1)} ${w} 0 Q 0 ${bot.toFixed(1)} ${-w} 0 Z`);
}

// ---------------------------------------------------------------- characters
const KINDS = {
  turtle: {
    svg(p, c) {
      const skin = shade(c, 0.45), dark = shade(c, -0.3);
      const leg = (id, x, col) => `<g id="${p}-${id}"><ellipse cx="${x}" cy="-24" rx="26" ry="30" fill="${col}" stroke="${INK}" stroke-width="5"/></g>`;
      return `
        <path d="M -112 -52 L -150 -40 L -112 -30 Z" fill="${skin}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        ${leg("lb2", -28, shade(skin, -0.15))}${leg("lf2", 88, shade(skin, -0.15))}
        <g id="${p}-head" >
          <ellipse cx="108" cy="-78" rx="34" ry="28" fill="${skin}" stroke="${INK}" stroke-width="5"/>
          <circle cx="148" cy="-112" r="62" fill="${skin}" stroke="${INK}" stroke-width="5"/>
          ${faceSVG(p, 168, -122, 1.0, false)}
        </g>
        ${leg("lb", -64, skin)}${leg("lf", 52, skin)}
        <rect x="-122" y="-62" width="244" height="30" rx="15" fill="#f2cf6b" stroke="${INK}" stroke-width="5"/>
        <path d="M -116 -54 C -116 -190 116 -190 116 -54 Z" fill="${c}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
        <path d="M -30 -150 L 30 -150 L 46 -110 L 20 -76 L -20 -76 L -46 -110 Z" fill="${shade(c, 0.25)}" stroke="${dark}" stroke-width="4"/>
        <path d="M -98 -78 L -60 -110 L -40 -76 Z M 98 -78 L 60 -110 L 40 -76 Z" fill="${shade(c, 0.25)}" stroke="${dark}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M -70 -150 Q -40 -170 -10 -168" stroke="#fff" stroke-width="8" stroke-linecap="round" fill="none" opacity=".45"/>`;
    },
    pose(p, st) {
      const ph = st.walkPhase;
      const a = Math.sin(ph), b = Math.sin(ph + Math.PI);
      const lift = (v) => `translate(${(v * 10).toFixed(1)},${(-Math.max(0, v) * 12).toFixed(1)})`;
      setT(`${p}-lf`, lift(st.moving ? a : 0)); setT(`${p}-lb`, lift(st.moving ? b : 0));
      setT(`${p}-lf2`, lift(st.moving ? b : 0)); setT(`${p}-lb2`, lift(st.moving ? a : 0));
      const look = st.look === "up" ? -14 : st.look === "down" ? 12 : 0;
      const nod = st.talk * 5 + (st.pose === "cheer" ? -10 : 0);
      setT(`${p}-head`, `rotate(${(look + nod).toFixed(1)} 110 -80)`);
    },
  },
  bunny: {
    svg(p, c) {
      const line = shade(c, -0.25), pink = "#ffb3c7";
      return `
        <circle cx="-62" cy="-72" r="24" fill="#fff" stroke="${INK}" stroke-width="5"/>
        <ellipse id="${p}-ft2" cx="-18" cy="-12" rx="40" ry="15" fill="${shade(c, -0.08)}" stroke="${INK}" stroke-width="5"/>
        <g id="${p}-arm2"><ellipse cx="-30" cy="-112" rx="16" ry="30" fill="${shade(c, -0.08)}" stroke="${INK}" stroke-width="5"/></g>
        <ellipse cx="0" cy="-88" rx="64" ry="82" fill="${c}" stroke="${INK}" stroke-width="6"/>
        <ellipse cx="14" cy="-78" rx="38" ry="52" fill="#fff"/>
        <ellipse id="${p}-ft" cx="34" cy="-12" rx="42" ry="16" fill="${c}" stroke="${INK}" stroke-width="5"/>
        <g id="${p}-head">
          <g id="${p}-earL"><ellipse cx="-20" cy="-275" rx="23" ry="72" fill="${c}" stroke="${INK}" stroke-width="6"/><ellipse cx="-20" cy="-268" rx="11" ry="52" fill="${pink}"/></g>
          <g id="${p}-earR"><ellipse cx="26" cy="-282" rx="23" ry="72" fill="${c}" stroke="${INK}" stroke-width="6"/><ellipse cx="26" cy="-275" rx="11" ry="52" fill="${pink}"/></g>
          <circle cx="10" cy="-196" r="74" fill="${c}" stroke="${INK}" stroke-width="6"/>
          <path d="M 70 -186 l 34 -6 M 70 -178 l 34 4 M -48 -186 l -32 -6 M -48 -178 l -32 4" stroke="${line}" stroke-width="3" stroke-linecap="round"/>
          ${faceSVG(p, 14, -204, 1.05, false)}
          <path d="M 10 -184 l 8 -8 l -16 0 Z" fill="#ff6f91" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
        </g>
        <g id="${p}-arm"><ellipse cx="44" cy="-112" rx="16" ry="30" fill="${c}" stroke="${INK}" stroke-width="5"/></g>`;
    },
    pose(p, st, t) {
      const sway = Math.sin(t * 2.3) * 4;
      const droop = ["sad", "scared", "worried"].includes(st.expr) ? 28 : 0;
      const perk = st.pose === "cheer" ? -10 : 0;
      setT(`${p}-earL`, `rotate(${(-6 - droop + sway + perk).toFixed(1)} -20 -220)`);
      setT(`${p}-earR`, `rotate(${(6 + droop * 0.7 + sway * 0.8 - perk).toFixed(1)} 26 -225)`);
      const up = st.pose === "cheer" ? -150 + Math.sin(t * 12) * 18 : st.airborne ? -70 : 0;
      setT(`${p}-arm`, `rotate(${up.toFixed(1)} 44 -136)`);
      setT(`${p}-arm2`, `rotate(${(up * 0.9).toFixed(1)} -30 -136)`);
      const look = st.look === "up" ? -8 : st.look === "down" ? 10 : 0;
      setT(`${p}-head`, `rotate(${(look + st.talk * 4).toFixed(1)} 10 -130)`);
    },
  },
  bird: {
    flies: true,
    svg(p, c) {
      const belly = shade(c, 0.55), dark = shade(c, -0.25);
      return `
        <g id="${p}-wing2"><ellipse cx="-12" cy="-22" rx="44" ry="22" fill="${dark}" stroke="${INK}" stroke-width="5"/></g>
        <path d="M -48 6 L -92 -10 L -86 14 L -96 30 L -50 22 Z" fill="${dark}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        <ellipse cx="-6" cy="-70" rx="9" ry="20" fill="${dark}" stroke="${INK}" stroke-width="4" transform="rotate(-25 -6 -50)"/>
        <ellipse cx="8" cy="-72" rx="9" ry="22" fill="${dark}" stroke="${INK}" stroke-width="4"/>
        <circle cx="0" cy="0" r="58" fill="${c}" stroke="${INK}" stroke-width="6"/>
        <ellipse cx="12" cy="20" rx="36" ry="30" fill="${belly}"/>
        <path d="M 30 50 l -6 18 M 40 48 l 0 18" stroke="#ff9f1c" stroke-width="5" stroke-linecap="round"/>
        ${faceSVG(p, 16, -14, 0.92, true)}
        <g id="${p}-beakLo"><path d="M 46 2 L 84 10 L 46 18 Z" fill="#f08c00" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/></g>
        <path d="M 44 -12 L 92 2 L 44 8 Z" fill="#ffb703" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
        <g id="${p}-wing"><ellipse cx="-14" cy="6" rx="42" ry="24" fill="${shade(c, 0.12)}" stroke="${INK}" stroke-width="5"/></g>`;
    },
    pose(p, st, t) {
      const speed = st.moving ? 22 : 9;
      const f = Math.sin(t * speed) * (st.moving ? 38 : 24);
      setT(`${p}-wing`, `rotate(${(-20 + f).toFixed(1)} 16 0)`);
      setT(`${p}-wing2`, `rotate(${(-10 - f * 0.8).toFixed(1)} 16 -20)`);
      setT(`${p}-beakLo`, `rotate(${(st.talk * 26).toFixed(1)} 46 8)`);
    },
  },
};

// ---------------------------------------------------------------- timeline state
let TL, SC, CH = {}, CAP = { key: null }, BURSTS = [];

function stateTrack(cid) {
  // expression / pose / look / face changes, in time order
  const s = TL.story.characters[cid].start;
  const track = [{ t: -1, expr: "happy", pose: "idle", look: "ahead", face: s.face || 1 }];
  for (const b of TL.beats) {
    const a = (b.act || {})[cid];
    if (!a) continue;
    const prev = track[track.length - 1];
    track.push({ t: b.start, expr: a.expr || prev.expr, pose: a.pose || prev.pose, look: a.look || prev.look,
                 face: a.face || prev.face, prevExpr: prev.expr });
  }
  return track;
}

function position(cid, t) {
  const c = CH[cid], s = c.def.start, g = SC.ground;
  let x = s.x, y = c.flies ? s.y : g(s.x);
  const out = { moving: false, airborne: false, move: null, u: 0 };
  for (const seg of TL.segments[cid] || []) {
    if (t < seg.t0) break;
    const u = clamp((t - seg.t0) / (seg.t1 - seg.t0), 0, 1);
    const active = t < seg.t1;
    if (seg.move === "walk") {
      x = lerp(x, seg.to, easeIO(u)); y = g(x);
    } else if (seg.move === "slide") {
      x = lerp(x, seg.to, easeOut(u)); y = g(x);
    } else if (seg.move === "fly") {
      const e = easeIO(u);
      const nx = lerp(x, seg.to[0], e), ny = lerp(y, seg.to[1], e) - Math.sin(Math.PI * e) * 70;
      x = nx; y = ny;
    } else if (seg.move === "jump") {
      const n = seg.path.length, k = Math.min(n - 1, Math.floor(u * n)), v = u * n - k;
      const from = k === 0 ? x : seg.path[k - 1], to = seg.path[k];
      if (u >= 1) { x = seg.path[n - 1]; y = g(x); }
      else {
        x = lerp(from, to, v);
        y = lerp(g(from), g(to), v) - 4 * 190 * v * (1 - v);
        out.hopV = v; out.airborne = v > 0.06 && v < 0.94;
      }
    }
    if (active) { out.moving = true; out.move = seg.move; out.u = u; }
  }
  out.x = x; out.y = y;
  return out;
}

function exprAt(track, t) {
  let cur = track[0];
  for (const s of track) if (s.t <= t) cur = s;
  const e1 = EXPR[cur.expr] || EXPR.happy;
  const e0 = EXPR[cur.prevExpr] || e1;
  const u = easeIO((t - cur.t) / 0.22);
  const e = {};
  for (const k in e1) e[k] = lerp(e0[k], e1[k], u);
  return { cur, e };
}

function talkAt(cid, t) {
  for (const b of TL.beats) {
    if (b.speaker !== cid || t < b.start || t > b.speechEnd + 0.05) continue;
    const f = (t - b.start) * TL.fps;
    const i = Math.floor(f), fr = f - i;
    const a = b.env[i] || 0, c = b.env[i + 1] || 0;
    return lerp(a, c, fr);
  }
  return 0;
}

function blinkAt(cid, t) {
  const r = rand(cid.length * 97 + cid.charCodeAt(0));
  let at = 0.8 + r() * 2;
  while (at < t + 1) {
    const d = t - at;
    if (d >= 0 && d < 0.14) return 0.12 + 0.88 * Math.abs(d - 0.07) / 0.07;
    at += 2.2 + r() * 2.6;
  }
  return 1;
}

function drawChar(cid, t) {
  const c = CH[cid], p = cid;
  const pos = position(cid, t);
  const { cur, e } = exprAt(c.track, t);
  const talk = talkAt(cid, t);
  const st = { moving: pos.moving && (pos.move === "walk" || pos.move === "fly"), airborne: pos.airborne,
               look: cur.look, pose: cur.pose, expr: cur.expr, talk, walkPhase: t * 13 };

  let bob = 0, sx = 1, sy = 1, rot = 0, jitter = 0, groundRot = 0;
  const s = c.def.start.scale || 1;
  if (!c.flies) {
    const g = SC.ground, dx = 6;
    groundRot = (Math.atan2(g(pos.x + dx) - g(pos.x - dx), 2 * dx) * 180) / Math.PI;
    rot = clamp(groundRot * 0.6, -28, 28);
  }
  if (pos.move === "walk" && pos.moving) bob = Math.abs(Math.sin(t * 6.5)) * 9;
  else if (pos.move === "slide" && pos.moving) { rot += Math.sin(t * 30) * 6 * (1 - pos.u); }
  else if (pos.move === "jump" && pos.moving) {
    const v = pos.hopV ?? 1;
    const land = v < 0.08 ? 1 - v / 0.08 : v > 0.92 ? (v - 0.92) / 0.08 : 0;
    sy = 1 - 0.14 * land + (pos.airborne ? 0.08 : 0); sx = 1 + 0.12 * land - (pos.airborne ? 0.05 : 0);
    rot += pos.airborne ? (0.5 - v) * -18 : 0;
  } else if (c.flies) {
    bob = Math.sin(t * 3.1) * 12;
  } else if (cur.pose === "bounce" || cur.pose === "cheer") {
    const h = cur.pose === "cheer" ? 46 : 24, fq = cur.pose === "cheer" ? 2.2 : 1.7;
    const ph = (t - cur.t) * fq % 1;
    bob = Math.sin(Math.PI * ph) * h;
    const sq = ph < 0.1 || ph > 0.9 ? 0.08 : 0;
    sy = 1 - sq; sx = 1 + sq;
  } else if (cur.pose === "shiver") {
    jitter = Math.sin(t * 70) * 3; sy = 0.97; sx = 1.02;
  } else if (cur.pose === "crouch") {
    const u = easeOut((t - cur.t) / 0.4);
    sy = 1 - 0.12 * u; sx = 1 + 0.08 * u;
  } else {
    sy = 1 + Math.sin(t * 2.6 + cid.length) * 0.012; // breathing
  }
  if (talk > 0.05 && !pos.moving && !c.flies) sy *= 1 + talk * 0.015;

  setT(`${p}-root`, `translate(${(pos.x + jitter).toFixed(1)},${(pos.y - bob).toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${(s * cur.face).toFixed(3)},${s})`);
  setT(`${p}-body`, `scale(${sx.toFixed(3)},${sy.toFixed(3)})`);
  const shadowY = c.flies ? 0 : (pos.y - SC.ground(pos.x) - bob);
  setT(`${p}-shadow`, `translate(${pos.x.toFixed(1)},${SC.ground(pos.x).toFixed(1)}) rotate(${groundRot.toFixed(1)}) scale(${(s * clamp(1 + shadowY / 600, 0.5, 1)).toFixed(3)})`);
  setA(`${p}-shadow`, "opacity", c.flies ? 0 : 0.18);
  KINDS[c.def.kind].pose(p, st, t);
  applyFace(p, e, talk * (c.flies ? 1 : 0.95), blinkAt(cid, t), cur.look, c.flies);
  return pos;
}

// ---------------------------------------------------------------- overlays
function captions(t) {
  let beat = null;
  for (const b of TL.beats) if (t >= b.start && t <= b.speechEnd + 0.3) beat = b;
  const wrap = $("capwrap");
  if (!beat || t >= TL.outroStart) { wrap.style.opacity = 0; CAP.key = null; return; }
  wrap.style.opacity = 1;
  let ci = 0;
  beat.chunks.forEach((ch, i) => { if (t >= ch[0].s - 0.08) ci = i; });
  const chunk = beat.chunks[ci];
  const key = beat.start + ":" + ci;
  if (CAP.key !== key) {
    $("cap").innerHTML = chunk.map((w) => `<span>${w.w}</span>`).join(" ");
    const sp = beat.speaker === "narrator" ? null : TL.story.characters[beat.speaker];
    const pill = $("pill");
    pill.style.display = sp ? "inline-block" : "none";
    if (sp) { pill.textContent = sp.name; pill.style.background = sp.kind === "bunny" ? "#b388ff" : sp.color; }
    CAP.key = key; CAP.t0 = chunk[0].s - 0.08;
  }
  const pop = backOut((t - CAP.t0) / 0.18);
  $("cap").style.transform = `scale(${(0.82 + 0.18 * pop).toFixed(3)})`;
  const spans = $("cap").children;
  chunk.forEach((w, i) => {
    const on = t >= w.s - 0.03 && (t < w.e + 0.05 || i === chunk.length - 1 && t < beat.speechEnd + 0.3);
    spans[i].className = on ? "on" : "";
    spans[i].style.transform = on ? "scale(1.1)" : "scale(1)";
  });
}

function titleCard(t) {
  const el = $("title");
  const inU = backOut(t / 0.45), out = clamp((t - 2.7) / 0.35, 0, 1);
  el.style.opacity = t < 0 ? 0 : 1 - out;
  el.style.transform = `translateY(${(-out * 40).toFixed(1)}px) rotate(-3deg) scale(${(0.5 + 0.5 * inU).toFixed(3)})`;
}

function outro(t) {
  const u = t - TL.outroStart;
  $("shade").style.opacity = (clamp(u / 0.4, 0, 1) * 0.35).toFixed(3);
  const card = $("card");
  card.style.opacity = u < 0 ? 0 : clamp(u / 0.15, 0, 1);
  card.style.transform = `scale(${(0.6 + 0.4 * backOut(u / 0.5)).toFixed(3)})`;
  const f = $("follow");
  f.style.transform = `scale(${(1 + (u > 0.8 ? Math.sin((u - 0.8) * 7) * 0.05 : 0)).toFixed(3)})`;
  // confetti
  const r = rand(3);
  let d = "";
  if (u > 0) {
    const cols = ["#ff4d5e", "#ffd23f", "#4caf50", "#3d9df3", "#b388ff"];
    for (let i = 0; i < 46; i++) {
      const x0 = r() * W, sp = 380 + r() * 420, rot = r() * 360, c = cols[i % 5], sz = 14 + r() * 12, delay = r() * 0.5;
      const tt = u - delay;
      if (tt < 0) continue;
      const y = -40 + tt * sp, x = x0 + Math.sin(tt * 3 + i) * 40;
      d += `<rect x="${(-sz / 2).toFixed(1)}" y="-6" width="${sz.toFixed(1)}" height="12" rx="3" fill="${c}" transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${(rot + tt * 260).toFixed(0)})"/>`;
    }
  }
  $("confetti").innerHTML = d;
}

function star(x, y, r, fill) {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r;
    d += (i ? "L" : "M") + (x + Math.cos(a) * rr).toFixed(1) + " " + (y + Math.sin(a) * rr).toFixed(1);
  }
  return `<path d="${d}Z" fill="${fill}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
}

function bursts(t, positions) {
  let d = "";
  for (const b of BURSTS) {
    const u = (t - b.t) / 1.3;
    if (u < 0 || u > 1) continue;
    const p = positions[b.cid];
    if (!p) continue;
    const cx = p.x, cy = p.y - 190 * (CH[b.cid].def.start.scale || 1);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + 0.3;
      const dist = 60 + easeOut(u) * 230;
      const sz = (1 - u) * (i % 2 ? 16 : 24);
      d += star(cx + Math.cos(a) * dist, cy + Math.sin(a) * dist * 0.8 - u * 40, sz, i % 3 ? "#ffd23f" : "#ffffff");
    }
  }
  $("fx").innerHTML = d;
}

// ---------------------------------------------------------------- entry points
window.setup = function (tl) {
  TL = tl;
  SC = SCENES[tl.story.scene];
  const chars = tl.story.characters;
  let charSVG = "", shadows = "";
  for (const cid of Object.keys(chars)) {
    const def = chars[cid];
    CH[cid] = { def, flies: !!KINDS[def.kind].flies, track: null };
    shadows += `<ellipse id="${cid}-shadow" cx="0" cy="4" rx="110" ry="16" fill="#1f2a52" opacity=".18"/>`;
    charSVG += `<g id="${cid}-root"><g id="${cid}-body">${KINDS[def.kind].svg(cid, def.color)}</g></g>`;
  }
  $("svg").innerHTML = `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6ec6ff"/><stop offset=".55" stop-color="#bfe8ff"/><stop offset="1" stop-color="#fff5d6"/></linearGradient>
      <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ed957"/><stop offset="1" stop-color="#4caf50"/></linearGradient>
      <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fc3f7"/><stop offset="1" stop-color="#1e88e5"/></linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    <g id="sun" transform="translate(150,640)"><g id="rays"></g><circle r="78" fill="#ffd54f" stroke="#ffb300" stroke-width="8"/></g>
    ${cloud("c1", 200, 900, 1)}${cloud("c2", 760, 1010, 0.8)}${cloud("c3", 520, 760, 0.6)}
    <g id="world">${SC.svg(SC.ground)}${shadows}${charSVG}</g>
    <g id="fx"></g><g id="confetti"></g>`;
  // sun rays
  let rays = "";
  for (let i = 0; i < 12; i++) rays += `<rect x="-7" y="-128" width="14" height="34" rx="7" fill="#ffd54f" transform="rotate(${i * 30})"/>`;
  $("rays").innerHTML = rays;
  for (const cid of Object.keys(chars)) CH[cid].track = stateTrack(cid);
  // sparkle bursts follow whoever is cheering at that moment
  for (const s of tl.sfx) {
    if (s.name !== "sparkle" || s.t >= tl.outroStart) continue;
    for (const cid of Object.keys(chars)) {
      const st = CH[cid].track.filter((x) => x.t <= s.t + 0.01).pop();
      if (st && st.pose === "cheer") BURSTS.push({ t: s.t, cid });
    }
  }
  $("title").textContent = tl.story.title;
  $("cardH").textContent = tl.story.outro.headline;
  $("cardP").textContent = tl.story.outro.sub;
  return document.fonts.ready.then(() => true);
};

window.draw = function (t) {
  setT("rays", `rotate(${(t * 12).toFixed(1)})`);
  setT("c1", `translate(${(200 + t * 9) % 1400 - 150},900)`);
  setT("c2", `translate(${(760 + t * 6) % 1400 - 150},1010) scale(.8)`);
  setT("c3", `translate(${(520 + t * 4) % 1400 - 150},760) scale(.6)`);
  SC.tick(t);
  // camera: follows the main character(s), smoothed over ±0.6 s, kept inside the world
  // a beat may override the shot with "cam": {"follow": [...], "zoom": z}
  const cam = TL.story.camera || {};
  let fx = 0, fy = 0, zs = 0, n = 0;
  for (let k = -3; k <= 3; k++) {
    const ts = t + k * 0.2;
    let shot = cam;
    for (const b of TL.beats) if (b.start <= ts && b.cam) shot = { ...cam, ...b.cam };
    const follow = shot.follow || Object.keys(CH);
    let bx = 0, by = 0;
    for (const cid of follow) {
      const p = position(cid, ts);
      bx += p.x; by += CH[cid].flies ? p.y : SC.ground(p.x);
    }
    fx += bx / follow.length; fy += by / follow.length; zs += shot.zoom || 1; n++;
  }
  fx /= n; fy /= n;
  const Z = (zs / n) * (1 + 0.03 * (t / TL.duration));
  const sy = cam.groundY || 1420; // where the ground under the character sits on screen
  fx = clamp(fx, 540 / Z, W - 540 / Z);
  fy = Math.min(fy, H - (H - sy) / Z);
  setT("world", `translate(540,${sy}) scale(${Z.toFixed(4)}) translate(${(-fx).toFixed(1)},${(-fy).toFixed(1)})`);
  const positions = {};
  for (const cid of Object.keys(CH)) positions[cid] = drawChar(cid, t);
  bursts(t, positions);
  titleCard(t);
  captions(t);
  outro(t);
};
