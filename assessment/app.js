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
    document.getElementById("phase-nav").innerHTML = DATA.phases.map(function (p) {
      return '<a href="#' + phaseId(p) + '">' + esc(p) + '<span class="n">' + groups[p].length + "</span></a>";
    }).join("");
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
        '<p class="lt">Level ' + a.level + " &mdash; " + esc(lvl.title) + "</p>" +
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
          paras(c.summary) +
          '<a class="doc-link" href="' + esc(c.doc_url) + '" target="_blank" rel="noopener">Read the full control &rarr;</a>' +
        "</div></details>" +
        '<div class="levels" data-levels="' + c.id + '">' +
          levelSeg(c) +
          levelDetail(c) +
        "</div>" +
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
  document.getElementById("controls").addEventListener("click", function (e) {
    var btn = e.target.closest('[data-act="level"]');
    if (btn) {
      var id = btn.getAttribute("data-id");
      var lv = btn.getAttribute("data-level");
      answer(id).level = lv === "null" ? null : +lv;
      save();
      refreshLevels(id);
      updateProgress();
    }
  });
  document.getElementById("controls").addEventListener("change", function (e) {
    var ev = e.target.closest('[data-act="ev"]');
    if (ev) {
      var a = answer(ev.getAttribute("data-id"));
      a.evidence = a.evidence || {};
      a.evidence[ev.getAttribute("data-key")] = ev.checked;
      save();
    }
  });
  document.getElementById("controls").addEventListener("input", function (e) {
    var nt = e.target.closest('[data-act="notes"]');
    if (nt) { answer(nt.getAttribute("data-id")).notes = nt.value; save(); }
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

    var meta = state.meta;
    var metaLine =
      (meta.org ? "<span>" + esc(meta.org) + "</span>" : "") +
      (meta.assessor ? "<span>" + esc(meta.assessor) + "</span>" : "") +
      (meta.date ? "<span>" + esc(meta.date) + "</span>" : "") +
      "<span>Target level " + target + "</span>";

    var stats =
      '<div class="stat-grid">' +
        '<div class="stat card"><div class="num">' + assessed.length + "/" + controls.length +
          '</div><div class="lab">Controls assessed</div></div>' +
        '<div class="stat card"><div class="num">' + avg.toFixed(1) +
          '</div><div class="lab">Average maturity (0&ndash;3)</div></div>' +
        '<div class="stat card"><div class="num">' + meetingTarget + "/" + controls.length +
          '</div><div class="lab">Meeting target (L' + target + "+)</div></div>" +
      "</div>";

    var bars =
      '<div class="section-title">Maturity by phase</div>' +
      '<div class="bars card">' +
      phaseRows.map(function (r) {
        var w = r.avg == null ? 0 : (r.avg / 3) * 100;
        var num = r.avg == null ? "&ndash;" : r.avg.toFixed(1);
        return '<div class="bar-row"><div class="name">' + esc(r.phase) +
          '</div><div class="bar-track"><div class="bar-val" style="width:' + w + '%"></div></div>' +
          '<div class="bar-num">' + num + "</div></div>";
      }).join("") +
      "</div>";

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
        return (
          '<div class="gap card">' +
            '<div class="gap-top"><div><div class="g-id">' + esc(c.code) + "</div>" +
              '<div class="g-title">' + esc(c.title) + "</div></div>" +
              '<div class="gap-move">Now <b>L' + a.level + "</b> &rarr; target <b>L" + target + "</b></div></div>" +
            nextBlock + note +
          "</div>"
        );
      }).join("");
    }

    var summaryNote =
      '<div class="section-title">Priority gaps &middot; ' + gaps.length + " below target" +
      (notAssessed ? " &middot; " + notAssessed + " not yet assessed" : "") +
      (strengths ? " &middot; " + strengths + " at Level 3" : "") + "</div>";

    document.getElementById("report").innerHTML =
      '<div class="report-head"><h1>DevSecOps Maturity Report</h1>' +
        '<div class="report-meta">' + metaLine + "</div></div>" +
      stats + bars + summaryNote + gapHtml +
      '<div class="report-actions">' +
        '<button class="btn ghost" id="back">&larr; Back to assessment</button>' +
        '<button class="btn ghost" id="export">Export JSON</button>' +
        '<button class="btn primary" id="print">Print / Save PDF</button>' +
      "</div>";

    document.getElementById("back").addEventListener("click", function () { switchView("assess"); });
    document.getElementById("print").addEventListener("click", function () { window.print(); });
    document.getElementById("export").addEventListener("click", exportJson);
  }

  function exportJson() {
    var payload = {
      standard: DATA.standard,
      version: DATA.version,
      exported: new Date().toISOString(),
      meta: state.meta,
      results: DATA.controls.map(function (c) {
        var a = state.answers[c.id] || {};
        return { id: c.id, code: c.code, title: c.title, phase: c.phase, level: a.level == null ? null : a.level, notes: a.notes || "" };
      }),
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var name = "dsovs-assessment-" + (state.meta.org || "report").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".json";
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

  document.getElementById("reset").addEventListener("click", function () {
    if (!confirm("Clear every answer and start over? This cannot be undone.")) return;
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    state = load();
    els.org.value = ""; els.assessor.value = ""; els.date.value = state.meta.date; els.target.value = "2";
    renderControls(); updateProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- init ---------- */
  renderNav();
  renderControls();
  updateProgress();
})();
