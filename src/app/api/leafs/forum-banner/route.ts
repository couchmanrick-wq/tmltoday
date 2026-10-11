export const runtime = "nodejs";

const SCRIPT = `(function () {
  var SITE = "https://tmltoday.com";
  var DISCUSSION = "https://forums.tmltoday.com/forums/2026-2027-leafs-game-day-threads.27/";
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
    b.style.cssText = "background:#00205b;border-radius:10px;box-shadow:0 2px 8px rgba(0,32,91,.25);margin:0 auto 12px;padding:8px 18px;font:600 14px/1.4 Roboto,Arial,sans-serif;color:#fff;display:none";
    if (parent) parent.insertBefore(b, before);
    boxes.push(b);
  }
  makeBox(null, null); // detached source box; only copies are shown
  var quick = document.querySelector(".js-quickReply") || document.querySelector("#quickReply");
  if (quick && quick.parentNode) makeBox(quick.parentNode, quick);

  var dateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", month: "short", day: "numeric" });
  var timeFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
  var GREEN = "#34d399", SOFT = "#cbd5e1";

  function el(tag, css, text) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text != null) e.textContent = text;
    return e;
  }
  function link(t, href) {
    var a = el("a", "color:#93b4ff;font-weight:700;margin-left:12px;text-decoration:none", t);
    a.href = href; a.target = "_blank"; a.rel = "noopener noreferrer";
    return a;
  }
  function team(code, name) {
    var d = el("div", "display:flex;flex-direction:column;align-items:center;line-height:1.15");
    d.appendChild(el("span", "font-size:22px;font-weight:800;letter-spacing:.5px", code));
    if (name) d.appendChild(el("span", "font-size:11px;font-weight:500;color:" + SOFT, name));
    return d;
  }
  function periodLabel(g) {
    var p = g.periodType === "SO" ? "SO" : (g.periodType === "OT" || g.periodNumber > 3) ? "OT" : ["", "1st", "2nd", "3rd"][g.periodNumber] || "";
    return g.inIntermission ? "Intermission " + p : (p + " " + (g.timeRemaining || "")).trim();
  }

  function render(data, live) {
    var box = boxes[0];
    box.textContent = "";
    var last = data.lastGame, next = data.nextGame;
    if (last) {
      var same = live && live.gameId === last.id;
      var final = !last.isLive;
      var head = el("div", "display:flex;justify-content:space-between;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px");
      head.appendChild(el("span", "", "TML Today · Latest · " + dateFmt.format(new Date(last.startsAt))));
      head.appendChild(el("span", "color:" + (final ? SOFT : GREEN), final ? (last.resultType && last.resultType !== "REG" ? "Final/" + last.resultType : "Final") : "● Live"));
      box.appendChild(head);

      var main = el("div", "display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:4px 0");
      main.appendChild(team(last.away.abbrev, same ? live.away.name : ""));
      var mid = el("div", "text-align:center;line-height:1.2;min-width:110px");
      mid.appendChild(el("div", "font-size:26px;font-weight:800", (last.away.score || 0) + " – " + (last.home.score || 0)));
      if (!final) mid.appendChild(el("div", "font-size:13px;font-weight:700;color:" + GREEN, periodLabel(last)));
      main.appendChild(mid);
      main.appendChild(team(last.home.abbrev, same ? live.home.name : ""));
      box.appendChild(main);

      var foot = el("div", "display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,.12);padding-top:4px;font-size:12px");
      if (same && live.away.shots != null && live.home.shots != null) {
        var sog = el("span", "");
        sog.appendChild(el("span", "color:" + SOFT + ";font-weight:500", "Shots on goal "));
        sog.appendChild(el("span", "font-weight:800", live.away.shots + " – " + live.home.shots));
        foot.appendChild(sog);
      } else {
        foot.appendChild(el("span", ""));
      }
      var links = el("span", "");
      links.appendChild(link("Box Score", last.boxScoreUrl));
      if (last.condensedGameUrl) links.appendChild(link("Game Vids", last.condensedGameUrl));
      foot.appendChild(links);
      box.appendChild(foot);
    }
    if (next) {
      var d = new Date(next.startsAt);
      var n = el("div", "display:flex;flex-wrap:wrap;justify-content:center;align-items:baseline;gap:0 10px;border-top:1px solid rgba(255,255,255,.12);margin-top:6px;padding-top:5px;font-size:12px;color:" + SOFT);
      n.appendChild(el("span", "color:#fff;font-weight:800;text-transform:uppercase", "Next: " + dateFmt.format(d)));
      n.appendChild(el("span", "color:#fff;font-weight:700", next.away.abbrev + " @ " + next.home.abbrev));
      n.appendChild(el("span", "", timeFmt.format(d)));
      n.appendChild(el("span", "", next.venue));
      n.appendChild(el("span", "", next.tv.join(", ") || "TBA"));
      if (next.radioUrl) n.appendChild(link("Listen Live", next.radioUrl));
      n.appendChild(link("Odds", ODDS));
      box.appendChild(n);
    }
    box.style.display = last || next ? "block" : "none";
    for (var i = 1; i < boxes.length; i++) {
      boxes[i].innerHTML = box.innerHTML;
      boxes[i].style.display = box.style.display;
    }
    renderSidebar(data);
  }

  var panels = [];
  var sidebars = document.querySelectorAll(".p-body-sidebar");
  for (var si = 0; si < sidebars.length; si++) {
    var pnl = document.createElement("div");
    pnl.style.cssText = "background:#fff;border-radius:10px;border-top:4px solid #00205b;box-shadow:0 1px 4px rgba(0,32,91,.12);margin-bottom:14px;padding:6px 14px 12px;font-family:Roboto,Arial,sans-serif;display:none";
    sidebars[si].insertBefore(pnl, sidebars[si].firstChild);
    panels.push(pnl);
  }

  function sRow(left, right, leftCss, rightCss) {
    var r = el("div", "display:flex;justify-content:space-between;align-items:baseline;padding:5px 0");
    r.appendChild(el("span", leftCss, left));
    if (right != null) r.appendChild(el("span", rightCss, right));
    return r;
  }
  function sLinks(items) {
    var d = el("div", "display:flex;flex-wrap:wrap;align-items:center;gap:2px 0;margin-top:8px;font-size:12px");
    d.appendChild(el("span", "color:#64748b;margin-right:8px", "→"));
    items.forEach(function (it, i) {
      if (i) d.appendChild(el("span", "color:#64748b;margin:0 7px", "•"));
      var a = el("a", "color:#3b4bb0;font-weight:700;text-decoration:none", it[0]);
      a.href = it[1]; a.target = "_blank"; a.rel = "noopener noreferrer";
      d.appendChild(a);
    });
    return d;
  }
  function sHead(title, when, top) {
    var h = el("div", "display:flex;justify-content:space-between;align-items:baseline;padding:" + (top ? "6px" : "26px") + " 0 2px");
    h.appendChild(el("span", "color:#d6001c;font-size:19px;font-weight:800;text-transform:uppercase", title));
    h.appendChild(el("span", "color:#64748b;font-size:12px;font-weight:700", when));
    return h;
  }
  function sDetail(k, v) {
    var r = el("div", "display:flex;font-size:12px;padding:2px 0");
    r.appendChild(el("span", "width:62px;color:#64748b;font-weight:700;text-transform:uppercase", k));
    r.appendChild(el("span", "color:#334155;font-weight:700", v));
    return r;
  }
  var NAVY = "color:#00205b;font-size:14px;font-weight:700", SCORE = "color:#00205b;font-size:24px;font-weight:800";

  function renderSidebar(data) {
    var last = data.lastGame, next = data.nextGame;
    panels.forEach(function (box) {
      box.textContent = "";
      if (last) {
        box.appendChild(sHead("Latest Game", dateFmt.format(new Date(last.startsAt)) , true));
        box.appendChild(sRow(last.away.name, String(last.away.score || 0), NAVY, SCORE));
        box.appendChild(sRow(last.home.name, String(last.home.score || 0), NAVY, SCORE));
        var live = last.isLive;
        var st = live ? "LIVE · " + periodLabel(last) : (last.resultType && last.resultType !== "REG" ? "FINAL/" + last.resultType : "FINAL");
        box.appendChild(el("div", "text-align:right;font-size:10px;font-weight:800;letter-spacing:.5px;color:" + (live ? "#16a34a" : "#64748b"), st));
        var items = [["Box Score", last.boxScoreUrl]];
        if (last.condensedGameUrl) items.push(["Game Vids", last.condensedGameUrl]);
        items.push(["Discussion", DISCUSSION]);
        box.appendChild(sLinks(items));
      }
      if (next) {
        var d = new Date(next.startsAt);
        box.appendChild(sHead("Next Game", dateFmt.format(d)));
        box.appendChild(sRow(next.away.name, "-", NAVY, SCORE));
        box.appendChild(sRow(next.home.name, "-", NAVY, SCORE));
        var det = el("div", "margin-top:6px");
        det.appendChild(sDetail("Time", timeFmt.format(d)));
        det.appendChild(sDetail("Arena", next.venue));
        det.appendChild(sDetail("TV", next.tv.join(", ") || "TBA"));
        box.appendChild(det);
        var ni = [["Game centre", next.boxScoreUrl]];
        if (data.projectedLineup && data.projectedLineup.sourceUrl) ni.push(["Expected Lines", data.projectedLineup.sourceUrl]);
        if (next.radioUrl) ni.unshift(["Listen Live", next.radioUrl]);
        ni.push(["Odds", ODDS], ["Discussion", DISCUSSION]);
        box.appendChild(sLinks(ni));
      }
      box.style.display = last || next ? "block" : "none";
    });
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
