export const runtime = "nodejs";

const SCRIPT = `(function () {
  var SITE = "https://tmltoday.com";
  var DISCUSSION = "https://forums.tmltoday.com/forums/2026-2027-leafs-game-day-threads.27/";
  var ODDS = "https://www.covers.com/sport/hockey/nhl/teams/main/toronto-maple-leafs";
  var host = document.querySelector(".p-body-inner") || document.querySelector(".p-body");
  if (!host) return;

  var box = document.createElement("div");
  box.style.cssText = "background:#fff;border-top:3px solid #00205b;margin-bottom:10px;padding:4px 10px;font:600 13px/1.5 Roboto,Arial,sans-serif;color:#00205b;display:none";
  host.insertBefore(box, host.firstChild);

  var dateFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", month: "short", day: "numeric" });
  var timeFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto", hour: "numeric", minute: "2-digit", timeZoneName: "short" });

  function el(tag, css, text) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text != null) e.textContent = text;
    return e;
  }
  function label(t) { return el("span", "color:#d6001c;font-weight:800;text-transform:uppercase;margin-right:8px", t); }
  function muted(t) { return el("span", "color:#64748b;font-weight:700;margin:0 8px", t); }
  function link(t, href) {
    var a = el("a", "color:#3b5bdb;font-weight:700;margin-left:10px;text-decoration:none", t);
    a.href = href; a.target = "_blank"; a.rel = "noopener noreferrer";
    return a;
  }
  function row() { return el("div", "display:flex;flex-wrap:wrap;align-items:baseline;padding:2px 0"); }

  function status(g, live) {
    if (g.isLive) {
      var p = g.periodType === "SO" ? "SO" : (g.periodType === "OT" || g.periodNumber > 3) ? "OT" : ["", "1st", "2nd", "3rd"][g.periodNumber] || "";
      return g.inIntermission ? "Intermission " + p : p + " " + (g.timeRemaining || "");
    }
    return g.resultType && g.resultType !== "REG" ? "Final/" + g.resultType : "Final";
  }

  function render(data, live) {
    box.textContent = "";
    var last = data.lastGame, next = data.nextGame;
    if (last) {
      var r = row();
      r.appendChild(label("Latest"));
      r.appendChild(el("span", "", last.away.abbrev + " " + (last.away.score || 0) + " - " + last.home.abbrev + " " + (last.home.score || 0)));
      r.appendChild(muted(status(last).trim()));
      if (live && live.gameId === last.id && live.away.shots != null && live.home.shots != null) {
        r.appendChild(muted("SOG " + live.away.code + " " + live.away.shots + "-" + live.home.shots + " " + live.home.code));
      }
      r.appendChild(muted(dateFmt.format(new Date(last.startsAt))));
      r.appendChild(link("Box Score", last.boxScoreUrl));
      if (last.condensedGameUrl) r.appendChild(link("Game Vids", last.condensedGameUrl));
      r.appendChild(link("Discussion", DISCUSSION));
      box.appendChild(r);
    }
    if (next) {
      var n = row(), d = new Date(next.startsAt);
      n.appendChild(label("Next"));
      n.appendChild(el("span", "", next.away.abbrev + " @ " + next.home.abbrev));
      n.appendChild(muted(dateFmt.format(d) + " " + timeFmt.format(d)));
      n.appendChild(muted(next.venue));
      n.appendChild(muted(next.tv.join(", ") || "TBA"));
      if (next.radioUrl) n.appendChild(link("Listen Live", next.radioUrl));
      n.appendChild(link("Odds", ODDS));
      n.appendChild(link("Discussion", DISCUSSION));
      box.appendChild(n);
    }
    box.style.display = last || next ? "block" : "none";
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
