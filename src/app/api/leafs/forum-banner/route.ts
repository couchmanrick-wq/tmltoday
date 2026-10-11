export const runtime = "nodejs";

const SCRIPT = `(function () {
  var SITE = "https://tmltoday.com";
  var ODDS = "https://www.covers.com/sport/hockey/nhl/teams/main/toronto-maple-leafs";
  var host = document.querySelector(".p-body-inner") || document.querySelector(".p-body");
  if (!host) return;

  var hide = document.createElement("style");
  hide.textContent = ".p-breadcrumbs{display:none!important}" +
    ".p-sectionLinks-list{display:flex!important;align-items:center!important}" +
    ".p-sectionLinks-list>li{display:flex!important;align-items:center!important;align-self:center!important;margin:0!important;padding:0!important}" +
    ".p-sectionLinks-list .p-navEl{display:flex!important;align-items:center!important;margin:0!important;padding:0!important}" +
    ".p-sectionLinks-list .p-navEl-link,.p-sectionLinks-list .p-navEl-splitTrigger{display:flex!important;align-items:center!important;line-height:1.4!important;margin-top:0!important;margin-bottom:0!important;padding-top:12px!important;padding-bottom:12px!important;position:static!important;top:auto!important;transform:none!important;vertical-align:middle!important}";
  document.head.appendChild(hide);

  var navLinks = document.querySelectorAll(".p-sectionLinks-list .p-navEl-link");
  if (navLinks.length) {
    var ref = navLinks[0];
    for (var k = 1; k < navLinks.length; k++) {
      if (parseFloat(getComputedStyle(navLinks[k]).fontSize) > parseFloat(getComputedStyle(ref).fontSize)) ref = navLinks[k];
    }
    var rs = getComputedStyle(ref);
    for (var m = 0; m < navLinks.length; m++) {
      var st = navLinks[m].style;
      st.setProperty("font-size", rs.fontSize, "important");
      st.setProperty("font-weight", rs.fontWeight, "important");
      st.setProperty("font-family", rs.fontFamily, "important");
      st.setProperty("letter-spacing", rs.letterSpacing, "important");
      st.setProperty("text-transform", rs.textTransform, "important");
    }
  }

  var boxes = [];
  function makeBox(parent, before) {
    var b = document.createElement("div");
    b.style.cssText = "background:#fff;border:1px solid #d5dbe8;border-top:4px solid #00205b;border-radius:8px;box-shadow:0 2px 8px rgba(0,32,91,.12);margin:0 auto 12px;padding:8px 16px;font:600 15px/1.6 Roboto,Arial,sans-serif;color:#00205b;display:none;text-align:center";
    parent.insertBefore(b, before);
    boxes.push(b);
  }
  makeBox(host, host.firstChild);
  var quick = document.querySelector(".js-quickReply") || document.querySelector("#quickReply");
  if (quick && quick.parentNode) makeBox(quick.parentNode, quick);

  var dateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", month: "short", day: "numeric" });
  var timeFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", hour: "numeric", minute: "2-digit", timeZoneName: "short" });

  function el(tag, css, text) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text != null) e.textContent = text;
    return e;
  }
  function label(t) { return el("span", "color:#d6001c;font-weight:800;text-transform:uppercase;margin-right:6px", t); }
  function muted(t) { return el("span", "color:#64748b;font-weight:700;margin:0 8px", t); }
  function link(t, href) {
    var a = el("a", "color:#3b5bdb;font-weight:700;margin-left:10px;text-decoration:none", t);
    a.href = href; a.target = "_blank"; a.rel = "noopener noreferrer";
    return a;
  }
  function row() { return el("div", "display:flex;flex-wrap:wrap;align-items:baseline;justify-content:center;padding:3px 0"); }

  function status(g, live) {
    if (g.isLive) {
      var p = g.periodType === "SO" ? "SO" : (g.periodType === "OT" || g.periodNumber > 3) ? "OT" : ["", "1st", "2nd", "3rd"][g.periodNumber] || "";
      return g.inIntermission ? "Intermission " + p : p + " " + (g.timeRemaining || "");
    }
    return g.resultType && g.resultType !== "REG" ? "Final/" + g.resultType : "Final";
  }

  function render(data, live) {
    var box = boxes[0];
    box.textContent = "";
    var last = data.lastGame, next = data.nextGame;
    if (last) {
      var r = row();
      r.appendChild(label("Latest:"));
      r.appendChild(el("span", "margin-right:8px", dateFmt.format(new Date(last.startsAt))));
      r.appendChild(el("span", "", last.away.abbrev + " " + (last.away.score || 0) + " - " + last.home.abbrev + " " + (last.home.score || 0)));
      r.appendChild(muted(status(last).trim()));
      if (live && live.gameId === last.id && live.away.shots != null && live.home.shots != null) {
        r.appendChild(muted("SOG " + live.away.code + " " + live.away.shots + "-" + live.home.shots + " " + live.home.code));
      }
      r.appendChild(link("Box Score", last.boxScoreUrl));
      if (last.condensedGameUrl) r.appendChild(link("Game Vids", last.condensedGameUrl));
      box.appendChild(r);
    }
    if (next) {
      var n = row(), d = new Date(next.startsAt);
      n.appendChild(label("Next:"));
      n.appendChild(el("span", "margin-right:8px", dateFmt.format(d)));
      n.appendChild(el("span", "", next.away.abbrev + " @ " + next.home.abbrev));
      n.appendChild(muted(timeFmt.format(d)));
      n.appendChild(muted(next.venue));
      n.appendChild(muted(next.tv.join(", ") || "TBA"));
      if (next.radioUrl) n.appendChild(link("Listen Live", next.radioUrl));
      n.appendChild(link("Odds", ODDS));
      box.appendChild(n);
    }
    box.style.display = last || next ? "block" : "none";
    for (var i = 1; i < boxes.length; i++) {
      boxes[i].innerHTML = box.innerHTML;
      boxes[i].style.display = box.style.display;
    }
  }

  function json(u) { return fetch(u).then(function (r) { return r.json(); }).catch(function () { return null; }); }
  function load() {
    Promise.all([json(SITE + "/api/leafs-game"), json(SITE + "/api/leafs")]).then(function (res) {
      if (res[0] && !res[0].error) render(res[0], res[1] && !res[1].error ? res[1] : null);
    });
  }
  load();
  setInterval(load, 30000);
})();
`;

export function GET() {
  return new Response(SCRIPT, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, s-maxage=300"
    }
  });
}
