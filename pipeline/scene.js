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
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const m = (c) => Math.round(f < 0 ? c * (1 + f) : c + (255 - c) * f);
  return "#" + [m(r), m(g), m(b)].map((c) => c.toString(16).padStart(2, "0")).join("");
}
const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const css = (c) => `rgb(${c.map((v) => Math.round(v)).join(",")})`;
function rand(seed) { // small deterministic PRNG
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function setT(id, tr) { const e = $(id); if (e) e.setAttribute("transform", tr); }
function setA(id, k, v) { const e = $(id); if (e) e.setAttribute(k, v); }

// ---------------------------------------------------------------- sky / time of day / weather
const SKY = {
  day:    { s0: "#5fb8ff", s1: "#bfe6ff", s2: "#fff3d1", tint: "#ffffff", tintA: 0,    sun: [150, 640],  sunA: 1, sunC: "#ffd54f", moonA: 0, starsA: 0,   rain: 0, cloud: "#ffffff", rays: 1 },
  sunset: { s0: "#4a4e9e", s1: "#f08a6c", s2: "#ffd08a", tint: "#ff9a5c", tintA: 0.22, sun: [190, 1170], sunA: 1, sunC: "#ff8f3f", moonA: 0, starsA: 0.25, rain: 0, cloud: "#ffd2c2", rays: 0.6 },
  night:  { s0: "#071232", s1: "#142a5c", s2: "#2c4680", tint: "#22356f", tintA: 0.55, sun: [150, 1500], sunA: 0, sunC: "#ffd54f", moonA: 1, starsA: 1,   rain: 0, cloud: "#3a4f80", rays: 0 },
  dawn:   { s0: "#6f9be0", s1: "#f5b4a0", s2: "#ffe1a3", tint: "#ffc48a", tintA: 0.15, sun: [160, 1190], sunA: 1, sunC: "#ffb347", moonA: 0, starsA: 0.1, rain: 0, cloud: "#fff0e6", rays: 0.7 },
  storm:  { s0: "#46525f", s1: "#75828f", s2: "#9aa4ae", tint: "#56657a", tintA: 0.38, sun: [150, 640],  sunA: 0, sunC: "#ffd54f", moonA: 0, starsA: 0,   rain: 1, cloud: "#6b7684", rays: 0 },
};
function envVec(name, extra) {
  const p = SKY[name] || SKY.day;
  return { s0: rgb(p.s0), s1: rgb(p.s1), s2: rgb(p.s2), tint: rgb(p.tint), tintA: p.tintA, sunX: p.sun[0], sunY: p.sun[1],
           sunA: p.sunA, sunC: rgb(p.sunC), moonA: p.moonA, starsA: p.starsA, rain: extra.rain ?? p.rain,
           cloud: rgb(p.cloud), rays: p.rays, rainbow: extra.rainbow ?? 0 };
}
function blendEnv(a, b, u) {
  const o = {};
  for (const k in a) o[k] = Array.isArray(a[k]) ? a[k].map((v, i) => lerp(v, b[k][i], u)) : lerp(a[k], b[k], u);
  return o;
}

// ---------------------------------------------------------------- scenery helpers
function farHills(y, color, seed) {
  const r = rand(seed);
  let d = `M 0 ${H} L 0 ${y}`;
  for (let x = 0; x <= W + 200; x += 220) d += ` Q ${x + 110} ${y - 90 - r() * 90} ${x + 220} ${y - r() * 30}`;
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
function flowers(n, seed, x0, x1, y0, y1) {
  const r = rand(seed);
  let s = "";
  for (let i = 0; i < n; i++) s += flower(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 0.8 + r() * 0.6, ["#ff7aa2", "#ffd23f", "#ffffff", "#b388ff"][i % 4]);
  return s;
}
function stone(x) {
  return `<g transform="translate(${x},1500)"><ellipse rx="86" ry="34" fill="#8e99a6" stroke="${INK}" stroke-width="6"/><ellipse cx="-14" cy="-12" rx="50" ry="12" fill="#b9c3cd"/></g>`;
}
function cloud(id, x, y, s) {
  return `<g id="${id}" transform="translate(${x},${y}) scale(${s})"><g class="cl" stroke="#00000010" stroke-width="4">
    <ellipse cx="0" cy="0" rx="95" ry="48"/><circle cx="-45" cy="-22" r="45"/><circle cx="25" cy="-42" r="58"/><circle cx="72" cy="-8" r="40"/></g></g>`;
}
function tree(x, y, s, leaf, kind) {
  const trunk = `<path d="M -18 0 Q -12 -90 -14 -170 L 14 -170 Q 12 -90 18 0 Z" fill="#8d5a3b" stroke="${INK}" stroke-width="5"/>`;
  const crown = kind === "pine"
    ? `<path d="M 0 -380 L 95 -210 L 55 -210 L 120 -90 L -120 -90 L -55 -210 L -95 -210 Z" fill="${leaf}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`
    : `<g fill="${leaf}" stroke="${INK}" stroke-width="5"><circle cx="-70" cy="-200" r="70"/><circle cx="70" cy="-205" r="72"/><circle cx="0" cy="-270" r="88"/><circle cx="-20" cy="-180" r="70"/><circle cx="35" cy="-175" r="66"/></g>
       <g fill="${leaf}"><circle cx="-70" cy="-200" r="64"/><circle cx="70" cy="-205" r="66"/><circle cx="0" cy="-270" r="82"/><circle cx="-20" cy="-180" r="64"/><circle cx="35" cy="-175" r="60"/></g>
       <circle cx="-30" cy="-290" r="26" fill="#ffffff" opacity=".18"/>`;
  return `<g transform="translate(${x},${y}) scale(${s})">${trunk}${crown}</g>`;
}
function bush(x, y, s, c) {
  return `<g transform="translate(${x},${y}) scale(${s})" fill="${c}" stroke="${INK}" stroke-width="5"><circle cx="-40" cy="-30" r="40"/><circle cx="35" cy="-34" r="44"/><circle cx="0" cy="-55" r="48"/><rect x="-78" y="-30" width="152" height="30" stroke="none"/></g>`;
}
function mushroom(x, y, s) {
  return `<g transform="translate(${x},${y}) scale(${s})"><rect x="-9" y="-34" width="18" height="34" rx="8" fill="#fff3e0" stroke="${INK}" stroke-width="4"/><path d="M -34 -30 Q 0 -78 34 -30 Z" fill="#ef5350" stroke="${INK}" stroke-width="4"/><circle cx="-10" cy="-46" r="6" fill="#fff"/><circle cx="12" cy="-40" r="5" fill="#fff"/></g>`;
}
const flatGround = (y) => `<rect x="-400" y="${y}" width="${W + 800}" height="${H - y + 400}" fill="url(#grass)"/><path d="M -400 ${y} L ${W + 400} ${y}" stroke="${shade("#5cb85c", -0.35)}" stroke-width="6"/>`;
const BLUR = 'filter="url(#soft)"';

// ---------------------------------------------------------------- scenes
const SCENES = {
  hill: {
    ground(x) {
      if (x < 380) return 1450;
      if (x > 800) return 880;
      return 1450 - 570 * (1 - Math.cos(Math.PI * (x - 380) / 420)) / 2;
    },
    svg(g) {
      let d = "M -400 " + g(0);
      for (let x = 0; x <= W; x += 10) d += ` L ${x} ${g(x).toFixed(1)}`;
      const trail = d;
      d += ` L ${W + 400} ${g(W)} L ${W + 400} ${H + 400} L -400 ${H + 400} Z`;
      let fl = "";
      const r = rand(11);
      for (let i = 0; i < 16; i++) { const x = 30 + r() * 1020; fl += flower(x, g(x) + 30 + r() * 300, 0.8 + r() * 0.6, ["#ff7aa2", "#ffd23f", "#ffffff", "#b388ff"][i % 4]); }
      return `
        <g ${BLUR}>${farHills(1240, "#b9e6a6", 3)}${farHills(1330, "#9bd98a", 7)}</g>
        <path d="${d}" fill="url(#grass)" stroke="${shade("#5cb85c", -0.35)}" stroke-width="6"/>
        <path d="${trail}" transform="translate(0,26)" fill="none" stroke="#e8d7a5" stroke-width="22" stroke-linecap="round" stroke-dasharray="40 26" opacity=".7"/>
        ${fl}
        <g transform="translate(770,${g(770)})">
          <rect x="-6" y="-210" width="12" height="210" rx="6" fill="#8d6e63" stroke="${INK}" stroke-width="4"/>
          <path id="flag" d="" fill="#ff4d5e" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        </g>`;
    },
    tick(t) {
      const w = (k) => Math.sin(t * 5 + k) * 10;
      setA("flag", "d", `M 6 -205 Q 50 ${-200 + w(0)} 96 ${-185 + w(1)} Q 50 ${-165 + w(2)} 6 -150 Z`);
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
      return `
        <g ${BLUR}>${farHills(1250, "#b9e6a6", 4)}${farHills(1340, "#9bd98a", 9)}</g>
        <rect x="300" y="1470" width="500" height="860" fill="url(#water)"/>
        <g id="waves" fill="none" stroke="#e1f7ff" stroke-width="6" stroke-linecap="round" opacity=".8"></g>
        <path d="M -400 1450 L 330 1450 Q 352 1452 360 1500 L 350 2320 L -400 2320 Z" fill="url(#grass)" stroke="${shade("#5cb85c", -0.35)}" stroke-width="6"/>
        <path d="M 1480 1450 L 770 1450 Q 748 1452 740 1500 L 750 2320 L 1480 2320 Z" fill="url(#grass)" stroke="${shade("#5cb85c", -0.35)}" stroke-width="6"/>
        ${stone(460)}${stone(655)}${reeds}${flowers(6, 12, 20, 290, 1500, 1860)}${flowers(6, 13, 820, 1060, 1500, 1860)}`;
    },
    tick(t) {
      let d = "";
      for (const [y, ph, amp] of [[1545, 0, 6], [1640, 2, 7], [1760, 4, 8], [1860, 1, 8]]) {
        const off = (t * 60 + ph * 40) % 120;
        for (let x0 = 370 - 120 + off; x0 < 740; x0 += 120) {
          const a = Math.max(380, x0), b = Math.min(730, x0 + 60);
          if (b - a > 10) d += `M ${a} ${y} Q ${(a + b) / 2} ${y - amp} ${b} ${y} `;
        }
      }
      $("waves").innerHTML = `<path d="${d}"/>`;
    },
  },
  meadow: {
    ground: () => 1450,
    svg() {
      let fence = "";
      for (let x = -60; x <= 300; x += 90) fence += `<rect x="${x}" y="1330" width="22" height="125" rx="6" fill="#c8945f" stroke="${INK}" stroke-width="4"/>`;
      fence += `<rect x="-80" y="1355" width="400" height="16" rx="6" fill="#d9a873" stroke="${INK}" stroke-width="4"/><rect x="-80" y="1400" width="400" height="16" rx="6" fill="#d9a873" stroke="${INK}" stroke-width="4"/>`;
      return `
        <g ${BLUR}>${farHills(1230, "#b9e6a6", 21)}${tree(180, 1300, 0.45, "#8fcf7a", "round")}${tree(640, 1310, 0.38, "#86c873", "round")}${farHills(1330, "#9bd98a", 23)}</g>
        ${flatGround(1450)}
        ${fence}
        ${tree(930, 1460, 1.25, "#5fb84c", "round")}
        ${bush(560, 1458, 0.8, "#4fa845")}
        ${flowers(18, 31, -100, 1180, 1480, 1880)}`;
    },
    tick() {},
  },
  forest: {
    ground: () => 1450,
    svg() {
      const r = rand(41);
      let far = "", mid = "";
      for (let i = 0; i < 9; i++) far += tree(-80 + i * 150 + r() * 40, 1330, 0.55 + r() * 0.2, "#7fb89a", i % 2 ? "pine" : "round");
      for (const [x, k] of [[60, "pine"], [330, "round"], [760, "pine"], [1010, "round"]]) mid += tree(x, 1452, 0.95 + r() * 0.2, k === "pine" ? "#3f8f5a" : "#4f9f4a", k);
      return `
        <g ${BLUR}><rect x="-400" y="1150" width="${W + 800}" height="400" fill="#a7d9b9"/>${far}</g>
        ${flatGround(1450)}
        <path d="M -400 1500 Q 300 1470 540 1500 T 1480 1500 L 1480 1600 Q 700 1570 -400 1610 Z" fill="#e3cf9b" opacity=".75"/>
        ${mid}
        ${bush(180, 1460, 0.7, "#3f9a45")}${bush(890, 1462, 0.75, "#3f9a45")}
        ${mushroom(260, 1500, 0.9)}${mushroom(820, 1530, 1.1)}${mushroom(870, 1515, 0.7)}
        ${flowers(10, 44, -100, 1180, 1560, 1880)}`;
    },
    front() { // dark trunks framing the shot, in front of the characters
      return `<g opacity=".95"><path d="M -160 2400 L -120 900 Q -60 860 -40 900 L 10 2400 Z" fill="#3e2a1f"/><path d="M 1080 2400 L 1110 950 Q 1150 900 1200 950 L 1260 2400 Z" fill="#3e2a1f"/></g>`;
    },
    tick() {},
  },
};

// ---------------------------------------------------------------- faces
const EXPR = {
  happy:      { tilt: 0,   by: 0,   curve: 12,  w: 22, open: 0,    eye: 1.0 },
  excited:    { tilt: -6,  by: -9,  curve: 18,  w: 27, open: 0.45, eye: 1.08 },
  worried:    { tilt: 20,  by: -5,  curve: -3,  w: 15, open: 0,    eye: 1.0 },
  sad:        { tilt: 24,  by: 0,   curve: -11, w: 17, open: 0,    eye: 0.92 },
  scared:     { tilt: 22,  by: -12, curve: -5,  w: 14, open: 0.35, eye: 1.18 },
  determined: { tilt: -20, by: 3,   curve: 5,   w: 18, open: 0,    eye: 0.95 },
  angry:      { tilt: -28, by: 5,   curve: -9,  w: 17, open: 0,    eye: 0.9 },
};
const LOOK = { ahead: [5, 1], up: [4, -7], down: [3, 6] };

function faceSVG(p, x, y, s, beak, mouthY = 30) {
  const eye = (side, ex) => `
    <g id="${p}-eye${side}"><ellipse cx="${ex}" cy="0" rx="15" ry="18" fill="#fff" stroke="${INK}" stroke-width="4"/>
      <g id="${p}-pup${side}"><circle cx="${ex}" cy="0" r="9" fill="${INK}"/><circle cx="${ex + 3}" cy="-4" r="3.4" fill="#fff"/></g></g>`;
  return `<g transform="translate(${x},${y}) scale(${s})">
    <ellipse cx="-34" cy="22" rx="12" ry="7" fill="#ff8fab" opacity=".55"/><ellipse cx="38" cy="22" rx="12" ry="7" fill="#ff8fab" opacity=".55"/>
    ${eye("L", -18)}${eye("R", 20)}
    <path id="${p}-browL" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/>
    <path id="${p}-browR" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/>
    ${beak ? "" : `<path id="${p}-mouth" transform="translate(2,${mouthY})" fill="#7a2636" stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`}
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

// shared biped feet + arms
function walkFeet(p, st) {
  const a = st.moving ? Math.sin(st.walkPhase) : 0;
  setT(`${p}-ft`, `translate(${(a * 12).toFixed(1)},${(-Math.max(0, a) * 10).toFixed(1)})`);
  setT(`${p}-ft2`, `translate(${(-a * 12).toFixed(1)},${(-Math.max(0, -a) * 10).toFixed(1)})`);
}
function arms(p, st, t, ax, ay, ax2) {
  const up = st.pose === "cheer" ? -150 + Math.sin(t * 12) * 18 : st.airborne ? -70 : st.moving ? Math.sin(st.walkPhase) * 18 : 0;
  setT(`${p}-arm`, `rotate(${up.toFixed(1)} ${ax} ${ay})`);
  setT(`${p}-arm2`, `rotate(${(st.pose === "cheer" ? up * 0.9 : -up).toFixed(1)} ${ax2} ${ay})`);
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
        <g id="${p}-head">
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
    pose(p, st, t) {
      const ph = st.walkPhase, wig = st.pose === "flipped" ? Math.sin(t * 18) : 0;
      const a = Math.sin(ph), b = Math.sin(ph + Math.PI);
      const lift = (v) => `translate(${(v * 10).toFixed(1)},${(-Math.max(0, v) * 12).toFixed(1)})`;
      const m = st.moving || wig;
      setT(`${p}-lf`, lift(m ? a || wig : 0)); setT(`${p}-lb`, lift(m ? b || -wig : 0));
      setT(`${p}-lf2`, lift(m ? b || -wig : 0)); setT(`${p}-lb2`, lift(m ? a || wig : 0));
      const look = st.look === "up" ? -14 : st.look === "down" ? 12 : 0;
      const nod = st.talk * 5 + (st.pose === "cheer" ? -10 : 0);
      setT(`${p}-head`, `rotate(${(look + nod).toFixed(1)} 110 -80)`);
    },
  },
  lamb: {
    svg(p, c) {
      const leg = (id, x, col) => `<g id="${p}-${id}"><rect x="${x - 9}" y="-62" width="18" height="62" rx="9" fill="${col}" stroke="${INK}" stroke-width="4"/></g>`;
      const puffs = [[-62, -100, 40], [-25, -132, 46], [22, -134, 46], [60, -104, 40], [0, -88, 52], [-40, -80, 38], [40, -80, 38]];
      const wool = (stroke) => puffs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" ${stroke ? `stroke="${INK}" stroke-width="6"` : ""}/>`).join("");
      return `
        ${leg("lb2", -30, "#5d4a5e")}${leg("lf2", 52, "#5d4a5e")}
        <circle cx="-98" cy="-112" r="22" fill="${c}" stroke="${INK}" stroke-width="5"/>
        ${wool(true)}${wool(false)}
        ${leg("lb", -52, "#4a3b4f")}${leg("lf", 30, "#4a3b4f")}
        <g id="${p}-head">
          <ellipse cx="68" cy="-150" rx="30" ry="13" fill="#e8c9bd" stroke="${INK}" stroke-width="4" transform="rotate(25 68 -150)"/>
          <ellipse cx="112" cy="-138" rx="50" ry="56" fill="#f7e3d9" stroke="${INK}" stroke-width="5"/>
          <ellipse cx="160" cy="-150" rx="30" ry="13" fill="#e8c9bd" stroke="${INK}" stroke-width="4" transform="rotate(-25 160 -150)"/>
          <circle cx="98" cy="-190" r="22" fill="${c}" stroke="${INK}" stroke-width="4"/><circle cx="124" cy="-194" r="20" fill="${c}" stroke="${INK}" stroke-width="4"/>
          <circle cx="98" cy="-190" r="18" fill="${c}"/><circle cx="124" cy="-194" r="16" fill="${c}"/>
          ${faceSVG(p, 116, -142, 0.88, false, 34)}
        </g>`;
    },
    pose: (p, st, t) => KINDS.turtle.pose(p, st, t),
  },
  bunny: {
    svg(p, c) {
      const line = shade(c, -0.25), pink = "#ffb3c7";
      return `
        <circle cx="-62" cy="-72" r="24" fill="#fff" stroke="${INK}" stroke-width="5"/>
        <g id="${p}-ft2"><ellipse cx="-18" cy="-12" rx="40" ry="15" fill="${shade(c, -0.08)}" stroke="${INK}" stroke-width="5"/></g>
        <g id="${p}-arm2"><ellipse cx="-30" cy="-112" rx="16" ry="30" fill="${shade(c, -0.08)}" stroke="${INK}" stroke-width="5"/></g>
        <ellipse cx="0" cy="-88" rx="64" ry="82" fill="${c}" stroke="${INK}" stroke-width="6"/>
        <ellipse cx="14" cy="-78" rx="38" ry="52" fill="#fff"/>
        <g id="${p}-ft"><ellipse cx="34" cy="-12" rx="42" ry="16" fill="${c}" stroke="${INK}" stroke-width="5"/></g>
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
      const perk = st.pose === "cheer" || st.pose === "listen" ? -12 : 0;
      setT(`${p}-earL`, `rotate(${(-6 - droop + sway + perk).toFixed(1)} -20 -220)`);
      setT(`${p}-earR`, `rotate(${(6 + droop * 0.7 + sway * 0.8 - perk).toFixed(1)} 26 -225)`);
      walkFeet(p, st); arms(p, st, t, 44, -136, -30);
      const look = st.look === "up" ? -8 : st.look === "down" ? 10 : 0;
      setT(`${p}-head`, `rotate(${(look + st.talk * 4).toFixed(1)} 10 -130)`);
    },
  },
  fox: {
    svg(p, c) {
      const dark = shade(c, -0.35);
      return `
        <g id="${p}-tail"><path d="M -40 -70 C -120 -60 -190 -120 -150 -200 C -120 -150 -90 -130 -40 -110 Z" fill="${c}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
          <path d="M -150 -200 C -168 -170 -166 -150 -150 -140 C -140 -160 -146 -180 -150 -200 Z" fill="#fff" stroke="${INK}" stroke-width="4"/></g>
        <g id="${p}-ft2"><ellipse cx="-16" cy="-12" rx="30" ry="13" fill="#3a2a2a" stroke="${INK}" stroke-width="4"/></g>
        <g id="${p}-arm2"><ellipse cx="-28" cy="-112" rx="14" ry="30" fill="${dark}" stroke="${INK}" stroke-width="5"/></g>
        <ellipse cx="0" cy="-88" rx="54" ry="76" fill="${c}" stroke="${INK}" stroke-width="6"/>
        <ellipse cx="16" cy="-92" rx="30" ry="50" fill="#fff6ea"/>
        <g id="${p}-ft"><ellipse cx="30" cy="-12" rx="32" ry="13" fill="#3a2a2a" stroke="${INK}" stroke-width="4"/></g>
        <g id="${p}-head">
          <g id="${p}-earL"><path d="M -58 -238 L -38 -330 L -4 -252 Z" fill="${c}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M -44 -250 L -36 -300 L -18 -256 Z" fill="#3a2a2a"/></g>
          <g id="${p}-earR"><path d="M 18 -254 L 52 -332 L 72 -236 Z" fill="${c}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M 32 -254 L 50 -302 L 60 -246 Z" fill="#3a2a2a"/></g>
          <path d="M -70 -205 C -70 -290 90 -290 92 -205 C 92 -160 50 -140 10 -140 C -30 -140 -70 -160 -70 -205 Z" fill="${c}" stroke="${INK}" stroke-width="6"/>
          <path d="M -60 -180 Q -30 -140 10 -142 Q 0 -170 -60 -180 Z" fill="#fff6ea"/>
          <ellipse cx="62" cy="-182" rx="40" ry="24" fill="#fff6ea" stroke="${INK}" stroke-width="5"/>
          <ellipse cx="98" cy="-190" rx="11" ry="9" fill="${INK}"/>
          ${faceSVG(p, 14, -214, 1.0, false, 36)}
        </g>
        <g id="${p}-arm"><ellipse cx="42" cy="-112" rx="14" ry="30" fill="${c}" stroke="${INK}" stroke-width="5"/></g>`;
    },
    pose(p, st, t) {
      const wag = Math.sin(t * (st.pose === "cheer" || st.expr === "excited" ? 14 : 4)) * (st.expr === "sad" ? 3 : 10);
      setT(`${p}-tail`, `rotate(${(wag - (st.expr === "sad" ? -20 : 0)).toFixed(1)} -40 -90)`);
      const droop = ["sad", "scared", "worried"].includes(st.expr) ? 22 : 0;
      setT(`${p}-earL`, `rotate(${(-droop).toFixed(1)} -30 -250)`);
      setT(`${p}-earR`, `rotate(${(droop * 0.8).toFixed(1)} 40 -250)`);
      walkFeet(p, st); arms(p, st, t, 42, -136, -28);
      const look = st.look === "up" ? -8 : st.look === "down" ? 10 : 0;
      setT(`${p}-head`, `rotate(${(look + st.talk * 4).toFixed(1)} 10 -140)`);
    },
  },
  bear: {
    svg(p, c) {
      const tan = "#e2bf92", dark = shade(c, -0.2);
      return `
        <g id="${p}-ft2"><ellipse cx="-30" cy="-14" rx="44" ry="17" fill="${dark}" stroke="${INK}" stroke-width="5"/></g>
        <g id="${p}-arm2"><ellipse cx="-50" cy="-130" rx="22" ry="40" fill="${dark}" stroke="${INK}" stroke-width="5"/></g>
        <ellipse cx="0" cy="-104" rx="88" ry="98" fill="${c}" stroke="${INK}" stroke-width="6"/>
        <ellipse cx="16" cy="-92" rx="54" ry="62" fill="${tan}"/>
        <g id="${p}-ft"><ellipse cx="38" cy="-14" rx="46" ry="18" fill="${c}" stroke="${INK}" stroke-width="5"/></g>
        <g id="${p}-head">
          <circle cx="-52" cy="-300" r="30" fill="${c}" stroke="${INK}" stroke-width="6"/><circle cx="-52" cy="-300" r="15" fill="${tan}"/>
          <circle cx="66" cy="-304" r="30" fill="${c}" stroke="${INK}" stroke-width="6"/><circle cx="66" cy="-304" r="15" fill="${tan}"/>
          <circle cx="8" cy="-232" r="88" fill="${c}" stroke="${INK}" stroke-width="6"/>
          <ellipse cx="22" cy="-196" rx="42" ry="32" fill="${tan}" stroke="${INK}" stroke-width="4"/>
          <ellipse cx="22" cy="-214" rx="15" ry="11" fill="${INK}"/>
          ${faceSVG(p, 12, -250, 1.05, false, 50)}
        </g>
        <g id="${p}-arm"><ellipse cx="66" cy="-130" rx="22" ry="40" fill="${c}" stroke="${INK}" stroke-width="5"/></g>`;
    },
    pose(p, st, t) {
      walkFeet(p, st); arms(p, st, t, 66, -162, -50);
      const look = st.look === "up" ? -8 : st.look === "down" ? 10 : 0;
      setT(`${p}-head`, `rotate(${(look + st.talk * 3).toFixed(1)} 10 -170)`);
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

// ---------------------------------------------------------------- props
const PROPS = {
  basket: {
    svg(id, def) {
      let berries = "";
      const apple = def.fruit === "apple", seed = def.fruit === "seed";
      const pos = [[-40, -62], [-14, -66], [12, -66], [38, -62], [-28, -80], [0, -84], [26, -80], [-12, -98], [14, -98]];
      pos.forEach(([x, y], i) => { berries += `<circle id="${id}-b${i}" cx="${x}" cy="${y}" r="${apple ? 17 : seed ? 11 : 15}" fill="${apple ? "#e53935" : seed ? (i % 2 ? "#8d6e63" : "#a1887f") : i % 3 ? "#d81b60" : "#7b1fa2"}" stroke="${INK}" stroke-width="3"/>`; });
      return `<path d="M -62 -60 Q 0 -150 62 -60" fill="none" stroke="#8d5a3b" stroke-width="9"/>${berries}
        <path d="M -66 -60 L 66 -60 L 52 0 L -52 0 Z" fill="#c68b52" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        <path d="M -60 -40 L 60 -40 M -56 -20 L 56 -20 M -30 -60 L -26 0 M 0 -60 L 0 0 M 30 -60 L 26 0" stroke="#8d5a3b" stroke-width="4"/>`;
    },
    update(id, s) { for (let i = 0; i < 9; i++) setA(`${id}-b${i}`, "opacity", i < Math.round(s.full * 9) ? 1 : 0); },
  },
  apple: {
    svg: () => `<g class="spin"><circle cx="0" cy="-26" r="26" fill="#e53935" stroke="${INK}" stroke-width="4"/><circle cx="-9" cy="-36" r="7" fill="#fff" opacity=".5"/>
      <path d="M 0 -50 L 3 -62" stroke="#5d4037" stroke-width="4" stroke-linecap="round"/><ellipse cx="12" cy="-60" rx="10" ry="5" fill="#66bb6a" stroke="${INK}" stroke-width="2.5"/></g>`,
    update(id, s) { const g = $(id).querySelector(".spin"); g.setAttribute("transform", `rotate(${((s.x / 26) * 57.3).toFixed(1)} 0 -26)`); },
  },
  sprout: {
    svg: (id) => `<ellipse cx="0" cy="2" rx="70" ry="16" fill="#8d6e63" stroke="${INK}" stroke-width="4"/>
      <rect id="${id}-stem" x="-6" y="0" width="12" height="0" rx="6" fill="#7b5a3c" stroke="${INK}" stroke-width="4"/>
      <g id="${id}-leaves"><ellipse cx="-22" cy="-10" rx="24" ry="11" fill="#7ed957" stroke="${INK}" stroke-width="4" transform="rotate(-25 -22 -10)"/><ellipse cx="22" cy="-10" rx="24" ry="11" fill="#7ed957" stroke="${INK}" stroke-width="4" transform="rotate(25 22 -10)"/></g>
      <g id="${id}-crown"><g fill="#66bb55" stroke="${INK}" stroke-width="5"><circle cx="-80" cy="0" r="70"/><circle cx="80" cy="0" r="70"/><circle cx="0" cy="-70" r="90"/><circle cx="0" cy="10" r="80"/></g>
        <g fill="#66bb55"><circle cx="-80" cy="0" r="64"/><circle cx="80" cy="0" r="64"/><circle cx="0" cy="-70" r="84"/><circle cx="0" cy="10" r="74"/></g>
        <g id="${id}-bloom">${[[-90, -10], [-40, -90], [30, -110], [80, -20], [0, -20], [-30, 30], [50, 40], [100, -60], [-100, -60]].map(([x, y]) => `<g transform="translate(${x},${y})">${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(Math.cos(a / 57.3) * 9).toFixed(1)}" cy="${(Math.sin(a / 57.3) * 9).toFixed(1)}" r="9" fill="#ffb3d1"/>`).join("")}<circle r="6" fill="#ffd23f"/></g>`).join("")}</g></g>`,
    update(id, s) {
      const g = clamp(s.grow, 0, 1);
      const h = g < 0.05 ? 0 : 20 + g * 280;
      setA(`${id}-stem`, "y", -h); setA(`${id}-stem`, "height", h);
      setA(`${id}-stem`, "width", 10 + g * 26); setA(`${id}-stem`, "x", -(10 + g * 26) / 2);
      const lv = g < 0.05 ? 0 : clamp(g / 0.3, 0, 1);
      setT(`${id}-leaves`, `translate(0,${-h}) scale(${lv.toFixed(3)})`);
      setA(`${id}-leaves`, "opacity", g > 0.55 ? 0 : 1);
      const cr = clamp((g - 0.45) / 0.45, 0, 1);
      setT(`${id}-crown`, `translate(0,${-h}) scale(${(0.15 + 0.85 * easeOut(cr)).toFixed(3)})`);
      setA(`${id}-crown`, "opacity", cr > 0 ? 1 : 0);
      setA(`${id}-bloom`, "opacity", clamp((g - 0.85) / 0.15, 0, 1).toFixed(2));
    },
  },
  lantern: {
    svg: (id) => `<path d="M -14 -64 Q 0 -86 14 -64" stroke="${INK}" stroke-width="4" fill="none"/>
      <rect x="-20" y="-64" width="40" height="10" rx="4" fill="#5d4037" stroke="${INK}" stroke-width="3"/>
      <rect x="-17" y="-54" width="34" height="46" rx="8" fill="#fff3c4" stroke="${INK}" stroke-width="4"/>
      <ellipse id="${id}-flame" cx="0" cy="-30" rx="7" ry="12" fill="#ff9800"/>
      <rect x="-20" y="-10" width="40" height="10" rx="4" fill="#5d4037" stroke="${INK}" stroke-width="3"/>`,
    glow: true,
    update(id, s, t) { setT(`${id}-flame`, `translate(0,-30) scale(${(1 + Math.sin(t * 17) * 0.12).toFixed(3)},${(1 + Math.sin(t * 23) * 0.15).toFixed(3)}) translate(0,30)`); },
  },
};

// ---------------------------------------------------------------- timeline state
let TL, SC, CH = {}, PR = {}, CAP = { key: null }, BURSTS = [], ENVK = [], STARS = [], RAIN = [];

function stateTrack(cid) {
  const s = TL.story.characters[cid].start;
  const track = [{ t: -1, expr: s.expr || "happy", pose: s.pose || "idle", look: "ahead", face: s.face || 1 }];
  for (const b of TL.beats) {
    const a = (b.act || {})[cid];
    if (!a) continue;
    const prev = track[track.length - 1];
    track.push({ t: b.start, expr: a.expr || prev.expr, pose: a.pose || prev.pose, look: a.look || prev.look,
                 face: a.face || prev.face, prevExpr: prev.expr, prevPose: prev.pose });
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
      x = lerp(x, seg.to, easeIO(u)); y = c.flies ? y : g(x);
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

function stateAt(track, t) {
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
    return lerp(b.env[i] || 0, b.env[i + 1] || 0, fr);
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
  const { cur, e } = stateAt(c.track, t);
  const talk = talkAt(cid, t);
  const st = { moving: pos.moving && (pos.move === "walk" || pos.move === "fly"), airborne: pos.airborne,
               look: cur.look, pose: cur.pose, expr: cur.expr, talk, walkPhase: t * 13 };

  let bob = 0, sx = 1, sy = 1, rot = 0, jitter = 0, groundRot = 0, flip = 0;
  const s = c.def.start.scale || 1;
  if (!c.flies) {
    const g = SC.ground, dx = 6;
    groundRot = (Math.atan2(g(pos.x + dx) - g(pos.x - dx), 2 * dx) * 180) / Math.PI;
    rot = clamp(groundRot * 0.6, -28, 28);
  }
  if (pos.move === "walk" && pos.moving) bob = Math.abs(Math.sin(t * 6.5)) * 9;
  else if (pos.move === "slide" && pos.moving) rot += Math.sin(t * 30) * 6 * (1 - pos.u);
  else if (pos.move === "jump" && pos.moving) {
    const v = pos.hopV ?? 1;
    const land = v < 0.08 ? 1 - v / 0.08 : v > 0.92 ? (v - 0.92) / 0.08 : 0;
    sy = 1 - 0.14 * land + (pos.airborne ? 0.08 : 0); sx = 1 + 0.12 * land - (pos.airborne ? 0.05 : 0);
    rot += pos.airborne ? (0.5 - v) * -18 : 0;
  } else if (c.flies) {
    bob = Math.sin(t * 3.1) * 12;
  } else if (cur.pose === "bounce" || cur.pose === "cheer") {
    const h = cur.pose === "cheer" ? 46 : 24, fq = cur.pose === "cheer" ? 2.2 : 1.7;
    const ph = ((t - cur.t) * fq) % 1;
    bob = Math.sin(Math.PI * ph) * h;
    const sq = ph < 0.1 || ph > 0.9 ? 0.08 : 0;
    sy = 1 - sq; sx = 1 + sq;
  } else if (cur.pose === "shiver") {
    jitter = Math.sin(t * 70) * 3; sy = 0.97; sx = 1.02;
  } else if (cur.pose === "crouch" || cur.pose === "sit") {
    const u = easeOut((t - cur.t) / 0.4);
    sy = 1 - 0.12 * u; sx = 1 + 0.08 * u;
  } else {
    sy = 1 + Math.sin(t * 2.6 + cid.length) * 0.012; // breathing
  }
  // turtle-on-its-back pose, eased in and out
  const fu = easeIO((t - cur.t) / 0.45);
  if (cur.pose === "flipped") flip = cur.prevPose === "flipped" ? 1 : fu;
  else if (cur.prevPose === "flipped") flip = 1 - fu;
  if (talk > 0.05 && !pos.moving && !c.flies) sy *= 1 + talk * 0.015;

  const ry = pos.y - bob - Math.sin(Math.PI * flip) * 60;
  setT(`${p}-root`, `translate(${(pos.x + jitter).toFixed(1)},${ry.toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${(s * cur.face).toFixed(3)},${s})`);
  setT(`${p}-body`, `rotate(${(flip * 180).toFixed(1)} 0 -95) scale(${sx.toFixed(3)},${sy.toFixed(3)})`);
  const shadowY = c.flies ? 0 : pos.y - SC.ground(pos.x) - bob;
  setT(`${p}-shadow`, `translate(${pos.x.toFixed(1)},${SC.ground(pos.x).toFixed(1)}) rotate(${groundRot.toFixed(1)}) scale(${(s * clamp(1 + shadowY / 600, 0.5, 1)).toFixed(3)})`);
  setA(`${p}-shadow`, "opacity", c.flies ? 0 : 0.18);
  KINDS[c.def.kind].pose(p, st, t);
  applyFace(p, e, talk * 0.95, blinkAt(cid, t), cur.look, c.flies);
  return { x: pos.x, y: ry, s, face: cur.face };
}

// props: numeric fields ease over the beat's "during" window
function propState(pid, t, chars) {
  const P = PR[pid];
  const st = { x: P.def.x ?? 540, y: P.def.y, full: P.def.full ?? 1, grow: P.def.grow ?? 0, glow: P.def.glow ?? 1,
               show: P.def.show === false ? 0 : 1, attach: P.def.attach || null };
  for (const k of P.keys) {
    if (t < k.t0) break;
    const u = easeIO((t - k.t0) / Math.max(0.01, k.t1 - k.t0));
    for (const f of ["x", "y", "full", "grow", "glow"]) if (k[f] !== undefined) st[f] = lerp(st[f] ?? k[f], k[f], u);
    if (k.show !== undefined) st.show = lerp(st.show, k.show ? 1 : 0, clamp((t - k.t0) / 0.3, 0, 1));
    if (k.attach !== undefined) st.attach = k.attach;
  }
  if (st.attach && chars[st.attach.to]) {
    const c = chars[st.attach.to];
    st.x = c.x + st.attach.dx * c.s * c.face; st.y = c.y + st.attach.dy * c.s;
  }
  if (st.y === undefined || st.y === null) st.y = SC.ground(st.x);
  return st;
}

function drawProps(t, chars) {
  let glow = "";
  for (const pid of Object.keys(PR)) {
    const P = PR[pid], st = propState(pid, t, chars), kind = PROPS[P.def.kind];
    const sc = P.def.scale || 1;
    setT(pid, `translate(${st.x.toFixed(1)},${st.y.toFixed(1)}) scale(${sc})`);
    setA(pid, "opacity", st.show.toFixed(2));
    kind.update(pid, st, t);
    if (kind.glow && st.show > 0.01) {
      const r = 230 * st.glow * (1 + Math.sin(t * 9) * 0.03);
      glow += `<circle cx="${st.x.toFixed(1)}" cy="${(st.y - 30 * sc).toFixed(1)}" r="${r.toFixed(1)}" fill="url(#glowG)" opacity="${st.show.toFixed(2)}"/>`;
    }
  }
  $("glow").innerHTML = glow;
}

// ---------------------------------------------------------------- environment
function envAt(t) {
  let i = 0;
  while (i + 1 < ENVK.length && ENVK[i + 1].t <= t) i++;
  const k = ENVK[i];
  return k.from ? blendEnv(k.from, k.to, easeIO((t - k.t) / k.fade)) : k.to;
}

function drawEnv(t) {
  const e = envAt(t);
  setA("sk0", "stop-color", css(e.s0)); setA("sk1", "stop-color", css(e.s1)); setA("sk2", "stop-color", css(e.s2));
  setT("sun", `translate(${e.sunX.toFixed(1)},${e.sunY.toFixed(1)})`);
  setA("sun", "opacity", e.sunA.toFixed(3));
  setA("sunDisc", "fill", css(e.sunC));
  setT("sunRays", `rotate(${(t * 12).toFixed(1)})`);
  setA("godrays", "opacity", (e.rays * e.sunA * 0.45).toFixed(3));
  setT("godrays", `translate(${e.sunX.toFixed(1)},${e.sunY.toFixed(1)}) rotate(${(Math.sin(t * 0.3) * 4).toFixed(2)})`);
  setA("moon", "opacity", e.moonA.toFixed(3));
  const st = $("stars");
  st.setAttribute("opacity", e.starsA.toFixed(3));
  if (e.starsA > 0.01) STARS.forEach((s, i) => st.children[i].setAttribute("opacity", (0.45 + 0.55 * Math.abs(Math.sin(t * s.tw + s.ph))).toFixed(2)));
  document.querySelectorAll(".cl").forEach((c) => c.setAttribute("fill", css(e.cloud)));
  setA("tint", "fill", css(e.tint)); setA("tint", "opacity", e.tintA.toFixed(3));
  setA("rainbow", "opacity", (e.rainbow * 0.85).toFixed(3));
  // rain
  let d = "";
  if (e.rain > 0.02) {
    for (const r of RAIN) {
      const y = ((r.y0 + t * r.v) % 2200) - 140, x = r.x0 + (y + 140) * 0.18;
      d += `M ${(x % 1180).toFixed(0)} ${y.toFixed(0)} l 14 ${r.l} `;
    }
  }
  setA("rainP", "d", d); setA("rainP", "opacity", (e.rain * 0.55).toFixed(3));
  // lightning
  let fl = 0;
  for (const b of TL.beats) for (const f of b.flash || []) {
    const tf = b.start + f * (b.end - b.start), dt = t - tf;
    if (dt >= 0 && dt < 0.6) fl = Math.max(fl, Math.exp(-dt / 0.07) + 0.6 * Math.exp(-Math.abs(dt - 0.16) / 0.04));
  }
  $("flash").style.opacity = clamp(fl * 0.75, 0, 0.85).toFixed(3);
}

// ---------------------------------------------------------------- overlays
function captions(t) {
  let beat = null;
  for (const b of TL.beats) if (t >= b.start && t <= b.speechEnd + 0.3) beat = b;
  const wrap = $("capwrap");
  let cb = null;
  for (const b of TL.beats) if (b.card && t >= b.start - 0.2 && t <= b.end) cb = b;
  const card = $("kcard");
  card.style.opacity = cb ? clamp((t - cb.start + 0.2) / 0.4, 0, 1).toFixed(3) : 0;
  if (cb && card.dataset.k !== String(cb.start)) { card.innerHTML = cb.card.map((l) => `<div style="font-size:${Math.min(56, Math.floor(1250 / l.length))}px">${l}</div>`).join("") + (cb.cardSub ? `<p>${cb.cardSub}</p>` : ""); card.dataset.k = String(cb.start); }
  const sub = $("sub");
  sub.style.opacity = beat && beat.en && !cb && t < TL.outroStart ? 1 : 0;
  if (beat && beat.en && sub.dataset.k !== String(beat.start)) { sub.textContent = beat.en; sub.dataset.k = String(beat.start); }
  if (!beat || t >= TL.outroStart || cb) { wrap.style.opacity = 0; CAP.key = null; return; }
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
    if (sp) { pill.textContent = sp.name; pill.style.background = sp.pill || sp.color; }
    CAP.key = key; CAP.t0 = chunk[0].s - 0.08;
  }
  const pop = backOut((t - CAP.t0) / 0.18);
  $("cap").style.transform = `scale(${(0.82 + 0.18 * pop).toFixed(3)})`;
  const spans = $("cap").children;
  chunk.forEach((w, i) => {
    const on = t >= w.s - 0.03 && (t < w.e + 0.05 || (i === chunk.length - 1 && t < beat.speechEnd + 0.3));
    spans[i].className = on ? "on" : "";
    spans[i].style.transform = on ? "scale(1.1)" : "scale(1)";
  });
}

function titleCard(t) {
  const el = $("title");
  const inU = backOut(t / 0.45), out = clamp((t - 2.7) / 0.35, 0, 1);
  el.style.opacity = t < 0 || (TL.beats[0] && TL.beats[0].card) ? 0 : 1 - out;
  el.style.transform = `translateY(${(-out * 40).toFixed(1)}px) rotate(-3deg) scale(${(0.5 + 0.5 * inU).toFixed(3)})`;
}

function outro(t) {
  const u = t - TL.outroStart;
  $("shade").style.opacity = (clamp(u / 0.4, 0, 1) * 0.35).toFixed(3);
  const card = $("card");
  card.style.opacity = u < 0 ? 0 : clamp(u / 0.15, 0, 1);
  card.style.transform = `scale(${(0.6 + 0.4 * backOut(u / 0.5)).toFixed(3)})`;
  $("follow").style.transform = `scale(${(1 + (u > 0.8 ? Math.sin((u - 0.8) * 7) * 0.05 : 0)).toFixed(3)})`;
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
    const cx = p.x, cy = p.y - 190 * p.s;
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
  let charSVG = "", shadows = "", propSVG = "", backSVG = "";
  for (const cid of Object.keys(chars)) {
    const def = chars[cid];
    CH[cid] = { def, flies: !!KINDS[def.kind].flies, track: null };
    shadows += `<ellipse id="${cid}-shadow" cx="0" cy="4" rx="110" ry="16" fill="#1f2a52" opacity=".18"/>`;
    charSVG += `<g id="${cid}-root"><g id="${cid}-body">${KINDS[def.kind].svg(cid, def.color)}</g></g>`;
  }
  for (const [pid, def] of Object.entries(tl.story.props || {})) {
    const keys = [];
    for (const b of tl.beats) {
      const a = (b.props || {})[pid];
      if (!a) continue;
      const [f0, f1] = a.during || [0, 0.6];
      const k = { t0: b.start + f0 * (b.end - b.start), t1: b.start + f1 * (b.end - b.start) };
      if (a.to !== undefined) { if (Array.isArray(a.to)) { k.x = a.to[0]; k.y = a.to[1]; } else k.x = a.to; }
      for (const f of ["full", "grow", "glow", "show", "attach"]) if (a[f] !== undefined) k[f] = a[f];
      keys.push(k);
    }
    PR[pid] = { def, keys };
    const g = `<g id="${pid}">${PROPS[def.kind].svg(pid, def)}</g>`;
    if (def.behind) backSVG += g; else propSVG += g;
  }
  const r = rand(77);
  let stars = "";
  for (let i = 0; i < 90; i++) {
    STARS.push({ tw: 1 + r() * 3, ph: r() * 6 });
    stars += `<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * 1250).toFixed(0)}" r="${(1.5 + r() * 3).toFixed(1)}" fill="#fffbe6"/>`;
  }
  for (let i = 0; i < 80; i++) RAIN.push({ x0: r() * 1180 - 100, y0: r() * 2200, v: 1700 + r() * 700, l: 50 + r() * 30 });
  let rays = "", god = "";
  for (let i = 0; i < 12; i++) rays += `<rect x="-7" y="-128" width="14" height="34" rx="7" fill="#ffd54f" transform="rotate(${i * 30})"/>`;
  for (let i = 0; i < 5; i++) god += `<path d="M 0 0 L 1900 ${-260 + i * 40} L 1900 ${-60 + i * 40} Z" fill="#fffbe0" opacity="${(0.5 - i * 0.07).toFixed(2)}" transform="rotate(${14 + i * 13})"/>`;
  const rb = ["#ff5252", "#ff9800", "#ffeb3b", "#66bb6a", "#42a5f5", "#7e57c2"].map((c, i) => `<path d="M ${-40 + i * 26} 1400 A ${580 - i * 26} ${580 - i * 26} 0 0 1 ${1120 - i * 26} 1400" fill="none" stroke="${c}" stroke-width="28"/>`).join("");
  $("svg").innerHTML = `
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop id="sk0" offset="0"/><stop id="sk1" offset=".55"/><stop id="sk2" offset="1"/></linearGradient>
      <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ed957"/><stop offset="1" stop-color="#3f9f45"/></linearGradient>
      <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fc3f7"/><stop offset="1" stop-color="#1e88e5"/></linearGradient>
      <radialGradient id="glowG"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".95"/><stop offset=".35" stop-color="#ffc861" stop-opacity=".45"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
      <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#0a1030" stop-opacity="0"/><stop offset="1" stop-color="#0a1030" stop-opacity=".55"/></radialGradient>
      <filter id="soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="3"/></filter>
      <filter id="rayblur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    <g id="stars">${stars}</g>
    <g id="godrays" filter="url(#rayblur)">${god}</g>
    <g id="sun"><g id="sunRays">${rays}</g><circle id="sunDisc" r="78" stroke="#ffffff55" stroke-width="8"/></g>
    <g id="moon" transform="translate(860,720)"><circle r="120" fill="#fff6d5" opacity=".12"/><circle r="72" fill="#fff6d5" stroke="#e8dcb0" stroke-width="6"/><circle cx="-22" cy="-14" r="13" fill="#eadfb8"/><circle cx="20" cy="18" r="9" fill="#eadfb8"/></g>
    <g id="rainbow" opacity="0">${rb}</g>
    ${cloud("c1", 200, 900, 1)}${cloud("c2", 760, 1010, 0.8)}${cloud("c3", 520, 760, 0.6)}
    <g id="world">${SC.svg(SC.ground)}${backSVG}${shadows}${charSVG}${propSVG}${SC.front ? SC.front() : ""}
      <rect id="tint" x="-1500" y="-1500" width="4000" height="5000" style="mix-blend-mode:multiply"/>
      <g id="glow" style="mix-blend-mode:screen"></g>
    </g>
    <path id="rainP" stroke="#dfe9f5" stroke-width="3" stroke-linecap="round" fill="none"/>
    <rect width="${W}" height="${H}" fill="url(#vig)"/>
    <g id="fx"></g><g id="confetti"></g>`;
  for (const cid of Object.keys(chars)) CH[cid].track = stateTrack(cid);

  // environment keyframes: story default, then beats with sky / rain / rainbow
  let cur = { sky: tl.story.sky || "day", rain: undefined, rainbow: 0 };
  ENVK = [{ t: -10, from: null, to: envVec(cur.sky, cur) }];
  for (const b of tl.beats) {
    if (b.sky === undefined && b.rain === undefined && b.rainbow === undefined) continue;
    if (b.sky !== undefined) { cur = { ...cur, sky: b.sky, rain: undefined }; }
    if (b.rain !== undefined) cur.rain = b.rain;
    if (b.rainbow !== undefined) cur.rainbow = b.rainbow;
    const prev = ENVK[ENVK.length - 1];
    const fade = b.skyFade || 1.6;
    const from = prev.from ? blendEnv(prev.from, prev.to, easeIO((b.start - prev.t) / prev.fade)) : prev.to;
    ENVK.push({ t: b.start, fade, from, to: envVec(cur.sky, cur) });
  }

  for (const s of tl.sfx) {
    if (s.name !== "sparkle" || s.t >= tl.outroStart) continue;
    for (const cid of Object.keys(chars)) {
      const st = CH[cid].track.filter((x) => x.t <= s.t + 0.01).pop();
      if (st && st.pose === "cheer") BURSTS.push({ t: s.t, cid });
    }
  }
  $("title").textContent = tl.story.title;
  $("title").style.fontSize = Math.min(100, Math.floor(1750 / tl.story.title.length)) + "px";
  $("title").style.whiteSpace = "nowrap";
  $("cardH").textContent = tl.story.outro.headline;
  $("cardP").textContent = tl.story.outro.sub;
  if (tl.story.outro.follow) $("follow").textContent = tl.story.outro.follow;
  if (tl.story.lang) document.body.classList.add(tl.story.lang);
  return document.fonts.ready.then(() => true);
};

window.draw = function (t) {
  setT("c1", `translate(${((200 + t * 9) % 1400) - 150},900)`);
  setT("c2", `translate(${((760 + t * 6) % 1400) - 150},1010) scale(.8)`);
  setT("c3", `translate(${((520 + t * 4) % 1400) - 150},760) scale(.6)`);
  SC.tick(t);
  drawEnv(t);

  // camera: follows the shot's characters, smoothed over ±0.6 s, kept inside the world
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
  const sy = cam.groundY || 1420;
  fx = clamp(fx, 540 / Z, W - 540 / Z);
  fy = Math.min(fy, H - (H - sy) / Z);
  setT("world", `translate(540,${sy}) scale(${Z.toFixed(4)}) translate(${(-fx).toFixed(1)},${(-fy).toFixed(1)})`);

  const positions = {};
  for (const cid of Object.keys(CH)) positions[cid] = drawChar(cid, t);
  drawProps(t, positions);
  bursts(t, positions);
  titleCard(t);
  captions(t);
  outro(t);
};
