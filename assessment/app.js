/* DSOVS Self-Assessment - vanilla JS, no backend. State lives in localStorage. */
(function () {
  "use strict";

  var DATA = window.DSOVS_DATA;
  var STORE_KEY = "dsovs-assessment-v1";
  var LEVEL_LABELS = ["Initial", "Basic", "Managed", "Optimised"];

  if (!DATA || !Array.isArray(DATA.controls)) {
    document.getElementById("controls").innerHTML =
      '<div class="card empty">Could not load assessment data.</div>';
    return;
  }

  /* ---------- state ---------- */
  var state = load();

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { meta: { org: "", assessor: "", date: today(), target: 2 }, answers: {} };
  }
  var saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
    }, 150);
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function answer(id) {
    if (!state.answers[id]) state.answers[id] = { level: null, notes: "", evidence: {} };
    return state.answers[id];
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function paras(text) {
    return String(text || "").split(/\n\s*\n/).map(function (p) {
      return "<p>" + esc(p.trim()) + "</p>";
    }).join("");
  }
  function restParas(text) {
    var ps = String(text || "").split(/\n\s*\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    return ps.slice(1).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
  }
  function firstSentence(text) {
    var s = String(text || "").trim().split(/\n/)[0];
    var m = s.match(/^[\s\S]*?[.!?](\s|$)/);
    return (m ? m[0] : s).trim();
  }
  /* short, commit-style id derived from the assessment content (changes when answers change) */
  function shortHash(str) {
    var h1 = 0x811c9dc5 >>> 0;
    for (var i = 0; i < str.length; i++) { h1 ^= str.charCodeAt(i); h1 = Math.imul(h1, 0x01000193) >>> 0; }
    var h2 = (0x9e3779b1 ^ str.length) >>> 0;
    for (var j = 0; j < str.length; j++) { h2 = Math.imul((h2 ^ str.charCodeAt(j)) >>> 0, 0x85ebca77) >>> 0; }
    return (h1.toString(36) + h2.toString(36)).slice(0, 9);
  }
  function currentReportId() { return shortHash(JSON.stringify(state)); }

  var SHORT_PHASE = {
    "Organisation": "Org", "Requirements": "Req", "Design": "Design",
    "Code/Build": "Code", "Test": "Test", "Release/Deploy": "Release", "Operate/Monitor": "Operate",
  };
  function shortPhase(p) { return SHORT_PHASE[p] || p; }
  function maturityWord(v) {
    if (v == null) return "";
    if (v < 0.75) return "early-stage";
    if (v < 1.75) return "developing";
    if (v < 2.5) return "established";
    return "advanced";
  }
  function lerpShade(t) {
    t = Math.max(0, Math.min(1, t));
    var a = [224, 224, 229], b = [29, 29, 31];
    var r = Math.round(a[0] + (b[0] - a[0]) * t);
    var g = Math.round(a[1] + (b[1] - a[1]) * t);
    var bl = Math.round(a[2] + (b[2] - a[2]) * t);
    return "rgb(" + r + "," + g + "," + bl + ")";
  }
  function pipelineFlow(rows) {
    var stages = rows.map(function (r, i) {
      var has = r.avg != null;
      var t = has ? r.avg / 3 : 0;
      var bg = has ? lerpShade(t) : "var(--bg-subtle)";
      var col = has ? (t > 0.55 ? "#fff" : "var(--text)") : "var(--text-3)";
      var arrow = i < rows.length - 1 ? '<div class="pl-arrow" aria-hidden="true">&rsaquo;</div>' : "";
      return '<div class="pl-stage" style="background:' + bg + ";color:" + col + '" title="' +
          esc(r.phase) + (has ? " - " + r.avg.toFixed(1) + "/3" : " - not assessed") + '">' +
          '<div class="pl-name">' + esc(shortPhase(r.phase)) + "</div>" +
          '<div class="pl-val">' + (has ? r.avg.toFixed(1) : "&ndash;") + "</div>" +
        "</div>" + arrow;
    }).join("");
    return (
      '<div class="section-title">Maturity across the pipeline</div>' +
      '<div class="pipeline card">' +
        '<div class="pl-row">' + stages + "</div>" +
        '<div class="pl-cap">Stages run left to right, from the start of the lifecycle through to operations. Darker means more mature.</div>' +
      "</div>"
    );
  }

  /* ---------- SVG charts (dependency-free) ---------- */
  function donut(frac, label, sub) {
    var r = 54, c = 2 * Math.PI * r;
    frac = Math.max(0, Math.min(1, frac || 0));
    var off = c * (1 - frac);
    return (
      '<svg viewBox="0 0 140 140" class="donut" role="img" aria-label="Overall maturity ' + esc(label) + '">' +
        '<circle class="d-track" cx="70" cy="70" r="' + r + '"/>' +
        '<circle class="d-val" cx="70" cy="70" r="' + r + '" stroke-dasharray="' + c.toFixed(2) +
          '" stroke-dashoffset="' + off.toFixed(2) + '" transform="rotate(-90 70 70)"/>' +
        '<text class="d-num" x="70" y="72" text-anchor="middle">' + esc(label) + "</text>" +
        '<text class="d-sub" x="70" y="90" text-anchor="middle">' + esc(sub) + "</text>" +
      "</svg>"
    );
  }

  function radarChart(rows) {
    var N = rows.length, cx = 200, cy = 162, R = 112;
    if (!N) return "";
    function pt(i, rad) {
      var ang = (-90 + i * 360 / N) * Math.PI / 180;
      return [cx + rad * Math.cos(ang), cy + rad * Math.sin(ang)];
    }
    function poly(rad, cls, extra) {
      var pts = [];
      for (var i = 0; i < N; i++) { var p = pt(i, rad(i)); pts.push(p[0].toFixed(1) + "," + p[1].toFixed(1)); }
      return '<polygon class="' + cls + '" points="' + pts.join(" ") + '"' + (extra || "") + "/>";
    }
    var rings = [1, 2, 3].map(function (rv) { return poly(function () { return (rv / 3) * R; }, "ring"); }).join("");
    var axes = "", labels = "", dots = "";
    for (var i = 0; i < N; i++) {
      var e = pt(i, R);
      axes += '<line class="axis" x1="' + cx + '" y1="' + cy + '" x2="' + e[0].toFixed(1) + '" y2="' + e[1].toFixed(1) + '"/>';
      var lp = pt(i, R + 20);
      var anchor = Math.abs(lp[0] - cx) < 12 ? "middle" : (lp[0] > cx ? "start" : "end");
      labels += '<text class="r-label" x="' + lp[0].toFixed(1) + '" y="' + (lp[1] + 4).toFixed(1) +
        '" text-anchor="' + anchor + '">' + esc(shortPhase(rows[i].phase)) + "</text>";
      var v = rows[i].avg == null ? 0 : rows[i].avg;
      var dp = pt(i, (v / 3) * R);
      dots += '<circle class="r-dot" cx="' + dp[0].toFixed(1) + '" cy="' + dp[1].toFixed(1) + '" r="2.6"/>';
    }
    var data = poly(function (i) { var v = rows[i].avg == null ? 0 : rows[i].avg; return (v / 3) * R; }, "r-data");
    return '<svg viewBox="0 0 400 330" class="radar" role="img" aria-label="Maturity by phase">' +
      rings + axes + data + dots + labels + "</svg>";
  }

  /* ---------- screenshot evidence (IndexedDB for image data, metadata in state) ---------- */
  var DB_NAME = "dsovs-figures", STORE = "img";
  function idb() {
    return new Promise(function (res, rej) {
      if (!("indexedDB" in window)) { rej(new Error("no indexedDB")); return; }
      var r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = function () { r.result.createObjectStore(STORE); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
  }
  function idbPut(id, val) {
    return idb().then(function (db) { return new Promise(function (res, rej) {
      var t = db.transaction(STORE, "readwrite"); t.objectStore(STORE).put(val, id);
      t.oncomplete = function () { res(); }; t.onerror = function () { rej(t.error); };
    }); });
  }
  function idbGet(id) {
    return idb().then(function (db) { return new Promise(function (res, rej) {
      var t = db.transaction(STORE, "readonly"); var rq = t.objectStore(STORE).get(id);
      rq.onsuccess = function () { res(rq.result || null); }; rq.onerror = function () { rej(rq.error); };
    }); }).catch(function () { return null; });
  }
  function idbDel(id) {
    return idb().then(function (db) { return new Promise(function (res) {
      var t = db.transaction(STORE, "readwrite"); t.objectStore(STORE).delete(id);
      t.oncomplete = function () { res(); };
    }); }).catch(function () {});
  }
  function idbClear() {
    return idb().then(function (db) { return new Promise(function (res) {
      var t = db.transaction(STORE, "readwrite"); t.objectStore(STORE).clear();
      t.oncomplete = function () { res(); };
    }); }).catch(function () {});
  }
  function figId() {
    try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return "f" + Date.now() + "-" + Math.floor(Math.random() * 1e6);
  }
  function readAndResize(file, maxSide) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onload = function () {
        var img = new Image();
        img.onload = function () {
          var scale = Math.min(1, maxSide / Math.max(img.width, img.height));
          var cw = Math.max(1, Math.round(img.width * scale));
          var ch = Math.max(1, Math.round(img.height * scale));
          var cv = document.createElement("canvas");
          cv.width = cw; cv.height = ch;
          cv.getContext("2d").drawImage(img, 0, 0, cw, ch);
          var keepPng = file.type === "image/png" && cw * ch < 600000;
          res(cv.toDataURL(keepPng ? "image/png" : "image/jpeg", 0.92));
        };
        img.onerror = rej; img.src = fr.result;
      };
      fr.onerror = rej; fr.readAsDataURL(file);
    });
  }
  function addFigures(id, files) {
    var imgs = (files || []).filter(function (f) { return /^image\//.test(f.type); });
    if (!imgs.length) return;
    var a = answer(id); a.figures = a.figures || [];
    Promise.all(imgs.map(function (f) {
      return readAndResize(f, 1600).then(function (durl) {
        var fid = figId();
        return idbPut(fid, durl).then(function () {
          a.figures.push({ id: fid, caption: "", name: f.name });
        });
      }).catch(function () {});
    })).then(function () { save(); renderFigures(id); });
  }
  function figuresBlock(c) {
    var figs = (answer(c.id).figures) || [];
    var list = figs.length ? figs.map(function (f) {
      return '<div class="fig">' +
        '<img class="fig-thumb" data-fig-id="' + esc(f.id) + '" alt="">' +
        '<div class="fig-meta">' +
          '<input class="fig-cap" type="text" data-act="figcap" data-id="' + c.id + '" data-fig="' + esc(f.id) +
            '" placeholder="Describe what this screenshot shows…" value="' + esc(f.caption || "") + '">' +
          '<button class="fig-del" data-act="figdel" data-id="' + c.id + '" data-fig="' + esc(f.id) + '">Remove</button>' +
        "</div></div>";
    }).join("") : '<p class="fig-empty">Drag screenshots here, or use Add screenshot.</p>';
    return (
      '<div class="fig-head"><span class="evidence-title">Evidence screenshots</span>' +
        '<label class="btn-mini">Add screenshot<input type="file" accept="image/*" multiple data-act="figfile" data-id="' + c.id + '" hidden></label>' +
      "</div>" +
      '<div class="fig-list">' + list + "</div>"
    );
  }
  function loadFigureImages(root) {
    if (!root) return;
    root.querySelectorAll("img.fig-thumb[data-fig-id]").forEach(function (img) {
      if (img.getAttribute("data-loaded")) return;
      img.setAttribute("data-loaded", "1");
      idbGet(img.getAttribute("data-fig-id")).then(function (d) { if (d) img.src = d; });
    });
  }
  function renderFigures(id) {
    var c = DATA.controls.find(function (x) { return x.id === id; });
    var host = document.querySelector('[data-figs="' + id + '"]');
    if (c && host) { host.innerHTML = figuresBlock(c); loadFigureImages(host); }
  }

  /* ---------- setup fields ---------- */
  var els = {
    org: document.getElementById("org"),
    assessor: document.getElementById("assessor"),
    date: document.getElementById("date"),
    target: document.getElementById("target"),
  };
  els.org.value = state.meta.org || "";
  els.assessor.value = state.meta.assessor || "";
  els.date.value = state.meta.date || today();
  els.target.value = String(state.meta.target || 2);

  els.org.addEventListener("input", function () { state.meta.org = els.org.value; save(); });
  els.assessor.addEventListener("input", function () { state.meta.assessor = els.assessor.value; save(); });
  els.date.addEventListener("input", function () { state.meta.date = els.date.value; save(); });
  els.target.addEventListener("change", function () { state.meta.target = +els.target.value; save(); updateProgress(); });

  /* ---------- render controls grouped by phase ---------- */
  function byPhase() {
    var groups = {};
    DATA.phases.forEach(function (p) { groups[p] = []; });
    DATA.controls.forEach(function (c) { (groups[c.phase] = groups[c.phase] || []).push(c); });
    return groups;
  }

  function phaseId(p) { return "phase-" + p.toLowerCase().replace(/[^a-z0-9]+/g, "-"); }

  function renderNav() {
    var groups = byPhase();
    var items = DATA.phases.map(function (p) { return { p: p, id: phaseId(p), n: groups[p].length }; });
    document.getElementById("phase-nav").innerHTML = items.map(function (it) {
      return '<a href="#' + it.id + '" data-target="' + it.id + '">' + esc(it.p) + '<span class="n">' + it.n + "</span></a>";
    }).join("");
    var rail = document.getElementById("rail");
    if (rail) {
      rail.innerHTML = '<div class="rail-title">Phases</div><ol>' + items.map(function (it) {
        return '<li><a href="#' + it.id + '" data-target="' + it.id + '">' +
          '<span class="rl">' + esc(it.p) + '</span><span class="c">' + it.n + "</span></a></li>";
      }).join("") + "</ol>";
    }
  }

  function setActive(id) {
    document.querySelectorAll("[data-target]").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-target") === id);
    });
  }
  function setupSpy() {
    var sections = Array.prototype.slice.call(document.querySelectorAll(".phase"));
    if (!sections.length || !("IntersectionObserver" in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
    }, { rootMargin: "-140px 0px -65% 0px", threshold: 0 });
    sections.forEach(function (s) { obs.observe(s); });
  }

  function levelSeg(c) {
    var a = answer(c.id);
    var opts = '<button data-act="level" data-id="' + c.id + '" data-level="null" aria-pressed="' +
      (a.level == null) + '"><span class="lvl">&ndash;</span><span class="lbl">Not set</span></button>';
    for (var i = 0; i <= 3; i++) {
      opts += '<button data-act="level" data-id="' + c.id + '" data-level="' + i + '" aria-pressed="' +
        (a.level === i) + '"><span class="lvl">' + i + '</span><span class="lbl">' + LEVEL_LABELS[i] + "</span></button>";
    }
    return '<div class="level-seg">' + opts + "</div>";
  }

  function levelDetail(c) {
    var a = answer(c.id);
    if (a.level == null) return "";
    var lvl = c.levels[a.level];
    if (!lvl) return "";
    var ev = (lvl.evidence || []).map(function (item, idx) {
      var key = a.level + ":" + idx;
      var on = a.evidence && a.evidence[key];
      return '<li><input type="checkbox" data-act="ev" data-id="' + c.id + '" data-key="' + key + '"' +
        (on ? " checked" : "") + ' /><span>' + esc(item) + "</span></li>";
    }).join("");
    var evBlock = ev
      ? '<p class="evidence-title">Verification evidence</p><ul class="evidence-list">' + ev + "</ul>"
      : "";
    return (
      '<div class="level-detail">' +
        '<p class="lt">Level ' + a.level + " - " + esc(lvl.title) + "</p>" +
        '<p class="ld">' + esc(lvl.description) + "</p>" +
        evBlock +
        '<div class="notes"><label>Notes</label>' +
        '<textarea data-act="notes" data-id="' + c.id + '" placeholder="Context, caveats, links to evidence&hellip;">' +
        esc(a.notes || "") + "</textarea></div>" +
      "</div>"
    );
  }

  function controlCard(c) {
    return (
      '<div class="control card" id="ctl-' + c.id + '">' +
        '<div class="control-top">' +
          "<div>" +
            '<div class="control-id">' + esc(c.code) + "</div>" +
            "<h3>" + esc(c.title) + "</h3>" +
          "</div>" +
          '<span class="badge">' + esc(c.type) + "</span>" +
        "</div>" +
        '<p class="control-summary">' + esc(firstPara(c.summary)) + "</p>" +
        '<details class="disclose"><summary></summary><div class="body">' +
          restParas(c.summary) +
          '<a class="doc-link" href="control.html?code=' + encodeURIComponent(c.code) + '" target="_blank" rel="noopener">Read the full control &rarr;</a>' +
        "</div></details>" +
        '<div class="levels" data-levels="' + c.id + '">' +
          levelSeg(c) +
          levelDetail(c) +
        "</div>" +
        '<div class="figures" data-figs="' + c.id + '">' + figuresBlock(c) + "</div>" +
      "</div>"
    );
  }

  function firstPara(text) {
    return String(text || "").split(/\n\s*\n/)[0].trim();
  }

  function renderControls() {
    var groups = byPhase();
    var html = DATA.phases.map(function (p) {
      var list = groups[p];
      if (!list.length) return "";
      return (
        '<section class="phase" id="' + phaseId(p) + '">' +
          '<div class="phase-head"><h2>' + esc(p) + '</h2><span class="count">' +
          list.length + " controls</span></div>" +
          list.map(controlCard).join("") +
        "</section>"
      );
    }).join("");
    document.getElementById("controls").innerHTML = html;
  }

  /* re-render only the levels block for one control (keeps focus elsewhere stable) */
  function refreshLevels(id) {
    var c = DATA.controls.find(function (x) { return x.id === id; });
    var host = document.querySelector('[data-levels="' + id + '"]');
    if (c && host) host.innerHTML = levelSeg(c) + levelDetail(c);
  }

  /* ---------- events (delegated) ---------- */
  var controlsEl = document.getElementById("controls");
  controlsEl.addEventListener("click", function (e) {
    var btn = e.target.closest('[data-act="level"]');
    if (btn) {
      var id = btn.getAttribute("data-id");
      var lv = btn.getAttribute("data-level");
      answer(id).level = lv === "null" ? null : +lv;
      save();
      refreshLevels(id);
      updateProgress();
      return;
    }
    var fd = e.target.closest('[data-act="figdel"]');
    if (fd) {
      var cid = fd.getAttribute("data-id"), fid = fd.getAttribute("data-fig");
      var a = answer(cid);
      a.figures = (a.figures || []).filter(function (x) { return x.id !== fid; });
      idbDel(fid); save(); renderFigures(cid);
    }
  });
  controlsEl.addEventListener("change", function (e) {
    var ev = e.target.closest('[data-act="ev"]');
    if (ev) {
      var a = answer(ev.getAttribute("data-id"));
      a.evidence = a.evidence || {};
      a.evidence[ev.getAttribute("data-key")] = ev.checked;
      save();
      return;
    }
    var ff = e.target.closest('[data-act="figfile"]');
    if (ff) {
      addFigures(ff.getAttribute("data-id"), Array.prototype.slice.call(ff.files || []));
      ff.value = "";
    }
  });
  controlsEl.addEventListener("input", function (e) {
    var nt = e.target.closest('[data-act="notes"]');
    if (nt) { answer(nt.getAttribute("data-id")).notes = nt.value; save(); return; }
    var fc = e.target.closest('[data-act="figcap"]');
    if (fc) {
      var fid = fc.getAttribute("data-fig");
      (answer(fc.getAttribute("data-id")).figures || []).forEach(function (x) { if (x.id === fid) x.caption = fc.value; });
      save();
    }
  });
  controlsEl.addEventListener("dragover", function (e) {
    if (e.target.closest(".figures")) { e.preventDefault(); }
  });
  controlsEl.addEventListener("drop", function (e) {
    var fz = e.target.closest(".figures");
    if (fz) {
      e.preventDefault();
      addFigures(fz.getAttribute("data-figs"), Array.prototype.slice.call(e.dataTransfer.files || []));
    }
  });

  /* ---------- progress ---------- */
  function assessedCount() {
    return DATA.controls.filter(function (c) {
      var a = state.answers[c.id];
      return a && a.level != null;
    }).length;
  }
  function updateProgress() {
    var total = DATA.controls.length;
    var done = assessedCount();
    var pct = total ? Math.round((done / total) * 100) : 0;
    document.getElementById("progress-count").textContent = done + " of " + total + " assessed";
    document.getElementById("progress-pct").textContent = pct + "%";
    document.getElementById("progress-fill").style.width = pct + "%";
  }

  /* ---------- report ---------- */
  function buildReport() {
    var target = state.meta.target || 2;
    var controls = DATA.controls;
    var assessed = controls.filter(function (c) { var a = state.answers[c.id]; return a && a.level != null; });
    var avg = assessed.length
      ? (assessed.reduce(function (s, c) { return s + state.answers[c.id].level; }, 0) / assessed.length)
      : 0;
    var meetingTarget = controls.filter(function (c) {
      var a = state.answers[c.id]; return a && a.level != null && a.level >= target;
    }).length;

    /* per-phase averages */
    var groups = byPhase();
    var phaseRows = DATA.phases.map(function (p) {
      var list = groups[p].filter(function (c) { var a = state.answers[c.id]; return a && a.level != null; });
      var pa = list.length ? list.reduce(function (s, c) { return s + state.answers[c.id].level; }, 0) / list.length : null;
      return { phase: p, avg: pa, assessed: list.length, total: groups[p].length };
    });

    /* gaps: assessed controls below target, plus their roadmap step */
    var gaps = assessed.filter(function (c) { return state.answers[c.id].level < target; })
      .sort(function (a, b) {
        return state.answers[a.id].level - state.answers[b.id].level ||
          DATA.phases.indexOf(a.phase) - DATA.phases.indexOf(b.phase);
      });

    var strengths = assessed.filter(function (c) { return state.answers[c.id].level >= 3; }).length;
    var notAssessed = controls.length - assessed.length;

    /* number screenshot evidence in control order: Figure 1..N */
    var figNum = 0, figuresOrder = [], figByControl = {};
    controls.forEach(function (c) {
      var a = state.answers[c.id];
      if (!a || !a.figures || !a.figures.length) return;
      a.figures.forEach(function (f) {
        figNum++;
        figuresOrder.push({ num: figNum, controlId: c.id, code: c.code, title: c.title, docUrl: c.doc_url, figId: f.id, caption: f.caption || "" });
        (figByControl[c.id] = figByControl[c.id] || []).push(figNum);
      });
    });

    /* prose executive summary */
    var ranked = phaseRows.filter(function (r) { return r.avg != null; }).slice()
      .sort(function (a, b) { return b.avg - a.avg; });
    var best = ranked[0], worst = ranked[ranked.length - 1];
    var introBody;
    if (!assessed.length) {
      introBody = "<p>" + (state.meta.org ? esc(state.meta.org) : "This project") +
        " has not been assessed yet. Choose a maturity level for each control to build a maturity profile, a prioritised roadmap and an evidence pack you can export or print.</p>";
    } else {
      var who = state.meta.org ? esc(state.meta.org) : "This project";
      var when = state.meta.date ? " on " + esc(state.meta.date) : "";
      var lowGaps = gaps.filter(function (c) { return state.answers[c.id].level <= 1; }).length;

      var p1 = who + " was assessed against the OWASP DevSecOps Verification Standard" + when + ". " +
        assessed.length + " of " + controls.length + " controls were rated, giving an overall maturity of " +
        avg.toFixed(1) + " out of 3 - " + (/^[ae]/.test(maturityWord(avg)) ? "an " : "a ") +
        maturityWord(avg) + " posture - against a target of Level " + target + ".";

      var p2 = meetingTarget + " control" + (meetingTarget === 1 ? "" : "s") + " already meet" +
        (meetingTarget === 1 ? "s" : "") + " the target and " + gaps.length + " fall" + (gaps.length === 1 ? "s" : "") + " short.";
      if (best && worst && best !== worst) {
        p2 += " Maturity is strongest in " + esc(best.phase) + " (" + best.avg.toFixed(1) + ") and weakest in " +
          esc(worst.phase) + " (" + worst.avg.toFixed(1) + "), so " + esc(worst.phase) +
          " is where further investment will reduce risk most.";
      } else if (best) {
        p2 += " Assessed work so far centres on " + esc(best.phase) + " (" + best.avg.toFixed(1) + ").";
      }

      var p3;
      if (gaps.length) {
        p3 = "The roadmap below lists each gap in priority order" +
          (lowGaps ? ", starting with the " + lowGaps + " control" + (lowGaps > 1 ? "s" : "") +
            " sitting at Level 0 or 1 that carry the most risk and offer the fastest improvement" : "") +
          ". For each one it states the specific next step and the evidence required to verify it.";
      } else {
        p3 = "Every assessed control meets the target, so the priority now is to sustain these practices and keep the supporting evidence current.";
      }

      var p4 = figNum ? "<p>" + figNum + " screenshot" + (figNum > 1 ? "s are" : " is") +
        " attached as supporting evidence (Figure" + (figNum > 1 ? "s 1-" + figNum : " 1") + ").</p>" : "";
      introBody = "<p>" + p1 + "</p><p>" + p2 + "</p><p>" + p3 + "</p>" + p4;
    }
    var introHtml = '<div class="report-intro">' + introBody + "</div>";

    var meta = state.meta;
    var reportId = currentReportId();
    var metaLine =
      (meta.org ? "<span>" + esc(meta.org) + "</span>" : "") +
      (meta.assessor ? "<span>" + esc(meta.assessor) + "</span>" : "") +
      (meta.date ? "<span>" + esc(meta.date) + "</span>" : "") +
      "<span>Target level " + target + "</span>" +
      '<span class="rid">Report ' + reportId + "</span>";

    var stats =
      '<div class="stat-grid">' +
        '<div class="stat card"><div class="num">' + assessed.length + "/" + controls.length +
          '</div><div class="lab">Controls assessed</div></div>' +
        '<div class="stat card"><div class="num">' + avg.toFixed(1) +
          '</div><div class="lab">Average maturity (0&ndash;3)</div></div>' +
        '<div class="stat card"><div class="num">' + meetingTarget + "/" + controls.length +
          '</div><div class="lab">Meeting target (L' + target + "+)</div></div>" +
      "</div>";

    var charts =
      '<div class="section-title">Overview</div>' +
      '<div class="charts card">' +
        '<div class="donut-wrap">' + donut(avg / 3, avg.toFixed(1), "of 3") +
          '<div class="donut-cap">Overall maturity</div></div>' +
        '<div class="radar-wrap">' + radarChart(phaseRows) + "</div>" +
      "</div>";

    var pipeline = pipelineFlow(phaseRows);

    var gapHtml;
    if (!assessed.length) {
      gapHtml = '<div class="card empty">No controls assessed yet. Rate some controls to see a roadmap here.</div>';
    } else if (!gaps.length) {
      gapHtml = '<div class="card empty">Every assessed control meets the target level of ' + target + ". Nice work.</div>";
    } else {
      gapHtml = gaps.map(function (c) {
        var a = state.answers[c.id];
        var next = c.levels[a.level + 1];
        var nextBlock = "";
        if (next) {
          var ev = (next.evidence || []).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
          nextBlock =
            '<div class="gap-next">' +
              '<p class="nl">To reach Level ' + (a.level + 1) + ": " + esc(next.title) + "</p>" +
              '<p class="nd">' + esc(next.description) + "</p>" +
              (ev ? "<ul>" + ev + "</ul>" : "") +
            "</div>";
        }
        var note = a.notes ? '<div class="gap-note"><b>Note:</b> ' + esc(a.notes) + "</div>" : "";
        var figs = figByControl[c.id];
        var figRef = figs ? '<div class="gap-figref">Evidence: ' +
          figs.map(function (n) { return "Figure " + n; }).join(", ") + "</div>" : "";
        var why = '<div class="gap-why">' + esc(firstSentence(c.summary)) + "</div>";
        return (
          '<div class="gap card">' +
            '<div class="gap-top"><div>' +
              '<a class="g-id" href="control.html?code=' + encodeURIComponent(c.code) + '" target="_blank" rel="noopener" title="Open ' +
                esc(c.code) + '">' + esc(c.code) + "</a>" +
              '<div class="g-title">' + esc(c.title) + "</div></div>" +
              '<div class="gap-move">Now <b>L' + a.level + "</b> &rarr; target <b>L" + target + "</b></div></div>" +
            why + nextBlock + note + figRef +
          "</div>"
        );
      }).join("");
    }

    var summaryNote =
      '<div class="section-title">Priority gaps &middot; ' + gaps.length + " below target" +
      (notAssessed ? " &middot; " + notAssessed + " not yet assessed" : "") +
      (strengths ? " &middot; " + strengths + " at Level 3" : "") +
      (figNum ? " &middot; " + figNum + " screenshot" + (figNum > 1 ? "s" : "") : "") + "</div>" +
      (gaps.length ? '<p class="section-lead">Ordered by lowest maturity first, so the largest risks appear at the top. Each entry is the next concrete step toward the target, with the evidence an assessor would expect to see.</p>' : "");

    document.getElementById("report").innerHTML =
      '<div class="report-head"><h1>DevSecOps Maturity Report</h1>' +
        '<div class="report-meta">' + metaLine + "</div></div>" +
      introHtml +
      stats + charts + pipeline + summaryNote + gapHtml +
      '<div id="evidence-slot"></div>' +
      '<div class="report-actions">' +
        '<button class="btn ghost" id="back">&larr; Back to assessment</button>' +
        '<button class="btn ghost" id="export">Export JSON</button>' +
        '<button class="btn primary" id="print">Print / Save PDF</button>' +
      "</div>";

    document.getElementById("back").addEventListener("click", function () { switchView("assess"); });
    document.getElementById("print").addEventListener("click", function () {
      var slug = (state.meta.org || "report").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "") || "report";
      var prev = document.title;
      document.title = "DSOVS-" + slug + "-" + (state.meta.date || today()) + "-" + reportId;
      function restore() { document.title = prev; window.removeEventListener("afterprint", restore); }
      window.addEventListener("afterprint", restore);
      window.print();
    });
    document.getElementById("export").addEventListener("click", exportJson);

    loadEvidence(figuresOrder);
  }

  function loadEvidence(items) {
    var slot = document.getElementById("evidence-slot");
    if (!slot) return;
    if (!items || !items.length) { slot.innerHTML = ""; return; }
    Promise.all(items.map(function (it) {
      return idbGet(it.figId).then(function (d) {
        return { num: it.num, controlId: it.controlId, code: it.code, title: it.title, docUrl: it.docUrl, caption: it.caption, data: d };
      });
    })).then(function (loaded) {
      var order = [], groups = {};
      loaded.forEach(function (it) {
        if (!groups[it.controlId]) { groups[it.controlId] = { code: it.code, title: it.title, docUrl: it.docUrl, items: [] }; order.push(it.controlId); }
        groups[it.controlId].items.push(it);
      });
      var html = '<div class="section-title">Evidence</div>';
      order.forEach(function (cid) {
        var g = groups[cid];
        html += '<div class="evidence-block card"><div class="ev-ctl">' +
          '<a class="g-id" href="control.html?code=' + encodeURIComponent(g.code) + '" target="_blank" rel="noopener" title="Open ' +
            esc(g.code) + '">' + esc(g.code) + "</a> - " + esc(g.title) + "</div>";
        g.items.forEach(function (it) {
          html += '<figure class="figure">' +
            (it.data ? '<img src="' + it.data + '" alt="Figure ' + it.num + '">' : '<div class="fig-missing">Image unavailable</div>') +
            '<figcaption><b>Figure ' + it.num + ".</b> " +
              (it.caption ? esc(it.caption) : '<span class="muted">No description provided</span>') +
            "</figcaption></figure>";
        });
        html += "</div>";
      });
      slot.innerHTML = html;
    });
  }

  function exportJson() {
    var id = currentReportId();
    var payload = {
      standard: DATA.standard,
      version: DATA.version,
      report_id: id,
      exported: new Date().toISOString(),
      meta: state.meta,
      results: DATA.controls.map(function (c) {
        var a = state.answers[c.id] || {};
        return {
          id: c.id, code: c.code, title: c.title, phase: c.phase,
          level: a.level == null ? null : a.level, notes: a.notes || "",
          screenshots: (a.figures || []).map(function (f) { return f.caption || f.name || "screenshot"; }),
        };
      }),
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var orgslug = (state.meta.org || "report").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "report";
    var name = "dsovs-assessment-" + orgslug + "-" + (state.meta.date || today()) + "-" + id + ".json";
    var a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  /* ---------- view switching ---------- */
  function switchView(view) {
    var assess = document.getElementById("view-assess");
    var report = document.getElementById("view-report");
    var isReport = view === "report";
    assess.hidden = isReport;
    report.hidden = !isReport;
    document.querySelectorAll(".view-switch .seg").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-view") === view));
    });
    if (isReport) buildReport();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  document.querySelectorAll(".view-switch .seg").forEach(function (b) {
    b.addEventListener("click", function () { switchView(b.getAttribute("data-view")); });
  });
  document.getElementById("goto-report").addEventListener("click", function () { switchView("report"); });

  function resetAll() {
    if (!confirm("Clear every answer, note and screenshot stored in this browser? This cannot be undone.")) return;
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    idbClear();
    state = load();
    els.org.value = ""; els.assessor.value = ""; els.date.value = state.meta.date; els.target.value = "2";
    switchView("assess");
    renderControls(); loadFigureImages(controlsEl); updateProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  document.getElementById("reset").addEventListener("click", resetAll);
  var topresetBtn = document.getElementById("topreset");
  if (topresetBtn) topresetBtn.addEventListener("click", resetAll);

  /* ---------- init ---------- */
  renderNav();
  renderControls();
  loadFigureImages(controlsEl);
  setupSpy();
  updateProgress();
})();
