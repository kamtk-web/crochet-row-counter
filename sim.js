/* Gurumi-style stitch-by-stitch crochet simulator (Cantonese UI) */
(function () {
  "use strict";

  const DEFAULT_COLORS = {
    A: "#f5f0e6",
    B: "#c4a574",
    C: "#5c4030",
    D: "#e05a4a",
    E: "#f0a03a",
    F: "#f2a0b8",
  };

  const YARN_PALETTE = [
    { hex: "#f5f0e6", name: "乳白" },
    { hex: "#ffffff", name: "白" },
    { hex: "#e8d5b5", name: "奶油" },
    { hex: "#c4a574", name: "淺啡" },
    { hex: "#8b5a2b", name: "啡" },
    { hex: "#5c4030", name: "深啡" },
    { hex: "#f2a0b8", name: "粉紅" },
    { hex: "#e05a4a", name: "紅" },
    { hex: "#e07a3a", name: "珊瑚" },
    { hex: "#f0a03a", name: "橙" },
    { hex: "#f5d76e", name: "黃" },
    { hex: "#6ecf97", name: "綠" },
    { hex: "#6ba3d6", name: "藍" },
    { hex: "#9a9a9a", name: "灰" },
    { hex: "#2a241c", name: "黑" },
  ];

  const SIM_STORE_KEY = "crochet-sim-v1";

  const PRESETS = [
    {
      id: "cookie-cat",
      preferredMode: "3d",
      label: "織織・餅乾夾心貓",
      title: "餅乾夾心貓",
      colors: { A: "#f5f0e6", B: "#c4a574", C: "#5c4030", D: "#e05a4a", E: "#f0a03a", F: "#f2a0b8" },
      pattern:
`Head, with A:
Rnd 1: 8 sc in MR (8)
Rnd 2: inc x8 (16)
Rnd 3: (sc, inc) x6, inc x4 (26)
Rnd 4: inc x14, 12 sc (40)
Rnds 5-9: sc around (40)
Rnd 10: dec x14, 12 sc (26)
Rnd 11: sc around (26)
Rnd 12: dec x10, 6 sc (16)
Rnd 13: dec x8 (8)
FO

Wrapper, with B:
Rnd 1: 8 sc in MR (8)
Rnd 2: inc x8 (16)
Rnd 3: (sc, inc) x8 (24)
Rnd 4: (2 sc, inc) x8 (32)
Rnd 5: (3 sc, inc) x8 (40)
FO`,
    },
    {
      id: "coffee-cup",
      preferredMode: "3d",
      label: "織織・咖啡杯",
      title: "咖啡杯",
      colors: { A: "#c4a574", B: "#f5f0e6", C: "#5c4030", D: "#e05a4a", E: "#f0a03a", F: "#f2a0b8" },
      pattern:
`Cup, with A:
Rnd 1: 6 sc in MR (6)
Rnd 2: inc x6 (12)
Rnd 3: (sc, inc) x6 (18)
Rnd 4: sc around (18)
Rnds 5-10: sc around (18)
FO`,
    },
    {
      id: "sphere",
      preferredMode: "3d",
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
      preferredMode: "flat",
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
      id: "mandala",
      label: "花曼陀羅",
      title: "花曼陀羅杯墊",
      preferredMode: "flat",
      colors: { A: "#b89bc9", B: "#f3efe6", C: "#5c4030", D: "#e05a4a", E: "#f0a03a", F: "#f2a0b8" },
      pattern:
`Mandala, with A:
Rnd 1: 6 sc in MR (6)
Rnd 2: inc x6 (12)
Rnd 3: (sc, inc) x6 (18)
Rnd 4: (2 sc, inc) x6 (24)
Rnd 5: (3 sc, inc) x6 (30)
Rnd 6: (4 sc, inc) x6 (36)
Rnd 7: change to B, (5 sc, inc) x6 (42)
Rnd 8: sc around (42)
Rnd 9: (6 sc, inc) x6 (48)
Rnd 10: sc around (48)
Rnd 11: (7 sc, inc) x6 (54)
Rnd 12: sc around (54)
FO`,
    },
    {
      id: "chick",
      preferredMode: "3d",
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
        if (/^(?:dec|減針|sc3tog)$/i.test(t)) {
          pushStitch("dec", lineIndex, round, made); made++;
          continue;
        }

        // N sc3tog
        m = t.match(/^(\d+)\s*sc3tog$/i) || t.match(/^sc3tog\s*[x×*]?\s*(\d+)$/i);
        if (m) {
          const n = +m[1];
          for (let i = 0; i < n; i++) {
            pushStitch("dec", lineIndex, round, made);
            made++;
          }
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
              } else if (/^(?:dec|減針|sc3tog)$/i.test(p)) {
                pushStitch("dec", lineIndex, round, made); made++;
              } else if ((pm = p.match(/^(\d+)\s*sc3tog$/i))) {
                const n = +pm[1];
                for (let j = 0; j < n; j++) {
                  pushStitch("dec", lineIndex, round, made); made++;
                }
              } else if ((pm = p.match(/^(\d+)\s*(?:sc|短針)$/i)) || (pm = p.match(/^(?:sc|短針)$/i))) {
                const n = pm && pm[1] ? +pm[1] : 1;
                for (let j = 0; j < n; j++) {
                  pushStitch("sc", lineIndex, round, made); made++;
                }
              } else if ((pm = p.match(/^(\d+)\s*(?:hdc|中長針)$/i)) || (pm = p.match(/^(?:hdc|中長針)$/i))) {
                const n = pm && pm[1] ? +pm[1] : 1;
                for (let j = 0; j < n; j++) {
                  pushStitch("hdc", lineIndex, round, made); made++;
                }
              } else if ((pm = p.match(/^(\d+)\s*(?:dc|長針)$/i)) || (pm = p.match(/^(?:dc|長針)$/i))) {
                const n = pm && pm[1] ? +pm[1] : 1;
                for (let j = 0; j < n; j++) {
                  pushStitch("dc", lineIndex, round, made); made++;
                }
              } else if ((pm = p.match(/^(\d+)\s*(?:ch|鎖針)$/i)) || (pm = p.match(/^(?:ch|鎖針)$/i))) {
                const n = pm && pm[1] ? +pm[1] : 1;
                for (let j = 0; j < n; j++) {
                  pushStitch("ch", lineIndex, round, made); made++;
                }
              } else if ((pm = p.match(/^(\d+)\s*(?:sc|短針)?$/i))) {
                const n = +pm[1];
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

        // N hdc / hdc / 中長針
        m = t.match(/^(\d+)\s*(?:hdc|中長針)$/i);
        if (m) {
          const n = +m[1];
          for (let i = 0; i < n; i++) { pushStitch("hdc", lineIndex, round, made); made++; }
          continue;
        }
        if (/^(?:hdc|中長針)$/i.test(t)) {
          pushStitch("hdc", lineIndex, round, made); made++;
          continue;
        }

        // N dc / dc / 長針
        m = t.match(/^(\d+)\s*(?:dc|長針)$/i);
        if (m) {
          const n = +m[1];
          for (let i = 0; i < n; i++) { pushStitch("dc", lineIndex, round, made); made++; }
          continue;
        }
        if (/^(?:dc|長針)$/i.test(t)) {
          pushStitch("dc", lineIndex, round, made); made++;
          continue;
        }

        // N ch / ch / 鎖針
        m = t.match(/^(\d+)\s*(?:ch|鎖針)$/i);
        if (m) {
          const n = +m[1];
          for (let i = 0; i < n; i++) { pushStitch("ch", lineIndex, round, made); made++; }
          continue;
        }
        if (/^(?:ch|鎖針)$/i.test(t)) {
          pushStitch("ch", lineIndex, round, made); made++;
          continue;
        }

        // hdc/dc around
        if (/^(?:hdc|中長針)\s*around$/i.test(t)) {
          const n = prevCount || 6;
          for (let i = 0; i < n; i++) { pushStitch("hdc", lineIndex, round, made); made++; }
          continue;
        }
        if (/^(?:dc|長針)\s*around$/i.test(t)) {
          const n = prevCount || 6;
          for (let i = 0; i < n; i++) { pushStitch("dc", lineIndex, round, made); made++; }
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
      // ignore BLO: / FLO: prefix (back/front loop only)
      s = s.replace(/^(?:BLO|FLO)\s*:\s*/i, "");
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

      // special: "sc/hdc/dc around"
      if (/^(?:sc|短針)\s*around$/i.test(s) || /^sc\s*around$/i.test(s)) {
        const n = prevCount || 6;
        for (let i = 0; i < n; i++) pushStitch("sc", lineIndex, round, i);
        if (expected != null && n !== expected) {
          reports.push({ line: lineIndex + 1, level: "warn", msg: "針數唔夾：計到 " + n + "，括號寫 " + expected });
        }
        prevCount = n;
        return n;
      }
      if (/^(?:hdc|中長針)\s*around$/i.test(s)) {
        const n = prevCount || 6;
        for (let i = 0; i < n; i++) pushStitch("hdc", lineIndex, round, i);
        if (expected != null && n !== expected) {
          reports.push({ line: lineIndex + 1, level: "warn", msg: "針數唔夾：計到 " + n + "，括號寫 " + expected });
        }
        prevCount = n;
        return n;
      }
      if (/^(?:dc|長針)\s*around$/i.test(s)) {
        const n = prevCount || 6;
        for (let i = 0; i < n; i++) pushStitch("dc", lineIndex, round, i);
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
  const STITCH_ARC = 0.44; // arc length per stitch → radius (tighter fabric)
  const STITCH_H = 0.38;   // vertical pitch between rounds

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


  function layoutFlatStitches(stitches) {
    // Top-down polar layout: concentric rounds on a plane (chart / 杯墊 view)
    const out = [];
    let lastPiece = -1;
    let pieceOffsetX = 0;
    let prevRoundStart = -1;
    let prevRoundN = 0;
    let prevPiece = -1;
    let pieceCount = 0;

    let i = 0;
    while (i < stitches.length) {
      const st0 = stitches[i];
      if (st0.pieceIndex !== lastPiece) {
        if (lastPiece >= 0) {
          pieceCount += 1;
          pieceOffsetX = pieceCount * 6.5; // side-by-side pieces in flat view
        }
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
      // Even ring spacing (chart-like) with slight growth from stitch density
      // Chart-like even rings; slight bump when a round is very dense
      const radius = Math.max(0.28, 0.42 + (round - 1) * 0.58 + Math.max(0, n - 12) * 0.008);
      const roundStart = out.length;
      for (let k = 0; k < n; k++) {
        const st = stitches[i + k];
        const ang = (k / n) * Math.PI * 2 - Math.PI / 2;
        let parentIndex = -1;
        if (prevRoundN > 0 && prevPiece === pieceIndex) {
          const pk = Math.min(prevRoundN - 1, Math.floor((k + 0.5) * prevRoundN / n));
          parentIndex = prevRoundStart + pk;
        }
        out.push({
          ...st,
          x: Math.cos(ang) * radius + pieceOffsetX,
          y: 0,
          z: Math.sin(ang) * radius,
          ang,
          radius,
          globalIndex: i + k,
          parentIndex,
          leftIndex: k > 0 ? roundStart + k - 1 : -1,
          roundStart,
          roundN: n,
          kInRound: k,
          flat: true,
        });
      }
      prevRoundStart = roundStart;
      prevRoundN = n;
      prevPiece = pieceIndex;
      i = j;
    }
    // center on pieces
    if (out.length) {
      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      out.forEach((p) => {
        minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
        minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
      });
      const cx = (minX + maxX) / 2;
      const cz = (minZ + maxZ) / 2;
      out.forEach((p) => { p.x -= cx; p.z -= cz; });
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
  let viewMode = "3d"; // "3d" | "flat"
  let panX = 0;
  let panY = 0;
  let flatRot = 0; // in-plane rotation for flat mode

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

  function persistSim() {
    try {
      localStorage.setItem(SIM_STORE_KEY, JSON.stringify({
        colors: colors,
        activeColorKey: activeColorKey,
        activePreset: activePreset,
        viewMode: viewMode,
        title: titleEl ? titleEl.value : "",
        pattern: textareaEl ? textareaEl.value : patternText,
      }));
    } catch (e) {}
  }

  function loadPersistedSim() {
    try {
      return JSON.parse(localStorage.getItem(SIM_STORE_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function syncColorPicker() {
    if (colorPicker) colorPicker.value = colors[activeColorKey] || DEFAULT_COLORS.A;
  }

  function applyYarnColor(hex) {
    if (!hex) return;
    colors[activeColorKey] = hex;
    syncColorPicker();
    renderSwatches();
    renderYarnPalette();
    reparse(false);
    persistSim();
  }

  function renderSwatches() {
    if (!swatchesEl) return;
    swatchesEl.innerHTML = "";
    "ABCDEF".split("").forEach((k) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "sim-swatch" + (k === activeColorKey ? " on" : "");
      b.title = "揀色號 " + k + "（而家 " + (colors[k] || "") + "）";
      b.setAttribute("aria-label", "色 " + k);
      b.style.background = colors[k];
      b.dataset.key = k;
      b.addEventListener("click", () => {
        activeColorKey = k;
        syncColorPicker();
        renderSwatches();
        renderYarnPalette();
        persistSim();
      });
      swatchesEl.appendChild(b);
    });
  }

  function renderYarnPalette() {
    const el = document.getElementById("simYarnPalette");
    if (!el) return;
    el.innerHTML = "";
    const activeHex = String(colors[activeColorKey] || "").toLowerCase();
    YARN_PALETTE.forEach((y) => {
      const b = document.createElement("button");
      b.type = "button";
      const hex = y.hex.toLowerCase();
      b.className = "sim-yarn-chip" + (hex === activeHex ? " on" : "");
      b.title = y.name + " " + y.hex;
      b.setAttribute("aria-label", y.name);
      b.style.background = y.hex;
      b.addEventListener("click", () => applyYarnColor(y.hex));
      el.appendChild(b);
    });
  }

  const colorPicker = document.getElementById("simColorPicker");
  if (colorPicker) {
    colorPicker.addEventListener("input", () => {
      applyYarnColor(colorPicker.value);
    });
  }


  function renderModeToggle() {
    const b3 = document.getElementById("simMode3d");
    const bf = document.getElementById("simModeFlat");
    const hint = document.getElementById("simModeHint");
    if (b3) {
      b3.classList.toggle("on", viewMode === "3d");
      b3.setAttribute("aria-pressed", viewMode === "3d" ? "true" : "false");
    }
    if (bf) {
      bf.classList.toggle("on", viewMode === "flat");
      bf.setAttribute("aria-pressed", viewMode === "flat" ? "true" : "false");
    }
    if (hint) {
      hint.textContent = viewMode === "flat"
        ? "平面：由中心向外填圓形圖／杯墊"
        : "立體：層層疊 3D 公仔";
    }
    if (wrap) {
      wrap.title = viewMode === "flat"
        ? "平面：拖曳平移 · 雙指／滾輪縮放 · 雙擊重設"
        : "立體：拖曳轉角度 · 雙指縮放 · 滾輪縮放";
    }
  }

  function setViewMode(mode, doReparse) {
    const next = mode === "flat" ? "flat" : "3d";
    if (viewMode === next && doReparse !== true) {
      renderModeToggle();
      return;
    }
    viewMode = next;
    if (viewMode === "flat") {
      autoSpin = false;
      // mild top-down reset of 3d angles kept for switch-back
    } else {
      autoSpin = true;
    }
    renderModeToggle();
    if (doReparse !== false) {
      const keep = cursor;
      reparse(false);
      cursor = Math.min(keep, laid.length);
      updateHud();
      renderLines();
      draw();
    }
    persistSim();
    startLoop();
  }


  const mode3dBtn = document.getElementById("simMode3d");
  const modeFlatBtn = document.getElementById("simModeFlat");
  if (mode3dBtn) mode3dBtn.addEventListener("click", () => setViewMode("3d"));
  if (modeFlatBtn) modeFlatBtn.addEventListener("click", () => setViewMode("flat"));

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
    if (p.preferredMode === "flat" || p.preferredMode === "3d") {
      setViewMode(p.preferredMode, false);
    }
    renderPresets();
    renderSwatches();
    renderYarnPalette();
    syncColorPicker();
    reparse(true);
    persistSim();
  }

  function reparse(reset) {
    patternText = textareaEl.value;
    parsed = parsePattern(patternText, colors);
    laid = viewMode === "flat"
      ? layoutFlatStitches(parsed.stitches)
      : layoutStitches(parsed.stitches);
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
    const warns = parsed.reports.filter((r) => r.level === "warn" || r.level === "bad");
    if (totalEl) {
      const base = (playing || cursor > 0 ? Math.min(cursor, laid.length) : laid.length) + " 針";
      totalEl.innerHTML = warns.length
        ? base + "<span class='sim-total-warn'>· " + warns.length + " 處要睇</span>"
        : base;
    }
    if (!rows.length) {
      parseEl.innerHTML = "<div class='row ok'>織圖 OK · 共 " + parsed.total + " 針</div>";
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

  function highlightPatternLine(line) {
    if (!line) return " ";
    let s = escapeHtml(line);
    // order matters: longer / specific first
    s = s.replace(/\b(Rnds?|Rounds?|Rnd|Round|第)\b/gi, '<span class="tok-rnd">$1</span>');
    s = s.replace(/\b(change\s+to|with)\s+([A-F])\b/gi, '<span class="tok-color">$1 $2</span>');
    s = s.replace(/\b(FO|finish\s*off)\b/gi, '<span class="tok-fo">$1</span>');
    s = s.replace(/\b(inc|加針)\b/gi, '<span class="tok-inc">$1</span>');
    s = s.replace(/\b(dec|減針|sc3tog)\b/gi, '<span class="tok-dec">$1</span>');
    s = s.replace(/\b(hdc|dc|sc|ch|sl\s*st|ss|短針|中長針|長針|鎖針|滑針|MR|magic\s*ring|魔術環)\b/gi, '<span class="tok-st">$1</span>');
    s = s.replace(/\b(\d+)\b/g, '<span class="tok-num">$1</span>');
    s = s.replace(/([()])/g, '<span class="tok-paren">$1</span>');
    // piece header leftover: Name, …
    if (/^[^:<]*[,：:]/.test(line) && /with/i.test(line)) {
      s = s.replace(/^([^,<]+)/, '<span class="tok-piece">$1</span>');
    }
    return s;
  }

  function renderLines() {
    const rawLines = String(textareaEl.value || "").split(/\r?\n/);
    const active = activeLineIndex();
    const html = rawLines.map((line, i) => {
      const cls = i === active ? "sim-line on" : "sim-line";
      return "<div class='" + cls + "' data-i='" + i + "'><span class='sim-ln'>" + (i + 1) + "</span><span class='sim-lt'>" + highlightPatternLine(line || "") + "</span></div>";
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
    if (viewMode === "flat") {
      drawFlat();
      return;
    }
    draw3d();
  }

  function draw3d() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    // ground shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.88, w * 0.26, h * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();

    const nShow = Math.min(cursor, laid.length);
    if (nShow === 0) {
      ctx.fillStyle = "rgba(168,152,136,0.85)";
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
    const kind = p.kind || "sc";
    const tall = kind === "dc" ? 1.28 : kind === "hdc" ? 1.12 : kind === "ch" || kind === "sl" ? 0.72 : 1;
    // Footprint tracks spacing; thicker yarn tubes toward Knotly-like fabric
    const sRaw = scale * STITCH_ARC * 1.05;
    const s = Math.max(3.6, Math.min(22, sRaw)) * (0.88 + 0.22 * depthNorm) * tall;
    const col = p.color;
    const dark = shade(col, -0.32);
    const mid = shade(col, -0.12);
    const light = shade(col, 0.22);
    const hi = shade(col, 0.38);

    let ax = p.sx;
    let ay = p.sy + s * 0.92;
    if (parent) {
      ax = parent.sx * 0.32 + p.sx * 0.68;
      ay = parent.sy - s * 0.02;
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const topY = p.sy - s * 0.18;
    const halfW = s * 0.54;
    const lx = p.sx - halfW;
    const rx = p.sx + halfW;
    const lw = Math.max(2.2, s * 0.42); // thick yarn body

    // Soft contact shadow under stitch (fabric AO)
    ctx.beginPath();
    ctx.ellipse(p.sx, (ay + p.sy) * 0.52, s * 0.48, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(20,16,12," + (0.08 + 0.1 * (1 - depthNorm)) + ")";
    ctx.fill();

    // Soft yarn fill between posts (reads as fabric surface, not cage)
    ctx.beginPath();
    ctx.moveTo(lx + s * 0.04, topY);
    ctx.quadraticCurveTo(p.sx - s * 0.08, p.sy + s * 0.05, ax - s * 0.02, ay);
    ctx.quadraticCurveTo(p.sx + s * 0.08, p.sy + s * 0.05, rx - s * 0.04, topY);
    ctx.closePath();
    const g = ctx.createLinearGradient(lx, topY, rx, ay);
    g.addColorStop(0, mid);
    g.addColorStop(0.45, col);
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.55 + 0.2 * depthNorm;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Under-stroke (dark yarn edge)
    ctx.strokeStyle = dark;
    ctx.lineWidth = lw + 1.4;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(lx + s * 0.02, topY + 0.5);
    ctx.quadraticCurveTo(p.sx - s * 0.14, p.sy + s * 0.18, ax - s * 0.04, ay + 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rx - s * 0.02, topY + 0.5);
    ctx.quadraticCurveTo(p.sx + s * 0.14, p.sy + s * 0.18, ax + s * 0.04, ay + 0.6);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Main left / right posts (thick interlocking legs)
    ctx.strokeStyle = mid;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(lx + s * 0.02, topY);
    ctx.quadraticCurveTo(p.sx - s * 0.12, p.sy + s * 0.14, ax - s * 0.03, ay);
    ctx.stroke();

    ctx.strokeStyle = col;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(rx - s * 0.02, topY);
    ctx.quadraticCurveTo(p.sx + s * 0.12, p.sy + s * 0.14, ax + s * 0.03, ay);
    ctx.stroke();

    // Highlight ridge along posts (soft shading / yarn twist hint)
    ctx.strokeStyle = light;
    ctx.lineWidth = Math.max(1.1, lw * 0.32);
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(lx + s * 0.08, topY + s * 0.02);
    ctx.quadraticCurveTo(p.sx - s * 0.06, p.sy + s * 0.06, ax - s * 0.01, ay - s * 0.06);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rx - s * 0.08, topY + s * 0.02);
    ctx.quadraticCurveTo(p.sx + s * 0.06, p.sy + s * 0.06, ax + s * 0.01, ay - s * 0.06);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Lock through parent top chain (interlocking loop)
    if (parent) {
      ctx.strokeStyle = dark;
      ctx.lineWidth = Math.max(2.0, s * 0.34);
      ctx.beginPath();
      ctx.ellipse(ax, ay - s * 0.02, s * 0.28, s * 0.16, 0, 0.15, Math.PI - 0.15);
      ctx.stroke();
      ctx.strokeStyle = light;
      ctx.lineWidth = Math.max(1.2, s * 0.18);
      ctx.beginPath();
      ctx.ellipse(ax, ay - s * 0.04, s * 0.22, s * 0.12, 0, 0.3, Math.PI - 0.3);
      ctx.stroke();

      // redraw a bite of parent chain so it looks threaded
      const psRaw = scale * STITCH_ARC * 1.05;
      const ps = Math.max(3.6, Math.min(22, psRaw)) * (0.88 + 0.22 * Math.max(0, Math.min(1, (parent.depth + 8) / 16)));
      const pty = parent.sy - ps * 0.18;
      const phw = ps * 0.52;
      ctx.strokeStyle = shade(parent.color, -0.08);
      ctx.lineWidth = Math.max(2.0, ps * 0.36);
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.moveTo(parent.sx - phw * 0.6, pty);
      ctx.quadraticCurveTo(parent.sx, pty - ps * 0.34, parent.sx + phw * 0.6, pty);
      ctx.stroke();
      ctx.strokeStyle = shade(parent.color, 0.25);
      ctx.lineWidth = Math.max(1.1, ps * 0.16);
      ctx.beginPath();
      ctx.moveTo(parent.sx - phw * 0.45, pty - 0.5);
      ctx.quadraticCurveTo(parent.sx, pty - ps * 0.28, parent.sx + phw * 0.45, pty - 0.5);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Top chain loops — thicker interlocking ovals
    ctx.strokeStyle = dark;
    ctx.lineWidth = Math.max(2.0, s * 0.34);
    ctx.beginPath();
    ctx.ellipse(p.sx - s * 0.16, topY - s * 0.02, s * 0.24, s * 0.14, -0.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(p.sx + s * 0.16, topY - s * 0.02, s * 0.24, s * 0.14, 0.15, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = col;
    ctx.lineWidth = Math.max(1.6, s * 0.26);
    ctx.beginPath();
    ctx.ellipse(p.sx - s * 0.16, topY - s * 0.03, s * 0.18, s * 0.1, -0.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(p.sx + s * 0.16, topY - s * 0.03, s * 0.18, s * 0.1, 0.15, 0, Math.PI * 2);
    ctx.stroke();

    // Top bar bridging loops
    ctx.strokeStyle = mid;
    ctx.lineWidth = Math.max(2.2, s * 0.38);
    ctx.beginPath();
    ctx.moveTo(lx, topY);
    ctx.quadraticCurveTo(p.sx, topY - s * 0.36, rx, topY);
    ctx.stroke();
    ctx.strokeStyle = hi;
    ctx.lineWidth = Math.max(1.1, s * 0.16);
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.moveTo(lx + s * 0.06, topY - 0.8);
    ctx.quadraticCurveTo(p.sx, topY - s * 0.3, rx - s * 0.06, topY - 0.8);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Neighbour bridge — shared top chain abut
    if (left) {
      const lTop = left.sy - s * 0.18;
      const midX = (left.sx + p.sx) / 2;
      const midY = (lTop + topY) / 2 - s * 0.06;
      ctx.strokeStyle = dark;
      ctx.lineWidth = Math.max(2.0, s * 0.32);
      ctx.beginPath();
      ctx.moveTo(left.sx + halfW * 0.55, lTop);
      ctx.quadraticCurveTo(midX, midY - s * 0.08, lx, topY);
      ctx.stroke();
      ctx.strokeStyle = light;
      ctx.lineWidth = Math.max(1.1, s * 0.14);
      ctx.beginPath();
      ctx.moveTo(left.sx + halfW * 0.5, lTop - 0.6);
      ctx.quadraticCurveTo(midX, midY - s * 0.1, lx + 1, topY - 0.6);
      ctx.stroke();
    }

    if (kind === "inc") {
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.arc(p.sx, p.sy - s * 0.02, s * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
    if (kind === "ch" || kind === "sl") {
      // flatter chain / slip look — mute posts a bit already via tall factor
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(p.sx, topY, s * 0.35, s * 0.12, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (isActive) {
      ctx.strokeStyle = "rgba(226,59,47,0.45)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, s * 0.72, 0, Math.PI * 2);
      ctx.stroke();
    }
  }


  function drawFlat() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    // soft studio pad (looks like chart paper on dark UI)
    const padR = Math.min(w, h) * 0.46;
    const cx0 = w * 0.5 + panX;
    const cy0 = h * 0.5 + panY;
    ctx.beginPath();
    ctx.arc(cx0, cy0, padR * 1.02, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(246, 241, 232, 0.07)";
    ctx.fill();
    ctx.strokeStyle = "rgba(240,230,216,0.12)";
    ctx.lineWidth = 1;
    ctx.stroke();

    const nShow = Math.min(cursor, laid.length);
    if (nShow === 0) {
      // faint guide rings from pattern
      if (laid.length) {
        let maxR0 = 0.35;
        laid.forEach((p) => { maxR0 = Math.max(maxR0, Math.hypot(p.x, p.z) + 0.35); });
        const sc0 = (Math.min(w, h) * 0.42 / maxR0) * userZoom;
        drawFlatGuides(cx0, cy0, sc0, laid);
      }
      ctx.fillStyle = "rgba(168,152,136,0.9)";
      ctx.font = "600 14px PingFang HK, Noto Sans TC, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("平面模式：由中心向外一針一針填", w / 2, h * 0.48);
      ctx.font = "500 12px PingFang HK, Noto Sans TC, sans-serif";
      ctx.fillStyle = "rgba(168,152,136,0.7)";
      ctx.fillText("試吓「花曼陀羅」預設", w / 2, h * 0.48 + 22);
      return;
    }

    const pts = laid.slice(0, nShow);
    let maxR = 0.35;
    pts.forEach((p) => { maxR = Math.max(maxR, Math.hypot(p.x, p.z) + 0.35); });
    // also peek full pattern radius so zoom stays stable while filling
    laid.forEach((p) => { maxR = Math.max(maxR, Math.hypot(p.x, p.z) + 0.35); });
    const scale = (Math.min(w, h) * 0.42 / maxR) * userZoom;

    // ghost rings for remaining rounds
    drawFlatGuides(cx0, cy0, scale, laid);

    const cosR = Math.cos(flatRot);
    const sinR = Math.sin(flatRot);
    function map(p) {
      const rx = p.x * cosR - p.z * sinR;
      const rz = p.x * sinR + p.z * cosR;
      return {
        sx: cx0 + rx * scale,
        sy: cy0 + rz * scale,
        ang: p.ang + flatRot,
        radius: p.radius,
        color: colors[p.color] || colors.A,
        kind: p.kind,
        idx: p.globalIndex,
        raw: p,
        parentIndex: p.parentIndex,
        kInRound: p.kInRound,
        roundStart: p.roundStart,
        roundN: p.roundN,
      };
    }

    const projected = pts.map(map);
    const byIdx = {};
    projected.forEach((p) => { byIdx[p.idx] = p; });
    // draw inner rounds first
    projected.sort((a, b) => (a.raw.radius - b.raw.radius) || (a.idx - b.idx));

    const stitchPx = Math.max(4.5, Math.min(18, scale * 0.42));
    for (const p of projected) {
      const parent = (p.parentIndex >= 0 && byIdx[p.parentIndex]) ? byIdx[p.parentIndex] : null;
      let left = null;
      if (p.kInRound > 0) {
        const li = laid[p.roundStart + p.kInRound - 1];
        if (li && byIdx[li.globalIndex]) left = byIdx[li.globalIndex];
      }
      drawFlatYarnStitch(p, stitchPx, p.idx === nShow - 1, parent, left);
    }

    const needle = byIdx[laid[nShow - 1].globalIndex];
    if (needle) {
      ctx.strokeStyle = "#e23b2f";
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(needle.sx, needle.sy - 20);
      ctx.lineTo(needle.sx, needle.sy + 5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(needle.sx, needle.sy - 22, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = "#e23b2f";
      ctx.fill();
      // small arc tick on current stitch
      ctx.strokeStyle = "rgba(226,59,47,0.55)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(needle.sx, needle.sy, stitchPx * 0.85, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawFlatGuides(cx, cy, scale, allLaid) {
    if (!allLaid || !allLaid.length) return;
    const seen = new Set();
    const unitScale = (scale && scale > 8) ? scale : 40; // px per world unit
    ctx.save();
    ctx.strokeStyle = "rgba(240,230,216,0.11)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    allLaid.forEach((p) => {
      const key = p.pieceIndex + ":" + p.round;
      if (seen.has(key)) return;
      seen.add(key);
      const rr = Math.max(4, (p.radius || Math.hypot(p.x, p.z) || 0.3) * unitScale);
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawFlatYarnStitch(p, s, isActive, parent, left) {
    const col = p.color;
    const dark = shade(col, -0.22);
    const light = shade(col, 0.18);
    const mid = shade(col, -0.06);
    const ang = p.ang;
    // radial = toward outside; tangential along the round
    const tx = -Math.sin(ang);
    const ty = Math.cos(ang);
    const rx = Math.cos(ang);
    const ry = Math.sin(ang);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // soft yarn body (top-down oval along the round)
    ctx.beginPath();
    ctx.ellipse(p.sx, p.sy, s * 0.55, s * 0.32, ang + Math.PI / 2, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.92;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = dark;
    ctx.lineWidth = Math.max(1.1, s * 0.12);
    ctx.stroke();

    // highlight strand
    ctx.strokeStyle = light;
    ctx.lineWidth = Math.max(1.2, s * 0.18);
    ctx.beginPath();
    ctx.moveTo(p.sx - tx * s * 0.35, p.sy - ty * s * 0.35);
    ctx.quadraticCurveTo(p.sx - rx * s * 0.08, p.sy - ry * s * 0.08, p.sx + tx * s * 0.35, p.sy + ty * s * 0.35);
    ctx.stroke();

    // V / post hint pointing slightly outward (like looking into a sc)
    ctx.strokeStyle = dark;
    ctx.lineWidth = Math.max(1.3, s * 0.2);
    ctx.beginPath();
    ctx.moveTo(p.sx - tx * s * 0.28, p.sy - ty * s * 0.28);
    ctx.lineTo(p.sx + rx * s * 0.18, p.sy + ry * s * 0.18);
    ctx.lineTo(p.sx + tx * s * 0.28, p.sy + ty * s * 0.28);
    ctx.stroke();

    // radial link into parent (locks to previous round)
    if (parent) {
      ctx.strokeStyle = mid;
      ctx.lineWidth = Math.max(1.2, s * 0.16);
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.moveTo(parent.sx + rx * s * 0.15, parent.sy + ry * s * 0.15);
      ctx.quadraticCurveTo(
        (parent.sx + p.sx) / 2 - tx * s * 0.05,
        (parent.sy + p.sy) / 2 - ty * s * 0.05,
        p.sx - rx * s * 0.2,
        p.sy - ry * s * 0.2
      );
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // neighbour bridge along the round
    if (left) {
      ctx.strokeStyle = shade(col, -0.1);
      ctx.lineWidth = Math.max(1.4, s * 0.22);
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(left.sx + tx * s * 0.25, left.sy + ty * s * 0.25);
      ctx.quadraticCurveTo(
        (left.sx + p.sx) / 2 + rx * s * 0.12,
        (left.sy + p.sy) / 2 + ry * s * 0.12,
        p.sx - tx * s * 0.25,
        p.sy - ty * s * 0.25
      );
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (p.kind === "inc") {
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.arc(p.sx + rx * s * 0.1, p.sy + ry * s * 0.1, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    if (isActive) {
      ctx.strokeStyle = "rgba(226,59,47,0.35)";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, s * 0.75, 0, Math.PI * 2);
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
    if (viewMode === "3d" && autoSpin && !drag) yaw += 0.006;

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
    persistSim();
  });
  textareaEl.addEventListener("blur", () => {
    // show highlighted line view again
    renderLines();
    persistSim();
  });
  textareaEl.addEventListener("focus", () => {
    // raw editor visible via CSS
  });

  titleEl.addEventListener("input", () => { persistSim(); });

  const zoomPctEl = document.getElementById("simZoomPct");
  const zoomPctEl3 = document.getElementById("simZoomPct3");
  const zoomSlider2 = document.getElementById("simZoomSlider2");

  function clampZoom(z) {
    return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
  }
  function updateZoomLabel() {
    const pct = Math.round(userZoom * 100);
    const label = pct + "%";
    if (zoomPctEl) zoomPctEl.textContent = label;
    if (zoomPctEl3) zoomPctEl3.textContent = label;
    if (zoomSlider2 && document.activeElement !== zoomSlider2) {
      zoomSlider2.value = String(pct);
      zoomSlider2.setAttribute("aria-valuenow", String(pct));
    }
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
    panX = 0;
    panY = 0;
    flatRot = 0;
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
        if (viewMode === "3d") autoSpin = true;
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

  // —— Bottom zoom slider ——
  function wireSlider(s) {
    if (!s) return;
    const fromSlider = () => {
      setZoom(Number(s.value) / 100);
      pauseSpinBriefly();
    };
    s.addEventListener("input", fromSlider);
    s.addEventListener("change", fromSlider);
  }
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
        drag = viewMode === "flat"
          ? { x: e.clientX, y: e.clientY, panX, panY, flat: true }
          : { x: e.clientX, y: e.clientY, yaw, pitch, flat: false };
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
    if (drag.flat || viewMode === "flat") {
      panX = drag.panX + (e.clientX - drag.x);
      panY = drag.panY + (e.clientY - drag.y);
    } else {
      yaw = drag.yaw + (e.clientX - drag.x) * 0.01;
      pitch = Math.max(0.15, Math.min(1.2, drag.pitch + (e.clientY - drag.y) * 0.008));
    }
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
      drag = viewMode === "flat"
        ? { x: p.x, y: p.y, panX, panY, flat: true }
        : { x: p.x, y: p.y, yaw, pitch, flat: false };
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


  /* ——— Upload chart / photo → colors + starter pattern ——— */
  let refImageDataUrl = null;
  let extractedHexes = [];

  function rgbDist(a, b) {
    return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
  }
  function hexFromRgb(r, g, b) {
    return "#" + [r, g, b].map((c) => {
      const h = Math.max(0, Math.min(255, c | 0)).toString(16);
      return h.length === 1 ? "0" + h : h;
    }).join("");
  }
  function isNearNeutralBg(r, g, b) {
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    // very dark / very light / grayish studio bg
    if (max < 28) return true;
    if (min > 235) return true;
    if (sat < 0.08 && (max > 200 || max < 60)) return true;
    return false;
  }

  function extractDominantColorsFromImage(img, maxColors) {
    const cap = Math.max(3, Math.min(6, maxColors || 6));
    const c = document.createElement("canvas");
    const size = 64;
    c.width = size;
    c.height = size;
    const cx = c.getContext("2d", { willReadFrequently: true });
    cx.drawImage(img, 0, 0, size, size);
    let data;
    try {
      data = cx.getImageData(0, 0, size, size).data;
    } catch (e) {
      return [];
    }
    const buckets = new Map();
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 140) continue;
      let r = data[i], g = data[i + 1], b = data[i + 2];
      if (isNearNeutralBg(r, g, b)) continue;
      // quantize
      r = (r >> 4) << 4;
      g = (g >> 4) << 4;
      b = (b >> 4) << 4;
      const key = (r << 16) | (g << 8) | b;
      const cur = buckets.get(key) || { r, g, b, n: 0 };
      cur.n += 1;
      buckets.set(key, cur);
    }
    const sorted = [...buckets.values()].sort((a, b) => b.n - a.n);
    const picked = [];
    for (const c0 of sorted) {
      if (picked.length >= cap) break;
      if (picked.some((p) => rgbDist(p, c0) < 42)) continue;
      picked.push(c0);
    }
    // if too few, loosen and refill
    if (picked.length < 2) {
      for (const c0 of sorted) {
        if (picked.length >= cap) break;
        if (picked.some((p) => rgbDist(p, c0) < 18)) continue;
        picked.push(c0);
      }
    }
    return picked.map((c0) => hexFromRgb(c0.r, c0.g, c0.b));
  }

  function applyExtractedColors(hexes) {
    extractedHexes = hexes.slice(0, 6);
    const keys = "ABCDEF";
    for (let i = 0; i < 6; i++) {
      if (extractedHexes[i]) colors[keys[i]] = extractedHexes[i];
    }
    activeColorKey = "A";
    renderSwatches();
    renderYarnPalette();
    syncColorPicker();
    reparse(false);
    persistSim();
  }

  function starterPattern(mode, title) {
    const name = title || (mode === "flat" ? "跟圖紙・平面" : "跟圖紙・立體");
    if (mode === "flat") {
      const hasB = !!extractedHexes[1];
      const lines = [
        name + ", with A:",
        "Rnd 1: 6 sc in MR (6)",
        "Rnd 2: inc x6 (12)",
        "Rnd 3: (sc, inc) x6 (18)",
        "Rnd 4: (2 sc, inc) x6 (24)",
        "Rnd 5: (3 sc, inc) x6 (30)",
        "Rnd 6: (4 sc, inc) x6 (36)",
      ];
      if (hasB) {
        lines.push(
          "Rnd 7: change to B, (5 sc, inc) x6 (42)",
          "Rnd 8: sc around (42)",
          "Rnd 9: (6 sc, inc) x6 (48)",
          "Rnd 10: sc around (48)"
        );
      } else {
        lines.push(
          "Rnd 7: (5 sc, inc) x6 (42)",
          "Rnd 8: sc around (42)",
          "Rnd 9: (6 sc, inc) x6 (48)",
          "Rnd 10: sc around (48)"
        );
      }
      lines.push("FO", "", "# 自動起步：按圓形圖紙／杯墊估。請改針數、色號同圈數對返你張圖。");
      return lines.join("\n");
    }
    return [
      name + ", with A:",
      "Rnd 1: 6 sc in MR (6)",
      "Rnd 2: inc x6 (12)",
      "Rnd 3: (sc, inc) x6 (18)",
      "Rnd 4: (2 sc, inc) x6 (24)",
      "Rnds 5-8: sc around (24)",
      "Rnd 9: (2 sc, dec) x6 (18)",
      "Rnd 10: (sc, dec) x6 (12)",
      "Rnd 11: dec x6 (6)",
      "FO",
      "",
      "# 自動起步：按立體小球估。請貼你嘅文字織圖，或改圈數／inc dec。",
    ].join("\n");
  }


  function updateUploadUI(statusText) {
    const preview = document.getElementById("simUploadPreview");
    const thumb = document.getElementById("simUploadThumb");
    const status = document.getElementById("simUploadStatus");
    const note = document.getElementById("simUploadColorNote");
    if (!preview) return;
    if (!refImageDataUrl) {
      preview.classList.remove("on");
      return;
    }
    preview.classList.add("on");
    if (thumb) thumb.src = refImageDataUrl;
    if (status) status.textContent = statusText || "已上載參考圖";
    if (note) {
      if (extractedHexes.length) {
        note.innerHTML = "<span class='sim-upload-badge'>自動</span>已抽出 " +
          extractedHexes.length + " 隻主色 → A–" + "ABCDEF"[Math.min(5, extractedHexes.length - 1)] +
          "。<span class='sim-upload-badge manual'>手動</span>織圖請自己改或撳「跟圖紙」。";
      } else {
        note.innerHTML = "<span class='sim-upload-badge manual'>手動</span>抽唔到清楚主色，請用上面色板自設。";
      }
    }
  }

  function handleImageFile(file) {
    if (!file || !String(file.type || "").startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      const img = new Image();
      img.onload = () => {
        refImageDataUrl = url;
        const hexes = extractDominantColorsFromImage(img, 6);
        applyExtractedColors(hexes.length ? hexes : []);
        activePreset = "custom";
        renderPresets();
        updateUploadUI(hexes.length ? "已抽色 · 參考圖" : "已上載 · 請手動揀色");
        try {
          const saved = loadPersistedSim() || {};
          saved.refImage = url.slice(0, 180000); // keep modest
          saved.extractedHexes = extractedHexes;
          localStorage.setItem(SIM_STORE_KEY, JSON.stringify({
            ...saved,
            colors: colors,
            activeColorKey: activeColorKey,
            activePreset: activePreset,
            viewMode: viewMode,
            title: titleEl ? titleEl.value : "",
            pattern: textareaEl ? textareaEl.value : patternText,
          }));
        } catch (e) {}
      };
      img.onerror = () => {
        updateUploadUI("讀相失敗");
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  }

  function applyFollowChart(mode) {
    const nextMode = mode === "flat" ? "flat" : "3d";
    const t = (titleEl && titleEl.value && titleEl.value.trim()) || (nextMode === "flat" ? "跟圖紙・平面" : "跟圖紙・立體");
    if (titleEl) titleEl.value = t;
    const pat = starterPattern(nextMode, t);
    textareaEl.value = pat;
    patternText = pat;
    activePreset = "custom";
    renderPresets();
    setViewMode(nextMode, false);
    reparse(true);
    persistSim();
    updateUploadUI(nextMode === "flat" ? "已填平面起步織圖（可改）" : "已填立體起步織圖（可改）");
  }

  function clearUploadRef() {
    refImageDataUrl = null;
    extractedHexes = [];
    updateUploadUI("");
    try {
      const saved = loadPersistedSim() || {};
      delete saved.refImage;
      delete saved.extractedHexes;
      localStorage.setItem(SIM_STORE_KEY, JSON.stringify({
        ...saved,
        colors: colors,
        activeColorKey: activeColorKey,
        activePreset: activePreset,
        viewMode: viewMode,
        title: titleEl ? titleEl.value : "",
        pattern: textareaEl ? textareaEl.value : patternText,
      }));
    } catch (e) {}
  }

  const uploadFile = document.getElementById("simUploadFile");
  const uploadDrop = document.getElementById("simUploadDrop");
  if (uploadDrop && uploadFile) {
    uploadDrop.addEventListener("click", () => uploadFile.click());
    uploadDrop.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        uploadFile.click();
      }
    });
    uploadFile.addEventListener("change", () => {
      const f = uploadFile.files && uploadFile.files[0];
      if (f) handleImageFile(f);
      uploadFile.value = "";
    });
    ["dragenter", "dragover"].forEach((ev) => {
      uploadDrop.addEventListener(ev, (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadDrop.classList.add("drag");
      });
    });
    ["dragleave", "drop"].forEach((ev) => {
      uploadDrop.addEventListener(ev, (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadDrop.classList.remove("drag");
      });
    });
    uploadDrop.addEventListener("drop", (e) => {
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) handleImageFile(f);
    });
    uploadDrop.addEventListener("paste", (e) => {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf("image") === 0) {
          const f = items[i].getAsFile();
          if (f) {
            e.preventDefault();
            handleImageFile(f);
            break;
          }
        }
      }
    });
  }
  // also allow paste when panel focused
  if (panel) {
    panel.addEventListener("paste", (e) => {
      if (!panel.classList.contains("active")) return;
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.indexOf("image") === 0) {
          const f = items[i].getAsFile();
          if (f) {
            e.preventDefault();
            handleImageFile(f);
            break;
          }
        }
      }
    });
  }
  const btnFlat = document.getElementById("simUploadApplyFlat");
  const btn3d = document.getElementById("simUploadApply3d");
  const btnClear = document.getElementById("simUploadClear");
  if (btnFlat) btnFlat.addEventListener("click", () => applyFollowChart("flat"));
  if (btn3d) btn3d.addEventListener("click", () => applyFollowChart("3d"));
  if (btnClear) btnClear.addEventListener("click", () => clearUploadRef());

  const btnSph = document.getElementById("simInsertSphereTpl");
  const btnFlt = document.getElementById("simInsertFlatTpl");
  const btnRep = document.getElementById("simReparseBtn");
  if (btnSph) btnSph.addEventListener("click", () => {
    if (titleEl) titleEl.value = "小球";
    textareaEl.value = [
      "小球, with A:",
      "Rnd 1: 6 sc in MR (6)",
      "Rnd 2: inc x6 (12)",
      "Rnd 3: (sc, inc) x6 (18)",
      "Rnd 4: (2 sc, inc) x6 (24)",
      "Rnds 5-8: sc around (24)",
      "Rnd 9: (2 sc, dec) x6 (18)",
      "Rnd 10: (sc, dec) x6 (12)",
      "Rnd 11: dec x6 (6)",
      "FO",
    ].join("\n");
    activePreset = "custom";
    renderPresets();
    setViewMode("3d", false);
    reparse(true);
    persistSim();
  });
  if (btnFlt) btnFlt.addEventListener("click", () => {
    if (titleEl) titleEl.value = "平面圓";
    textareaEl.value = [
      "平面圓, with A:",
      "Rnd 1: 8 sc in MR (8)",
      "Rnd 2: inc x8 (16)",
      "Rnd 3: (sc, inc) x8 (24)",
      "Rnd 4: (2 sc, inc) x8 (32)",
      "Rnd 5: (3 sc, inc) x8 (40)",
      "Rnd 6: (4 sc, inc) x8 (48)",
      "Rnds 7-8: sc around (48)",
      "FO",
    ].join("\n");
    activePreset = "custom";
    renderPresets();
    setViewMode("flat", false);
    reparse(true);
    persistSim();
  });
  if (btnRep) btnRep.addEventListener("click", () => {
    reparse(false);
    persistSim();
  });


  // init
  renderPresets();
  const saved = loadPersistedSim();
  if (saved && (saved.viewMode === "flat" || saved.viewMode === "3d")) {
    viewMode = saved.viewMode;
  }
  renderModeToggle();
  const startId = (saved && PRESETS.some((p) => p.id === saved.activePreset))
    ? saved.activePreset
    : "cookie-cat";
  loadPreset(startId);
  // loadPreset may override mode via preferredMode; honor saved mode if user had one
  if (saved && (saved.viewMode === "flat" || saved.viewMode === "3d")) {
    setViewMode(saved.viewMode, true);
  }
  if (saved && saved.colors) {
    colors = { ...DEFAULT_COLORS, ...saved.colors };
    if (saved.activeColorKey && colors[saved.activeColorKey]) {
      activeColorKey = saved.activeColorKey;
    }
    renderSwatches();
    renderYarnPalette();
    syncColorPicker();
    reparse(false);
  }
  if (saved && saved.pattern && saved.activePreset === "custom") {
    textareaEl.value = saved.pattern;
    if (saved.title) titleEl.value = saved.title;
    reparse(true);
  }
  if (saved && saved.refImage) {
    refImageDataUrl = saved.refImage;
    extractedHexes = Array.isArray(saved.extractedHexes) ? saved.extractedHexes : [];
    updateUploadUI(extractedHexes.length ? "已還原參考圖 · 抽色" : "已還原參考圖");
  }
  resize();
})();
