export const runtime = "nodejs";

const SCRIPT = `(function () {
  var SITE = "https://tmltoday.com";
  var DISCUSSION = "https://forums.tmltoday.com/forums/2026-2027-leafs-game-day-threads.27/";
  var ODDS = "https://www.covers.com/sport/hockey/nhl/teams/main/toronto-maple-leafs";
  var hide = document.createElement("style");
  hide.textContent = ".p-breadcrumbs{display:none!important}" +
    ".p-navgroup-link--conversations,.p-navgroup-link--alerts,.p-navgroup-link--conversations:hover,.p-navgroup-link--alerts:hover,.p-navgroup-link--conversations i,.p-navgroup-link--alerts i,.p-navgroup-link--conversations i:before,.p-navgroup-link--alerts i:before,.p-navgroup-link--conversations i:after,.p-navgroup-link--alerts i:after{color:#fff!important;opacity:1!important}" +
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

  // Header inbox/alerts links are dark on the dark header; force every nav group link (and its icon) white.
  var navStyle = document.createElement("style");
  navStyle.textContent = ".p-navgroup-link,.p-navgroup-link *,.p-navgroup-link i:before,.p-navgroup-link i:after{color:#fff!important;opacity:1!important;visibility:visible!important}";
  navStyle.textContent += "i[data-tml-icon] svg,i[data-tml-icon] svg *{fill:none!important;stroke:#fff!important;stroke-width:1.4!important;stroke-linecap:round!important;stroke-linejoin:round!important}" +
    "i[data-tml-icon]:before,i[data-tml-icon]:after{content:none!important;display:none!important}";
  document.head.appendChild(navStyle);
  function whiten() {
    var links = document.querySelectorAll(".p-navgroup-link");
    for (var w = 0; w < links.length; w++) {
      var all = [links[w]].concat(Array.prototype.slice.call(links[w].querySelectorAll("*")));
      all.forEach(function (node) {
        node.style.setProperty("color", "#fff", "important");
        node.style.setProperty("opacity", "1", "important");
      });
    }
  }
  // The theme's inbox/alerts icons do not draw, so replace them with inline outline icons like the gear.
  var ICONS = {
    conversations: "<svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='#fff' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='5' width='18' height='14' rx='2'/><path d='M3 7l9 6 9-6'/></svg>",
    alerts: "<svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='#fff' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'><path d='M6 16V11a6 6 0 0 1 12 0v5l2 2H4z'/><path d='M10 21a2 2 0 0 0 4 0'/></svg>"
  };
  function fixIcons() {
    Object.keys(ICONS).forEach(function (name) {
      var icon = document.querySelector(".p-navgroup-link--" + name + " i");
      if (!icon || icon.getAttribute("data-tml-icon")) return;
      icon.innerHTML = ICONS[name];
      icon.setAttribute("data-tml-icon", "1");
      icon.style.cssText = "display:inline-flex!important;align-items:center;justify-content:center;width:22px!important;height:22px!important;font-size:0!important;opacity:1!important;visibility:visible!important";
    });
  }
  function fixHeader() { whiten(); fixIcons(); }
  fixHeader();
  setTimeout(fixHeader, 1500);
  setInterval(fixIcons, 5000);

  var boxes = [];
  function makeBox(parent, before) {
    var b = document.createElement("div");
    b.style.cssText = "background:#00205b;border-radius:10px;box-shadow:0 2px 8px rgba(0,32,91,.25);margin:0 auto 12px;padding:8px 18px;font:600 14px/1.4 Roboto,Arial,sans-serif;color:#fff;display:none";
    if (parent) parent.insertBefore(b, before);
    boxes.push(b);
  }
  makeBox(null, null); // detached source box; only copies are shown
  var key = document.documentElement.getAttribute("data-content-key") || "";
  var gameDay = key.indexOf("thread-") === 0 && !!document.querySelector('.p-breadcrumbs a[href*="leafs-game-day-threads"]');
  var threadDay = null;
  if (gameDay) {
    var tEl = document.querySelector(".p-title-value");
    var tm = /\\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\.?\\s+(\\d{1,2})/i.exec(tEl ? tEl.textContent : document.title);
    if (tm) {
      var mo = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(tm[1].toLowerCase()) + 1;
      threadDay = (mo < 10 ? "0" : "") + mo + "-" + (tm[2].length < 2 ? "0" : "") + tm[2];
    }
  }
  var threadGame = null;
  var pages = document.querySelectorAll(".pageNav-page");
  var onLastPage = !pages.length || pages[pages.length - 1].classList.contains("pageNav-page--current");
  var posts = document.querySelectorAll("article.message");
  if (gameDay && onLastPage && posts.length) {
    var lastPost = posts[posts.length - 1];
    makeBox(lastPost.parentNode, lastPost.nextSibling);
  }

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

  function fromGame(g) {
    return {
      id: g.gameId, startsAt: g.startsAt,
      away: { abbrev: g.away.code, score: g.away.score }, home: { abbrev: g.home.code, score: g.home.score },
      isLive: g.live, scheduled: !g.live && !g.final, resultType: g.resultType,
      periodNumber: g.periodNumber, periodType: g.periodType, inIntermission: g.inIntermission, timeRemaining: g.clock,
      boxScoreUrl: g.boxScoreUrl, condensedGameUrl: g.condensedGameUrl, radioUrl: g.radioUrl
    };
  }

  function render(data, live) {
    var box = boxes[0];
    box.textContent = "";
    var last = data.lastGame, next = data.nextGame;
    var specific = threadDay && threadGame && threadGame.away;
    if (specific) { last = fromGame(threadGame); live = threadGame; }
    if (last) {
      var same = live && live.gameId === last.id;
      var final = !last.isLive && !last.scheduled;
      var head = el("div", "display:flex;justify-content:space-between;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px");
      head.appendChild(el("span", "", "TML Today · " + (specific ? "" : "Latest · ") + dateFmt.format(new Date(last.startsAt))));
      head.appendChild(el("span", "color:" + (final ? SOFT : GREEN), last.scheduled ? "Scheduled" : final ? (last.resultType && last.resultType !== "REG" ? "Final/" + last.resultType : "Final") : "● Live"));
      box.appendChild(head);

      var main = el("div", "display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:4px 0");
      main.appendChild(team(last.away.abbrev, same ? live.away.name : ""));
      var mid = el("div", "text-align:center;line-height:1.2;min-width:110px");
      mid.appendChild(el("div", "font-size:26px;font-weight:800", last.scheduled ? "vs" : (last.away.score || 0) + " – " + (last.home.score || 0)));
      if (last.scheduled) mid.appendChild(el("div", "font-size:13px;font-weight:700;color:" + SOFT, timeFmt.format(new Date(last.startsAt))));
      if (!final && !last.scheduled) mid.appendChild(el("div", "font-size:13px;font-weight:700;color:" + GREEN, periodLabel(last)));
      main.appendChild(mid);
      main.appendChild(team(last.home.abbrev, same ? live.home.name : ""));
      box.appendChild(main);

      var rule = "border-top:1px solid rgba(255,255,255,.12);padding-top:4px;margin-top:4px;font-size:12px;";
      if (same && live.periods && live.periods.length) {
        var pl = live.periods.map(function (p) { return p.label + " " + p.away + "–" + p.home; }).join("  ·  ");
        box.appendChild(el("div", "text-align:center;font-size:12px;color:" + SOFT, pl + "  (" + live.away.code + "–" + live.home.code + ")"));
      }
      if (same && live.goals && live.goals.length) {
        var gw = el("div", rule);
        [live.away.code, live.home.code].forEach(function (code) {
          var mine = live.goals.filter(function (g) { return g.team === code; });
          if (!mine.length) return;
          mine.forEach(function (g, gi) {
            var line = el("div", "display:flex;flex-wrap:wrap;align-items:baseline;gap:0 8px;padding:1px 0");
            line.appendChild(el("span", "font-weight:800;min-width:34px", gi ? "" : code));
            var t = g.name + " (" + g.period + " " + g.time + (g.strength && g.strength !== "ev" ? " " + g.strength.toUpperCase() : "") + ")";
            if (g.clip) {
              var a = el("a", "color:#93b4ff;text-decoration:none;font-weight:700", t);
              a.href = g.clip; a.target = "_blank"; a.rel = "noopener noreferrer";
              line.appendChild(a);
            } else {
              line.appendChild(el("span", "font-weight:700", t));
            }
            line.appendChild(el("span", "color:" + SOFT + ";font-weight:500", g.assists && g.assists.length ? "from " + g.assists.join(", ") : "unassisted"));
            gw.appendChild(line);
          });
        });
        box.appendChild(gw);
      }
      if (same) {
        var parts = [];
        if (live.away.shots != null && live.home.shots != null) parts.push(["Shots on goal", live.away.shots + " – " + live.home.shots]);
        var st = live.stats || {};
        if (st.powerPlay) parts.push(["PP", st.powerPlay.away + " – " + st.powerPlay.home]);
        if (st.hits) parts.push(["Hits", st.hits.away + " – " + st.hits.home]);
        if (st.faceoffPct) parts.push(["FO%", st.faceoffPct.away + " – " + st.faceoffPct.home]);
        if (st.blocks) parts.push(["Blocks", st.blocks.away + " – " + st.blocks.home]);
        if (parts.length) {
          var sw = el("div", rule + "display:flex;flex-wrap:wrap;justify-content:center;gap:2px 16px");
          parts.forEach(function (p) {
            var c = el("span", "");
            c.appendChild(el("span", "color:" + SOFT + ";font-weight:500", p[0] + " "));
            c.appendChild(el("span", "font-weight:800", p[1]));
            sw.appendChild(c);
          });
          box.appendChild(sw);
        }
      }
      if (same && live.goalies && (live.goalies.away.length || live.goalies.home.length)) {
        var gl = el("div", rule);
        [[live.away.code, live.goalies.away], [live.home.code, live.goalies.home]].forEach(function (side) {
          side[1].forEach(function (g, gi) {
            var line = el("div", "display:flex;flex-wrap:wrap;align-items:baseline;gap:0 8px;padding:1px 0");
            line.appendChild(el("span", "font-weight:800;min-width:34px", gi ? "" : side[0]));
            line.appendChild(el("span", "font-weight:700", g.name + (g.decision ? " (" + g.decision + ")" : "")));
            line.appendChild(el("span", "color:" + SOFT + ";font-weight:500", g.saves + "/" + g.shotsAgainst + " SV" + (g.savePctg ? " · " + g.savePctg : "") + " · " + g.goalsAgainst + " GA · " + g.toi));
            gl.appendChild(line);
          });
        });
        box.appendChild(gl);
      }
      var foot = el("div", rule + "display:flex;flex-wrap:wrap;justify-content:center;align-items:center");
      if (final) {
        foot.appendChild(link("Box Score", last.boxScoreUrl));
        if (last.condensedGameUrl) foot.appendChild(link("Game Vids", last.condensedGameUrl));
      } else {
        foot.appendChild(link(last.scheduled ? "Gamecenter" : "Live Gamecenter", last.boxScoreUrl));
        if (last.radioUrl) foot.appendChild(link("Listen Live", last.radioUrl));
      }
      if (data.projectedLineup && data.projectedLineup.sourceUrl) foot.appendChild(link("Expected Lines", data.projectedLineup.sourceUrl));
      foot.firstChild.style.marginLeft = "0";
      box.appendChild(foot);
    }
    box.style.display = last ? "block" : "none";
    for (var i = 1; i < boxes.length; i++) {
      boxes[i].innerHTML = box.innerHTML;
      boxes[i].style.display = box.style.display;
    }
    renderSidebar(data);
  }

  var panels = [], statPanels = [], goaliePanels = [];
  var sidebars = document.querySelectorAll(".p-body-sidebar");
  for (var si = 0; si < sidebars.length; si++) {
    var pnl = document.createElement("div");
    pnl.style.cssText = "background:#fff;border-radius:10px;border-top:4px solid #00205b;box-shadow:0 1px 4px rgba(0,32,91,.12);margin-bottom:14px;padding:6px 14px 12px;font-family:Roboto,Arial,sans-serif;display:none";
    sidebars[si].insertBefore(pnl, sidebars[si].firstChild);
    panels.push(pnl);

    var sp = document.createElement("div");
    sp.style.cssText = pnl.style.cssText;
    sidebars[si].insertBefore(sp, pnl.nextSibling);
    statPanels.push(sp);

    var gp = document.createElement("div");
    gp.style.cssText = pnl.style.cssText;
    sidebars[si].insertBefore(gp, sp.nextSibling);
    goaliePanels.push(gp);
  }

  function renderGoalies(data) {
    var goalies = data && data.goalies;
    goaliePanels.forEach(function (box) {
      box.textContent = "";
      if (!goalies || !goalies.length) { box.style.display = "none"; return; }
      var head = el("div", "display:flex;justify-content:space-between;align-items:center;padding:6px 0 8px");
      head.appendChild(el("span", "color:#00205b;font-size:19px;font-weight:800", "Goalie stats"));
      if (data.season) head.appendChild(el("span", "background:#dbe4f5;color:#00205b;font-size:10px;font-weight:800;border-radius:4px;padding:3px 7px", data.season));
      box.appendChild(head);

      var cols = "display:grid;grid-template-columns:1fr 22px 22px 22px 40px 38px;gap:0 2px;align-items:center;";
      var th = el("div", cols + "font-size:10px;font-weight:700;text-transform:uppercase;color:#64748b;border-bottom:1px solid #cbd5e1;padding-bottom:6px");
      ["Goalie", "GP", "W", "L", "SV%", "GAA"].forEach(function (h, i) { th.appendChild(el("span", i ? "text-align:right" : "", h)); });
      box.appendChild(th);

      goalies.forEach(function (g) {
        var r = el("div", cols + "font-size:13px;padding:6px 0;border-bottom:1px solid #e2e8f0");
        r.appendChild(el("span", "color:#00205b;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis", g.name));
        [g.gamesPlayed, g.wins, g.losses].forEach(function (v) { r.appendChild(el("span", "text-align:right;color:#475569", String(v))); });
        r.appendChild(el("span", "text-align:right;color:#00205b;font-weight:800", g.savePercentage));
        r.appendChild(el("span", "text-align:right;color:#475569", g.goalsAgainstAverage));
        box.appendChild(r);
      });
      box.style.display = "block";
    });
  }

  function renderStats(data) {
    var players = data && data.players;
    statPanels.forEach(function (box) {
      box.textContent = "";
      if (!players || !players.length) { box.style.display = "none"; return; }
      var head = el("div", "display:flex;justify-content:space-between;align-items:center;padding:6px 0 8px");
      head.appendChild(el("span", "color:#00205b;font-size:19px;font-weight:800", "Player stats"));
      if (data.season) head.appendChild(el("span", "background:#dbe4f5;color:#00205b;font-size:10px;font-weight:800;border-radius:4px;padding:3px 7px", data.season));
      box.appendChild(head);

      var cols = "display:grid;grid-template-columns:1fr 26px 22px 22px 32px;gap:0 2px;align-items:center;";
      var th = el("div", cols + "font-size:10px;font-weight:700;text-transform:uppercase;color:#64748b;border-bottom:1px solid #cbd5e1;padding-bottom:6px");
      ["Player", "GP", "G", "A", "PTS"].forEach(function (h, i) { th.appendChild(el("span", i ? "text-align:right" : "", h)); });
      box.appendChild(th);

      players.forEach(function (p, i) {
        var r = el("div", cols + "font-size:13px;padding:6px 0;border-bottom:1px solid #e2e8f0");
        var nm = el("span", "color:#00205b;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis");
        nm.appendChild(el("span", "color:#3b4bb0;margin-right:6px", String(i + 1)));
        nm.appendChild(document.createTextNode(p.name));
        r.appendChild(nm);
        [p.gamesPlayed, p.goals, p.assists].forEach(function (v) { r.appendChild(el("span", "text-align:right;color:#475569", String(v))); });
        r.appendChild(el("span", "text-align:right;color:#00205b;font-weight:800", String(p.points)));
        box.appendChild(r);
      });
      box.style.display = "block";
    });
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

  function json(u) { return fetch(u).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }
  function saved(key, value) {
    try {
      if (value === undefined) { var c = JSON.parse(localStorage.getItem(key)); return c; }
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
    return null;
  }

  // Show the last good data immediately, then refresh; a failed refresh keeps what is on screen.
  var shown = false;
  var cached = saved("tml-game-v2");
  if (cached && cached.game && cached.day === threadDay) {
    threadGame = cached.thread || null;
    render(cached.game, cached.latest || null);
    shown = true;
  }

  function load(retry) {
    Promise.all([json(SITE + "/api/leafs-game"), json(SITE + "/api/leafs"), threadDay ? json(SITE + "/api/leafs?d=" + threadDay) : null]).then(function (res) {
      var game = res[0], latest = res[1] && !res[1].error ? res[1] : null, thread = res[2] && !res[2].error && res[2].away ? res[2] : null;
      if (game && !game.error && (game.lastGame || game.nextGame)) {
        if (thread) threadGame = thread;
        render(game, latest);
        shown = true;
        saved("tml-game-v2", { game: game, latest: latest, thread: threadGame, day: threadDay });
      } else if (!shown && retry < 3) {
        setTimeout(function () { load(retry + 1); }, 4000 * (retry + 1));
      }
    });
  }
  load(0);
  setInterval(function () { load(3); }, 30000);

  if (statPanels.length) {
    var cs = saved("tml-stats-v2");
    if (cs && cs.players && cs.players.length) { renderStats(cs); renderGoalies(cs); }
    var loadStats = function (retry) {
      json(SITE + "/api/leafs-stats").then(function (d) {
        if (d && d.players && d.players.length) {
          renderStats(d); renderGoalies(d);
          saved("tml-stats-v2", d);
        } else if (retry < 3) {
          setTimeout(function () { loadStats(retry + 1); }, 4000 * (retry + 1));
        }
      });
    };
    loadStats(0);
    setInterval(function () { loadStats(3); }, 900000);
  }
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
