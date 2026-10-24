/* Gurumi-style stitch-by-stitch crochet simulator (Cantonese UI) */
(function () {
  "use strict";

  const DEFAULT_COLORS = {
    A: "#f3e6d4",
    B: "#5c4030",
    C: "#e05a4a",
    D: "#f0a03a",
    E: "#f5d76e",
    F: "#f2a0b8",
  };

  const PRESETS = [
    {
      id: "sphere",
      label: "小球／球體",
      title: "小球",
      colors: { A: "#e8a06a", B: "#5c4030", C: "#e05a4a", D: "#f0a03a", E: "#f5d76e", F: "#f2a0b8" },
      pattern:
`Body, with A:
Rnd 1: 6 sc in MR (6)
Rnd 2: inc x6 (12)
Rnd 3: (sc, inc) x6 (18)
Rnd 4: (2 sc, inc) x6 (24)
Rnds 5-8: sc around (24)
Rnd 9: (2 sc, dec) x6 (18)
Rnd 10: (sc, dec) x6 (12)
Rnd 11: dec x6 (6)
FO`,
    },
    {
      id: "flat",
      label: "平面圓",
      title: "平面圓",
      colors: { A: "#d4c4a8", B: "#5c4030", C: "#e05a4a", D: "#f0a03a", E: "#f5d76e", F: "#f2a0b8" },
      pattern:
`Disk, with A:
Rnd 1: 8 sc in MR (8)
Rnd 2: inc x8 (16)
Rnd 3: (sc, inc) x8 (24)
Rnd 4: (2 sc, inc) x8 (32)
Rnd 5: (3 sc, inc) x8 (40)
Rnd 6: (4 sc, inc) x8 (48)
Rnds 7-8: sc around (48)`,
    },
    {
      id: "chick",
      label: "小雞頭",
      title: "小雞頭",
      colors: { A: "#f5f0e6", B: "#f5d76e", C: "#5c4030", D: "#e05a4a", E: "#f0a03a", F: "#f2a0b8" },
      pattern:
`Head, with A:
Rnd 1: 8 sc in MR (8)
Rnd 2: inc x8 (16)
Rnd 3: (sc, inc) x8 (24)
Rnd 4: (2 sc, inc) x8 (32)
Rnds 5-8: sc around (32)
Rnd 9: (2 sc, dec) x8 (24)
Rnd 10: (sc, dec) x8 (16)
Rnd 11: change to B, sc around (16)
Rnd 12: sc around (16)
Rnd 13: dec x8 (8)
FO`,
    },
  ];

  /* ——— Parser → flat stitch queue ——— */
  function parsePattern(text, colorMap) {
    const lines = String(text || "").split(/\r?\n/);
    const stitches = [];
    const reports = [];
    let color = "A";
    let piece = "Piece";
    let prevCount = 0;
    let roundCounter = 0;
    let pieceIndex = 0;

    function setColor(letter) {
      const L = String(letter || "").toUpperCase();
      if (colorMap[L]) color = L;
    }

    function pushStitch(kind, lineIndex, round, expectedInRound, extra) {
      stitches.push({
        kind: kind || "sc",
        color: color,
        piece: piece,
        pieceIndex: pieceIndex,
        round: round,
        lineIndex: lineIndex,
        idxInRound: expectedInRound,
        mr: !!(extra && extra.mr),
      });
    }

    function expandTokenList(tokens, lineIndex, round) {
      let made = 0;
      for (let t of tokens) {
        t = t.trim();
        if (!t) continue;
        let m;
        if (/^change\s+to\s+([A-F])$/i.test(t)) {
          setColor(RegExp.$1);
          continue;
        }
        if (/^with\s+([A-F])$/i.test(t)) {
          setColor(RegExp.$1);
          continue;
        }
        if (/^(?:FO|finish\s*off|cut\s*yarn|close.*)$/i.test(t)) continue;

        // N sc in MR
        m = t.match(/^(\d+)\s*(?:sc|sts?|短針)?\s*(?:in\s*)?(?:MR|magic\s*ring|魔術環)$/i);
        if (m) {
          const n = +m[1];
          for (let i = 0; i < n; i++) {
            pushStitch("sc", lineIndex, round, made, { mr: true });
            made++;
          }
          continue;
        }

        // bare inc / dec (one increase or decrease)
        if (/^(?:inc|加針)$/i.test(t)) {
          pushStitch("inc", lineIndex, round, made); made++;
          pushStitch("sc", lineIndex, round, made); made++;
          continue;
        }
        if (/^(?:dec|減針)$/i.test(t)) {
          pushStitch("dec", lineIndex, round, made); made++;
          continue;
        }

        // inc xN / N inc
        m = t.match(/^(?:inc|加針)\s*[x×*]?\s*(\d+)$/i) || t.match(/^(\d+)\s*(?:inc|加針)$/i);
        if (m) {
          const n = +m[1];
          for (let i = 0; i < n; i++) {
            pushStitch("inc", lineIndex, round, made);
            made++;
            pushStitch("sc", lineIndex, round, made); // second leg of increase
            made++;
          }
          continue;
        }

        // dec xN / N dec
        m = t.match(/^(?:dec|減針)\s*[x×*]?\s*(\d+)$/i) || t.match(/^(\d+)\s*(?:dec|減針)$/i);
        if (m) {
          const n = +m[1];
          for (let i = 0; i < n; i++) {
            pushStitch("dec", lineIndex, round, made);
            made++;
          }
          continue;
        }

        // (inner) xN
        m = t.match(/^\(\s*(.+?)\s*\)\s*[x×*]?\s*(\d+)$/i);
        if (m) {
          const inner = m[1];
          const times = +m[2];
          const parts = inner.split(",").map((p) => p.trim()).filter(Boolean);
          for (let k = 0; k < times; k++) {
            for (const p of parts) {
              let pm;
              if (/^(?:inc|加針)$/i.test(p)) {
                pushStitch("inc", lineIndex, round, made); made++;
                pushStitch("sc", lineIndex, round, made); made++;
              } else if (/^(?:dec|減針)$/i.test(p)) {
                pushStitch("dec", lineIndex, round, made); made++;
              } else if ((pm = p.match(/^(\d+)\s*(?:sc|短針)?$/i)) || (pm = p.match(/^(?:sc|短針)$/i))) {
                const n = pm && pm[1] ? +pm[1] : 1;
                for (let j = 0; j < n; j++) {
                  pushStitch("sc", lineIndex, round, made); made++;
                }
              } else if (/^\d+$/.test(p)) {
                const n = +p;
                for (let j = 0; j < n; j++) {
                  pushStitch("sc", lineIndex, round, made); made++;
                }
              }
            }
          }
          continue;
        }

        // N sc / sc
        m = t.match(/^(\d+)\s*(?:sc|sts?|短針)$/i);
        if (m) {
          const n = +m[1];
          for (let i = 0; i < n; i++) {
            pushStitch("sc", lineIndex, round, made); made++;
          }
          continue;
        }
        if (/^(?:sc|短針)$/i.test(t)) {
          pushStitch("sc", lineIndex, round, made); made++;
          continue;
        }

        // sl st / ss
        m = t.match(/^(\d+)\s*(?:sl\s*st|ss|滑針)$/i);
        if (m) {
          const n = +m[1];
          for (let i = 0; i < n; i++) {
            pushStitch("sl", lineIndex, round, made); made++;
          }
          continue;
        }
        if (/^(?:sl\s*st|ss|滑針)\s*(?:around)?$/i.test(t)) {
          const n = prevCount || 6;
          for (let i = 0; i < n; i++) {
            pushStitch("sl", lineIndex, round, made); made++;
          }
          continue;
        }

        // sc around
        if (/^(?:sc|短針)\s*around$/i.test(t) || /^sc$/i.test(t) && tokens.length === 1) {
          const n = prevCount || 6;
          for (let i = 0; i < n; i++) {
            pushStitch("sc", lineIndex, round, made); made++;
          }
          continue;
        }

        // bare number = that many sc
        m = t.match(/^(\d+)$/);
        if (m) {
          const n = +m[1];
          for (let i = 0; i < n; i++) {
            pushStitch("sc", lineIndex, round, made); made++;
          }
          continue;
        }

        // unknown token — soft skip
        reports.push({ line: lineIndex + 1, level: "warn", msg: "睇唔明：「" + t + "」" });
      }
      return made;
    }

    function parseRoundBody(body, lineIndex, round) {
      let s = body.trim();
      // strip trailing (N) expected count
      let expected = null;
      const em = s.match(/\((\d+)\)\s*$/);
      if (em) {
        expected = +em[1];
        s = s.slice(0, em.index).trim();
      }

      // leading change to X,
      let cm = s.match(/^change\s+to\s+([A-F])\s*,?\s*/i);
      if (cm) {
        setColor(cm[1]);
        s = s.slice(cm[0].length).trim();
      }
      cm = s.match(/^with\s+([A-F])\s*,?\s*/i);
      if (cm) {
        setColor(cm[1]);
        s = s.slice(cm[0].length).trim();
      }

      // special: "sc around"
      if (/^(?:sc|短針)\s*around$/i.test(s) || /^sc\s*around$/i.test(s)) {
        const n = prevCount || 6;
        for (let i = 0; i < n; i++) pushStitch("sc", lineIndex, round, i);
        if (expected != null && n !== expected) {
          reports.push({ line: lineIndex + 1, level: "warn", msg: "針數唔夾：計到 " + n + "，括號寫 " + expected });
        }
        prevCount = n;
        return n;
      }

      if (/^(?:sl\s*st|ss|滑針)\s*around$/i.test(s)) {
        const n = prevCount || 6;
        for (let i = 0; i < n; i++) pushStitch("sl", lineIndex, round, i);
        prevCount = n;
        return n;
      }

      // split on commas that are NOT inside parentheses
      const tokens = [];
      let buf = "";
      let depth = 0;
      for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (ch === "(") depth++;
        if (ch === ")") depth = Math.max(0, depth - 1);
        if (ch === "," && depth === 0) {
          tokens.push(buf.trim());
          buf = "";
        } else if ((ch === "|" ) && depth === 0) {
          // ignore caret leftovers
        } else {
          buf += ch;
        }
      }
      if (buf.trim()) tokens.push(buf.trim());

      // Also split bare "inc x6" style if whole body is one token already handled
      const made = expandTokenList(tokens, lineIndex, round);
      if (expected != null && made !== expected) {
        reports.push({ line: lineIndex + 1, level: "warn", msg: "針數唔夾：計到 " + made + "，括號寫 " + expected });
      }
      if (made === 0 && s) {
        reports.push({ line: lineIndex + 1, level: "bad", msg: "呢行未產生針數" });
      }
      prevCount = made || prevCount;
      return made;
    }

    lines.forEach((raw, lineIndex) => {
      let line = String(raw || "").replace(/\u00a0/g, " ").trim();
      if (!line || line.startsWith("#") || line.startsWith("//")) {
        reports.push({ line: lineIndex + 1, level: "skip", msg: "" });
        return;
      }

      // Piece header: "Body, with A:" or "Hat, with B:"
      let pm = line.match(/^([A-Za-z\u4e00-\u9fff][^,:]{0,40}?)\s*,\s*with\s+([A-F])\s*:?\s*$/i);
      if (pm) {
        piece = pm[1].trim();
        pieceIndex++;
        setColor(pm[2]);
        roundCounter = 0;
        prevCount = 0;
        reports.push({ line: lineIndex + 1, level: "ok", msg: "件：" + piece + " · 色 " + color });
        return;
      }
      pm = line.match(/^([A-Za-z\u4e00-\u9fff][^:]{0,40}?)\s*:\s*$/);
      if (pm && !/^(?:Rnd|Rnds|Round|第)/i.test(pm[1])) {
        piece = pm[1].trim();
        pieceIndex++;
        roundCounter = 0;
        prevCount = 0;
        reports.push({ line: lineIndex + 1, level: "ok", msg: "件：" + piece });
        return;
      }

      if (/^(?:FO|finish\s*off|cut\s*yarn)/i.test(line)) {
        reports.push({ line: lineIndex + 1, level: "ok", msg: "收線" });
        return;
      }

      // Rnds a-b: body
      let rm = line.match(/^(?:Rnds?|Rounds?|第)\s*(\d+)\s*[-–—~到至]\s*(\d+)\s*[:：.\-]?\s*(.*)$/i);
      if (rm) {
        const a = +rm[1], b = +rm[2];
        const body = rm[3] || "sc around";
        const lo = Math.min(a, b), hi = Math.max(a, b);
        let lastMade = 0;
        for (let r = lo; r <= hi; r++) {
          roundCounter = r;
          lastMade = parseRoundBody(body, lineIndex, r);
        }
        reports.push({ line: lineIndex + 1, level: lastMade ? "ok" : "warn", msg: "第" + lo + "–" + hi + "圈 · 每圈 " + lastMade + " 針" });
        return;
      }

      // Rnd N: body
      rm = line.match(/^(?:Rnd|Round|R|圓|圈|第)\s*(\d+)\s*[:：.\-]?\s*(.*)$/i);
      if (rm) {
        const r = +rm[1];
        roundCounter = r;
        const body = rm[2] || "";
        const made = parseRoundBody(body, lineIndex, r);
        reports.push({ line: lineIndex + 1, level: made ? "ok" : "warn", msg: "第" + r + "圈 · " + made + " 針" });
        return;
      }

      // bare body without Rnd prefix — treat as next round
      roundCounter += 1;
      const made = parseRoundBody(line, lineIndex, roundCounter);
      reports.push({ line: lineIndex + 1, level: made ? "ok" : "warn", msg: "第" + roundCounter + "圈 · " + made + " 針" });
    });

    // assign stable id + roundSize
    const byRound = new Map();
    stitches.forEach((st) => {
      const key = st.pieceIndex + ":" + st.round;
      if (!byRound.has(key)) byRound.set(key, []);
      byRound.get(key).push(st);
    });
    byRound.forEach((arr) => {
      arr.forEach((st, i) => {
        st.idxInRound = i;
        st.roundSize = arr.length;
      });
    });

    return { stitches, reports, total: stitches.length };
  }

  /* ——— Geometry ——— */
  // Middle ground: lightly interlocking Vs (not sparse cage, not fat mush)
  const STITCH_ARC = 0.46; // arc length per stitch → radius
  const STITCH_H = 0.40;   // vertical pitch between rounds

  function layoutStitches(stitches) {
    // Discrete stacked rounds (層層疊): one shared height per round, then step up
    const out = [];
    let lastPiece = -1;
    let heightCursor = 0;
    // Track previous round's global indices for parent linking
    let prevRoundStart = -1;
    let prevRoundN = 0;
    let prevPiece = -1;

    let i = 0;
    while (i < stitches.length) {
      const st0 = stitches[i];
      if (st0.pieceIndex !== lastPiece) {
        if (lastPiece >= 0) heightCursor += 2.5; // gap between pieces
        lastPiece = st0.pieceIndex;
        prevRoundStart = -1;
        prevRoundN = 0;
        prevPiece = st0.pieceIndex;
      }
      const round = st0.round;
      const pieceIndex = st0.pieceIndex;
      let j = i;
      while (j < stitches.length && stitches[j].pieceIndex === pieceIndex && stitches[j].round === round) j++;
      const n = j - i;
      const radius = Math.max(0.28, (n * STITCH_ARC) / (Math.PI * 2));
      const roundStart = out.length;
      // Flat ring: every stitch in this round sits at the same height
      const y = heightCursor;
      for (let k = 0; k < n; k++) {
        const st = stitches[i + k];
        const ang = (k / n) * Math.PI * 2 - Math.PI / 2;
        // Parent in previous round: map by angular fraction (handles inc/dec)
        let parentIndex = -1;
        if (prevRoundN > 0 && prevPiece === pieceIndex) {
          const pk = Math.min(prevRoundN - 1, Math.floor((k + 0.5) * prevRoundN / n));
          parentIndex = prevRoundStart + pk;
        }
        // Left neighbour in same round (for shared top-chain)
        const leftIndex = k > 0 ? roundStart + k - 1 : (n > 1 ? roundStart + n - 1 : -1);
        out.push({
          ...st,
          x: Math.cos(ang) * radius,
          y: y,
          z: Math.sin(ang) * radius,
          ang,
          radius,
          globalIndex: i + k,
          parentIndex,
          leftIndex: k > 0 ? leftIndex : -1, // only prior-in-draw-order left; wrap handled later
          roundStart,
          roundN: n,
          kInRound: k,
        });
      }
      prevRoundStart = roundStart;
      prevRoundN = n;
      prevPiece = pieceIndex;
      heightCursor += STITCH_H;
      i = j;
    }

    // center vertically
    if (out.length) {
      let minY = Infinity, maxY = -Infinity;
      out.forEach((p) => { minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); });
      const mid = (minY + maxY) / 2;
      out.forEach((p) => { p.y -= mid; });
    }
    return out;
  }

  /* ——— DOM refs ——— */
  const panel = document.getElementById("panel-sim");
  if (!panel) return;

  const titleEl = document.getElementById("simTitle");
  const swatchesEl = document.getElementById("simSwatches");
  const totalEl = document.getElementById("simTotal");
  const linesEl = document.getElementById("simLines");
  const textareaEl = document.getElementById("simPattern");
  const parseEl = document.getElementById("simParse");
  const presetsEl = document.getElementById("simPresets");
  const canvas = document.getElementById("simCanvas");
  const wrap = document.getElementById("simCanvasWrap");
  const ctx = canvas.getContext("2d");
  const hudRound = document.getElementById("simHudRound");
  const hudStitch = document.getElementById("simHudStitch");
  const speedEl = document.getElementById("simSpeed");
  const activeLineBadge = document.getElementById("simActiveBadge");

  let colors = { ...DEFAULT_COLORS };
  let patternText = "";
  let parsed = { stitches: [], reports: [], total: 0 };
  let laid = [];
  let cursor = 0; // how many stitches visible (0..total)
  let playing = false;
  let raf = 0;
  let lastTick = 0;
  let yaw = 0.55;
  let pitch = 0.55;
  let userZoom = 1; // 0.5×–3×, separate from fit-to-view
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 3;
  let autoSpin = true;
  let drag = null;
  let pointers = new Map(); // multi-touch pinch
  let pinchStart = null;
  let activePreset = "sphere";
  let activeColorKey = "A";

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function hexToRgb(hex) {
    const h = String(hex || "#ccc").replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const n = parseInt(full, 16) || 0xcccccc;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function shade(hex, f) {
    const { r, g, b } = hexToRgb(hex);
    const t = f < 0 ? 0 : 255;
    const p = Math.abs(f);
    return "rgb(" + [r, g, b].map((c) => Math.round((t - c) * p + c)).join(",") + ")";
  }

  function renderSwatches() {
    swatchesEl.innerHTML = "";
    "ABCDEF".split("").forEach((k) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sim-swatch" + (k === activeColorKey ? " on" : "");
      b.title = "色 " + k;
      b.style.background = colors[k];
      b.dataset.key = k;
      b.addEventListener("click", () => {
        activeColorKey = k;
        const inp = document.getElementById("simColorPicker");
        inp.value = colors[k];
        const rect = b.getBoundingClientRect();
        inp.style.cssText = "position:fixed;left:" + rect.left + "px;top:" + (rect.bottom + 4) + "px;width:32px;height:32px;opacity:0.02;z-index:99;border:0;padding:0;";
        inp.focus();
        try { inp.click(); } catch (e) {}
        renderSwatches();
      });
      swatchesEl.appendChild(b);
    });
  }

  const colorPicker = document.getElementById("simColorPicker");
  colorPicker.addEventListener("input", () => {
    colors[activeColorKey] = colorPicker.value;
    renderSwatches();
    reparse(false);
  });

  function renderPresets() {
    presetsEl.innerHTML = "";
    PRESETS.forEach((p) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip" + (p.id === activePreset ? " on" : "");
      b.textContent = p.label;
      b.addEventListener("click", () => loadPreset(p.id));
      presetsEl.appendChild(b);
    });
  }

  function loadPreset(id) {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    activePreset = id;
    colors = { ...DEFAULT_COLORS, ...p.colors };
    titleEl.value = p.title;
    textareaEl.value = p.pattern;
    patternText = p.pattern;
    renderPresets();
    renderSwatches();
    reparse(true);
  }

  function reparse(reset) {
    patternText = textareaEl.value;
    parsed = parsePattern(patternText, colors);
    laid = layoutStitches(parsed.stitches);
    if (reset) {
      cursor = 0;
      playing = false;
      updatePlayBtn();
    } else {
      cursor = Math.min(cursor, laid.length);
    }
    renderLines();
    renderParse();
    updateHud();
    draw();
  }

  function renderParse() {
    const rows = parsed.reports.filter((r) => r.level !== "skip" && r.msg);
    if (!rows.length) {
      parseEl.innerHTML = "<div class='row ok'>未有提示</div>";
      return;
    }
    parseEl.innerHTML = rows.map((r) => {
      const cls = r.level === "bad" ? "bad" : r.level === "warn" ? "bad" : "ok";
      return "<div class='row " + cls + "'><span>L" + r.line + "</span><span>" + escapeHtml(r.msg) + "</span></div>";
    }).join("");
  }

  function activeLineIndex() {
    if (cursor <= 0 || !laid.length) return -1;
    const st = laid[Math.min(cursor, laid.length) - 1];
    return st ? st.lineIndex : -1;
  }

  function renderLines() {
    const rawLines = String(textareaEl.value || "").split(/\r?\n/);
    const active = activeLineIndex();
    const html = rawLines.map((line, i) => {
      const cls = i === active ? "sim-line on" : "sim-line";
      return "<div class='" + cls + "' data-i='" + i + "'><span class='sim-ln'>" + (i + 1) + "</span><span class='sim-lt'>" + escapeHtml(line || " ") + "</span></div>";
    }).join("");
    linesEl.innerHTML = html || "<div class='sim-line'><span class='sim-ln'>1</span><span class='sim-lt'></span></div>";

    const on = linesEl.querySelector(".sim-line.on");
    if (on) {
      const parent = linesEl;
      const top = on.offsetTop - parent.clientHeight / 3;
      parent.scrollTop = Math.max(0, top);
    }

    if (activeLineBadge) {
      if (active >= 0 && cursor > 0 && laid.length) {
        const st = laid[Math.min(cursor, laid.length) - 1];
        activeLineBadge.textContent = "第 " + st.round + " 圈 · " + (st.idxInRound + 1) + "/" + st.roundSize;
        activeLineBadge.hidden = false;
      } else {
        activeLineBadge.hidden = true;
      }
    }
  }

  /* keep textarea synced — editing via overlay click focuses textarea */
  linesEl.addEventListener("click", () => {
    textareaEl.focus();
  });

  function syncEditorFromTextarea() {
    // mirror text into line view while typing
    renderLines();
  }

  /* ——— Canvas ——— */
  function resize() {
    const rect = wrap.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(260, Math.floor(rect.width));
    const h = Math.max(260, Math.floor(rect.height));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function project(x, y, z) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    let x1 = x * cy - z * sy;
    let z1 = x * sy + z * cy;
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    let y1 = y * cp - z1 * sp;
    let z2 = y * sp + z1 * cp;
    return { x: x1, y: y1, z: z2 };
  }

  function draw() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    // ground shadow
    ctx.fillStyle = "rgba(42,36,28,0.07)";
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.88, w * 0.26, h * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();

    const nShow = Math.min(cursor, laid.length);
    if (nShow === 0) {
      ctx.fillStyle = "rgba(122,111,98,0.75)";
      ctx.font = "600 14px PingFang HK, Noto Sans TC, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("撳 ▶ 播放，睇一針一針織出嚟", w / 2, h * 0.48);
      return;
    }

    const pts = laid.slice(0, nShow);
    // scale to fit × user zoom
    let maxR = 0.1;
    pts.forEach((p) => {
      // Use full |y| so tall spheres fit (0.6 under-fit → overflow / fake sparse look)
      maxR = Math.max(maxR, Math.hypot(p.x, p.z), Math.abs(p.y));
    });
    const scale = (Math.min(w, h) * 0.40 / maxR) * userZoom;

    const projected = pts.map((p, idx) => {
      const pr = project(p.x, p.y, p.z);
      return {
        sx: w * 0.5 + pr.x * scale,
        sy: h * 0.52 - pr.y * scale,
        depth: pr.z,
        color: colors[p.color] || colors.A,
        kind: p.kind,
        idx,
        ang: p.ang,
        raw: p,
        parentIndex: p.parentIndex,
        kInRound: p.kInRound,
        roundN: p.roundN,
        roundStart: p.roundStart,
      };
    });
    // Index by stitch order for parent / neighbour lookups (before depth sort)
    const byIdx = new Array(projected.length);
    projected.forEach((p) => { byIdx[p.idx] = p; });
    projected.sort((a, b) => a.depth - b.depth);

    const simplify = nShow > 500;
    const needle = projected.length ? projected.find((p) => p.idx === nShow - 1) : null;

    for (const p of projected) {
      if (simplify && p.depth < -maxR * 0.15 && (p.idx % 2 === 0)) continue;
      const parent = (p.parentIndex >= 0 && p.parentIndex < nShow) ? byIdx[p.parentIndex] : null;
      // Left neighbour already drawn in same round (for shared top-chain abut)
      let left = null;
      if (p.kInRound > 0) {
        const li = p.roundStart + p.kInRound - 1;
        if (li < nShow) left = byIdx[li];
      }
      drawYarnStitch(p, scale, p.idx === nShow - 1, parent, left);
    }

    // red needle / marker on current stitch
    if (needle) {
      ctx.strokeStyle = "#e23b2f";
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(needle.sx, needle.sy - 22);
      ctx.lineTo(needle.sx, needle.sy + 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(needle.sx, needle.sy - 24, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = "#e23b2f";
      ctx.fill();
    }
  }

  function drawYarnStitch(p, scale, isActive, parent, left) {
    const depthNorm = Math.max(0, Math.min(1, (p.depth + 8) / 16));
    // Footprint tracks spacing, but clamp px so early rounds / high zoom stay readable Vs
    const sRaw = scale * STITCH_ARC * 0.98;
    const s = Math.max(3.2, Math.min(20, sRaw)) * (0.85 + 0.25 * depthNorm);
    const col = p.color;
    const dark = shade(col, -0.26);
    const mid = shade(col, -0.1);
    const light = shade(col, 0.2);

    let ax = p.sx;
    let ay = p.sy + s * 0.88;
    if (parent) {
      ax = parent.sx * 0.35 + p.sx * 0.65;
      ay = parent.sy - s * 0.12; // hook into parent top bar
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const topY = p.sy - s * 0.22;
    const halfW = s * 0.50; // abut neighbours lightly
    const lx = p.sx - halfW;
    const rx = p.sx + halfW;

    // Soft underside shadow
    ctx.beginPath();
    ctx.ellipse(p.sx, (ay + p.sy) * 0.55, s * 0.42, s * 0.16, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(42,36,28," + (0.04 + 0.05 * (1 - depthNorm)) + ")";
    ctx.fill();

    // Very light V fill (readable holes, not opaque blob)
    ctx.beginPath();
    ctx.moveTo(lx + s * 0.06, topY);
    ctx.lineTo(ax, ay);
    ctx.lineTo(rx - s * 0.06, topY);
    ctx.closePath();
    ctx.fillStyle = shade(col, 0.08);
    ctx.globalAlpha = 0.28 + 0.12 * depthNorm;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Classic thinner posts
    const lw = Math.max(1.6, s * 0.30);
    ctx.strokeStyle = dark;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(lx + s * 0.04, topY);
    ctx.quadraticCurveTo(p.sx - s * 0.12, p.sy + s * 0.12, ax - s * 0.03, ay);
    ctx.stroke();

    ctx.strokeStyle = light;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(rx - s * 0.04, topY);
    ctx.quadraticCurveTo(p.sx + s * 0.12, p.sy + s * 0.12, ax + s * 0.03, ay);
    ctx.stroke();

    // Small lock through parent (緊扣 hint, not a thick tube)
    if (parent) {
      ctx.strokeStyle = mid;
      ctx.lineWidth = Math.max(1.4, s * 0.22);
      ctx.beginPath();
      ctx.moveTo(ax - s * 0.2, ay);
      ctx.quadraticCurveTo(ax, ay + s * 0.08, ax + s * 0.2, ay);
      ctx.stroke();

      const psRaw = scale * STITCH_ARC * 0.98;
      const ps = Math.max(3.2, Math.min(20, psRaw)) * (0.85 + 0.25 * Math.max(0, Math.min(1, (parent.depth + 8) / 16)));
      const pty = parent.sy - ps * 0.22;
      const phw = ps * 0.52;
      ctx.strokeStyle = parent.color;
      ctx.lineWidth = Math.max(1.5, ps * 0.28);
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(parent.sx - phw * 0.55, pty);
      ctx.quadraticCurveTo(parent.sx, pty - ps * 0.28, parent.sx + phw * 0.55, pty);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Top bar / chain loops — thinner
    ctx.strokeStyle = shade(col, -0.12);
    ctx.lineWidth = Math.max(1.3, s * 0.24);
    ctx.beginPath();
    ctx.ellipse(p.sx - s * 0.14, topY - s * 0.02, s * 0.2, s * 0.11, -0.12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(p.sx + s * 0.14, topY - s * 0.02, s * 0.2, s * 0.11, 0.12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = col;
    ctx.lineWidth = Math.max(1.6, s * 0.3);
    ctx.beginPath();
    ctx.moveTo(lx, topY);
    ctx.quadraticCurveTo(p.sx, topY - s * 0.3, rx, topY);
    ctx.stroke();

    // Light neighbour bridge
    if (left) {
      const lTop = left.sy - s * 0.22;
      const midX = (left.sx + p.sx) / 2;
      const midY = (lTop + topY) / 2 - s * 0.04;
      ctx.strokeStyle = mid;
      ctx.lineWidth = Math.max(1.4, s * 0.24);
      ctx.beginPath();
      ctx.moveTo(left.sx + halfW * 0.65, lTop);
      ctx.quadraticCurveTo(midX, midY - s * 0.06, lx, topY);
      ctx.stroke();
    }

    if (p.kind === "inc") {
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.arc(p.sx, p.sy - s * 0.02, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
    }
    if (isActive) {
      ctx.strokeStyle = "rgba(226,59,47,0.4)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, s * 0.7, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function updateHud() {
    const nShow = Math.min(cursor, laid.length);
    let round = 0, roundSize = 0, idx = 0;
    if (nShow > 0) {
      const st = laid[nShow - 1];
      round = st.round;
      roundSize = st.roundSize;
      idx = st.idxInRound + 1;
    }
    const maxRound = laid.length ? laid[laid.length - 1].round : 0;
    hudRound.textContent = nShow ? ("第 " + round + " 圈 · " + idx + "/" + roundSize) : "第 0 圈";
    hudStitch.textContent = nShow + " / " + laid.length + " 針";
    // header counter: live completed while playing; otherwise pattern total
    totalEl.textContent = (playing || nShow > 0 ? nShow : laid.length) + " 針";
  }

  function updatePlayBtn() {
    const btn = document.getElementById("simPlay");
    if (btn) btn.textContent = playing ? "▶ 播放中…" : "▶ 播放";
  }

  function tick(t) {
    const need = panel.classList.contains("active") && (playing || autoSpin || drag);
    if (!need) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(tick);
    if (autoSpin && !drag) yaw += 0.006;

    if (playing) {
      const speed = Number(speedEl.value) || 5; // 1..10
      // stitch-by-stitch: faster at high speed
      const interval = Math.max(16, 420 - speed * 38); // ~382ms .. 40ms
      // at high speed advance multiple stitches per tick for long patterns
      const burst = speed >= 8 ? 3 : speed >= 6 ? 2 : 1;
      if (t - lastTick >= interval) {
        lastTick = t;
        if (cursor < laid.length) {
          cursor = Math.min(laid.length, cursor + burst);
          updateHud();
          renderLines();
        } else {
          playing = false;
          updatePlayBtn();
        }
      }
    }
    draw();
  }

  function startLoop() {
    if (raf) return;
    lastTick = performance.now();
    raf = requestAnimationFrame(tick);
  }

  document.getElementById("simPlay").addEventListener("click", () => {
    if (!laid.length) reparse(true);
    if (!laid.length) return;
    if (cursor >= laid.length) cursor = 0;
    playing = true;
    updatePlayBtn();
    lastTick = performance.now();
    startLoop();
  });
  document.getElementById("simPause").addEventListener("click", () => {
    playing = false;
    updatePlayBtn();
  });
  document.getElementById("simStep").addEventListener("click", () => {
    if (!laid.length) reparse(true);
    playing = false;
    updatePlayBtn();
    if (cursor < laid.length) cursor += 1;
    updateHud();
    renderLines();
    draw();
  });
  document.getElementById("simReplay").addEventListener("click", () => {
    cursor = 0;
    playing = true;
    updatePlayBtn();
    updateHud();
    renderLines();
    lastTick = performance.now();
    startLoop();
  });

  textareaEl.addEventListener("input", () => {
    activePreset = "custom";
    renderPresets();
    reparse(false);
    syncEditorFromTextarea();
  });
  textareaEl.addEventListener("blur", () => {
    // show highlighted line view again
    renderLines();
  });
  textareaEl.addEventListener("focus", () => {
    // raw editor visible via CSS
  });

  titleEl.addEventListener("input", () => {});

  const zoomPctEl = document.getElementById("simZoomPct");
  const zoomPctEl2 = document.getElementById("simZoomPct2");
  const zoomPctEl3 = document.getElementById("simZoomPct3");
  const zoomSlider = document.getElementById("simZoomSlider");
  const zoomSlider2 = document.getElementById("simZoomSlider2");

  function clampZoom(z) {
    return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
  }
  function updateZoomLabel() {
    const pct = Math.round(userZoom * 100);
    const label = pct + "%";
    if (zoomPctEl) zoomPctEl.textContent = label;
    if (zoomPctEl2) zoomPctEl2.textContent = label;
    if (zoomPctEl3) zoomPctEl3.textContent = label;
    [zoomSlider, zoomSlider2].forEach((s) => {
      if (!s) return;
      if (document.activeElement === s) return;
      s.value = String(pct);
      s.setAttribute("aria-valuenow", String(pct));
    });
  }
  function setZoom(z) {
    userZoom = clampZoom(z);
    updateZoomLabel();
    autoSpin = false;
    draw();
    startLoop();
  }
  function resetView() {
    userZoom = 1;
    yaw = 0.55;
    pitch = 0.55;
    updateZoomLabel();
    draw();
    startLoop();
  }
  function pointerDist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
  function pauseSpinBriefly() {
    autoSpin = false;
    clearTimeout(pauseSpinBriefly._t);
    pauseSpinBriefly._t = setTimeout(() => {
      if (!drag && pointers.size === 0 && !pinchStart) {
        autoSpin = true;
        startLoop();
      }
    }, 1400);
  }

  // Global backups for inline onclick (works even if addEventListener fails on some WebViews)
  window.__simZoom = function (factor) {
    setZoom(userZoom * Number(factor));
    pauseSpinBriefly();
    return false;
  };
  window.__simResetView = function () {
    resetView();
    pauseSpinBriefly();
    return false;
  };
  window.__simSetZoomPct = function (pct) {
    setZoom(Number(pct) / 100);
    pauseSpinBriefly();
    return false;
  };

  // Buttons: inline onclick + touchend (iOS/WebView often need explicit touch)
  function wireZoomTap(el, fn) {
    if (!el) return;
    let last = 0;
    const run = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const now = performance.now();
      if (now - last < 280) return;
      last = now;
      fn();
    };
    el.addEventListener("touchend", run, { passive: false });
    // click for desktop / accessibility; skipped after touchend via debounce
    el.addEventListener("click", run);
  }
  wireZoomTap(document.getElementById("simZoomIn"), () => window.__simZoom(1.25));
  wireZoomTap(document.getElementById("simZoomOut"), () => window.__simZoom(1 / 1.25));
  wireZoomTap(document.getElementById("simZoomReset"), () => window.__simResetView());
  wireZoomTap(document.getElementById("simZoomIn2"), () => window.__simZoom(1.25));
  wireZoomTap(document.getElementById("simZoomOut2"), () => window.__simZoom(1 / 1.25));
  wireZoomTap(document.getElementById("simZoomReset2"), () => window.__simResetView());

  // —— Impossible-to-miss range sliders (dock + below canvas) ——
  function wireSlider(s) {
    if (!s) return;
    const fromSlider = () => {
      setZoom(Number(s.value) / 100);
      pauseSpinBriefly();
    };
    s.addEventListener("input", fromSlider);
    s.addEventListener("change", fromSlider);
  }
  wireSlider(zoomSlider);
  wireSlider(zoomSlider2);

  // —— Rotate / pinch on CANVAS only ——
  let lastTap = 0;
  function onCanvasPointerDown(e) {
    if (e.target !== canvas) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    autoSpin = false;
    if (pointers.size >= 2) {
      const pts = [...pointers.values()];
      pinchStart = { dist: pointerDist(pts[0], pts[1]), zoom: userZoom };
      drag = null;
    } else if (pointers.size === 1) {
      if (e.pointerType === "mouse") {
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      }
      const now = performance.now();
      if (now - lastTap < 280) {
        resetView();
        lastTap = 0;
      } else {
        lastTap = now;
        drag = { x: e.clientX, y: e.clientY, yaw, pitch };
      }
    }
  }
  function onCanvasPointerMove(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size >= 2) {
      const pts = [...pointers.values()];
      const d = pointerDist(pts[0], pts[1]);
      if (!pinchStart) pinchStart = { dist: d, zoom: userZoom };
      if (pinchStart.dist > 8) {
        setZoom(pinchStart.zoom * (d / pinchStart.dist));
      }
      drag = null;
      return;
    }
    if (!drag) return;
    yaw = drag.yaw + (e.clientX - drag.x) * 0.01;
    pitch = Math.max(0.15, Math.min(1.2, drag.pitch + (e.clientY - drag.y) * 0.008));
    draw();
  }
  function onCanvasPointerUp(e) {
    if (e && e.pointerId != null) {
      pointers.delete(e.pointerId);
      try { if (canvas.hasPointerCapture && canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId); } catch (err) {}
    } else {
      pointers.clear();
    }
    if (pointers.size < 2) pinchStart = null;
    if (pointers.size === 1) {
      const p = [...pointers.values()][0];
      drag = { x: p.x, y: p.y, yaw, pitch };
    } else {
      drag = null;
      pauseSpinBriefly();
    }
  }
  canvas.addEventListener("pointerdown", onCanvasPointerDown);
  canvas.addEventListener("pointermove", onCanvasPointerMove);
  canvas.addEventListener("pointerup", onCanvasPointerUp);
  canvas.addEventListener("pointercancel", onCanvasPointerUp);

  // TouchEvent pinch fallback
  let touchPinch = null;
  canvas.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      drag = null;
      pointers.clear();
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchPinch = { dist: d, zoom: userZoom };
      autoSpin = false;
    }
  }, { passive: false });
  canvas.addEventListener("touchmove", (e) => {
    if (e.touches.length === 2 && touchPinch) {
      e.preventDefault();
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (touchPinch.dist > 8) setZoom(touchPinch.zoom * (d / touchPinch.dist));
    }
  }, { passive: false });
  canvas.addEventListener("touchend", (e) => {
    if (e.touches.length < 2) {
      touchPinch = null;
      pauseSpinBriefly();
    }
  });
  canvas.addEventListener("touchcancel", () => { touchPinch = null; });

  function onWheelZoom(e) {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(userZoom * factor);
    pauseSpinBriefly();
  }
  wrap.addEventListener("wheel", onWheelZoom, { passive: false });
  canvas.addEventListener("wheel", onWheelZoom, { passive: false });

  updateZoomLabel();

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.dataset.tab === "sim") {
        requestAnimationFrame(() => { resize(); startLoop(); });
      }
    });
  });
  window.addEventListener("resize", () => {
    if (panel.classList.contains("active")) resize();
  });

  // init
  renderPresets();
  loadPreset("sphere");
  resize();
})();
