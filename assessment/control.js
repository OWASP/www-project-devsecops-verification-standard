/* Renders a single DSOVS control in the site design, from the shared data (no drift). */
(function () {
  "use strict";
  var DATA = window.DSOVS_DATA;
  var root = document.getElementById("control");

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function paras(text) {
    return String(text || "").split(/\n\s*\n/).map(function (p) {
      return "<p>" + esc(p.trim()) + "</p>";
    }).join("");
  }
  function param(name) {
    var m = new RegExp("[?&]" + name + "=([^&]+)").exec(location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  var LEVEL_LABELS = ["Initial", "Basic", "Managed", "Optimised"];
  var PLATFORM = {
    "github-actions": "GitHub Actions", "gitlab-ci": "GitLab CI",
    "azure-devops": "Azure DevOps", "cli": "Command line", "config": "Configuration",
  };
  var MAP_LABELS = {
    owasp_samm: "OWASP SAMM", owasp_asvs: "OWASP ASVS",
    nist_ssdf: "NIST SSDF", iso_27001: "ISO 27001", other: "Other",
  };

  if (!DATA || !Array.isArray(DATA.controls)) {
    root.innerHTML = '<p class="notfound">Could not load the standard data.</p>';
    return;
  }

  var code = (param("code") || param("id") || "").toUpperCase().replace(/^DSOVS-/, "");
  var control = DATA.controls.filter(function (c) { return c.code === code; })[0];
  if (!control) {
    root.innerHTML = '<p class="notfound">Control <code>' + esc(code || "?") +
      '</code> was not found. <a href="index.html#standard">Back to the standard</a>.</p>';
    return;
  }

  document.title = control.code + " " + control.title + " - DSOVS";

  var html = "";

  /* header */
  html += '<header class="dhead">' +
    '<div class="deyebrow"><span class="dphase">' + esc(control.phase) + "</span>" +
      '<span class="dcode">' + esc(control.code) + "</span>" +
      '<span class="dbadge">' + esc(control.type) + "</span></div>" +
    "<h1>" + esc(control.title) + "</h1>" +
    '<div class="dsummary">' + paras(control.summary) + "</div>" +
  "</header>";

  /* levels */
  html += '<section class="dsection"><h2>Maturity levels</h2><div class="levels-doc">';
  control.levels.forEach(function (lvl) {
    html += '<div class="ldoc">' +
      '<div class="ldoc-head"><span class="ldoc-n">' + lvl.level + "</span>" +
        '<div><div class="ldoc-tag">Level ' + lvl.level + " &middot; " + esc(LEVEL_LABELS[lvl.level] || "") + "</div>" +
        "<h3>" + esc(lvl.title) + "</h3></div></div>" +
      '<div class="ldoc-body">' + paras(lvl.description);
    if (lvl.diagram) {
      html += '<pre class="mermaid">' + esc(lvl.diagram) + "</pre>";
    }
    if (lvl.evidence && lvl.evidence.length) {
      html += '<div class="evidence"><div class="evidence-h">Verification evidence</div><ul>' +
        lvl.evidence.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ul></div>";
    }
    html += "</div></div>";
  });
  html += "</div></section>";

  /* notable tools */
  if (control.tools && control.tools.length) {
    html += '<section class="dsection"><h2>Notable tools</h2>' +
      '<p class="disclaimer">Apart from official OWASP Projects, these tools were chosen on the basis of their proven capabilities alone. There is no other relationship between the DSOVS project leaders and their creators or vendors.</p>';
    control.tools.forEach(function (t) {
      html += '<div class="tool card"><div class="tool-head"><h3>' +
        '<a href="' + esc(t.url) + '" target="_blank" rel="noopener">' + esc(t.name) + "</a></h3></div>" +
        '<div class="tool-desc">' + paras(t.description) + "</div>";
      (t.integrations || []).forEach(function (ig) {
        var label = ig.label || PLATFORM[ig.platform] || ig.platform;
        var head = ig.link
          ? '<a href="' + esc(ig.link) + '" target="_blank" rel="noopener">' + esc(label) + "</a>"
          : esc(label);
        html += '<div class="snippet"><div class="snippet-h">' + head + "</div>" +
          "<pre><code>" + esc(ig.code) + "</code></pre></div>";
      });
      html += "</div>";
    });
    html += "</section>";
  }

  /* mappings */
  if (control.mappings) {
    var rows = Object.keys(control.mappings).filter(function (k) {
      return control.mappings[k] && control.mappings[k].length;
    });
    if (rows.length) {
      html += '<section class="dsection"><h2>Framework mappings</h2><div class="maps">';
      rows.forEach(function (k) {
        html += '<div class="map-row"><div class="map-k">' + esc(MAP_LABELS[k] || k) + "</div>" +
          '<div class="map-v">' + control.mappings[k].map(function (v) {
            return '<span class="chip">' + esc(v) + "</span>";
          }).join("") + "</div></div>";
      });
      html += "</div></section>";
    }
  }

  /* further reading */
  if (control.further_reading && control.further_reading.length) {
    html += '<section class="dsection"><h2>Further reading</h2><ul class="reading">' +
      control.further_reading.map(function (r) {
        return '<li><a href="' + esc(r.url) + '" target="_blank" rel="noopener">' +
          esc(r.note || r.url) + "</a></li>";
      }).join("") + "</ul></section>";
  }

  /* credits */
  if (control.credits && control.credits.length) {
    html += '<section class="dsection"><h2>Credits</h2><ul class="reading">' +
      control.credits.map(function (c) {
        return "<li>" + (c.url ? '<a href="' + esc(c.url) + '" target="_blank" rel="noopener">' + esc(c.name) + "</a>" : esc(c.name)) + "</li>";
      }).join("") + "</ul></section>";
  }

  /* provenance + CTA */
  html += '<div class="dfoot">' +
    '<a class="btn primary" href="assess.html">Assess this in the self-assessment &rarr;</a>' +
    '<a class="dsource" href="' + esc(control.doc_url) + '" target="_blank" rel="noopener">View source on GitHub</a>' +
  "</div>";

  root.innerHTML = html;

  /* render mermaid diagrams if the library loaded */
  if (window.mermaid) {
    try {
      window.mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "strict" });
      window.mermaid.run({ nodes: root.querySelectorAll("pre.mermaid") });
    } catch (e) {}
  }

  /* prev / next nav within the standard */
  var idx = DATA.controls.indexOf(control);
  var prev = DATA.controls[idx - 1], next = DATA.controls[idx + 1];
  var nav = document.createElement("nav");
  nav.className = "dpager";
  nav.innerHTML =
    (prev ? '<a href="control.html?code=' + prev.code + '"><span>Previous</span>' + esc(prev.code) + " " + esc(prev.title) + "</a>" : "<span></span>") +
    (next ? '<a class="next" href="control.html?code=' + next.code + '"><span>Next</span>' + esc(next.code) + " " + esc(next.title) + "</a>" : "<span></span>");
  root.appendChild(nav);
})();
