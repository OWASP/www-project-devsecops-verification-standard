/* Landing page: render the table of contents from the shared DSOVS data. */
(function () {
  "use strict";
  var DATA = window.DSOVS_DATA;
  if (!DATA || !Array.isArray(DATA.controls)) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  var groups = {};
  DATA.phases.forEach(function (p) { groups[p] = []; });
  DATA.controls.forEach(function (c) { (groups[c.phase] = groups[c.phase] || []).push(c); });

  var toc = document.getElementById("toc");
  if (toc) {
    toc.innerHTML = DATA.phases.map(function (p) {
      var list = groups[p];
      if (!list.length) return "";
      var chips = list.map(function (c) {
        return '<a class="tchip" href="control.html?code=' + encodeURIComponent(c.code) + '">' +
          '<span class="cc">' + esc(c.code) + '</span><span>' + esc(c.title) + "</span></a>";
      }).join("");
      return '<div class="tphase card"><div class="tphase-head"><h3>' + esc(p) +
        '</h3><span class="c">' + list.length + " controls</span></div>" +
        '<div class="tchips">' + chips + "</div></div>";
    }).join("");
  }

  var stat = document.getElementById("hero-stat");
  if (stat) {
    stat.textContent = DATA.phases.length + " phases · " + DATA.controls.length + " controls · 4 maturity levels";
  }
})();
