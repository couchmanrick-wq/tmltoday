export const runtime = "nodejs";

const SCRIPT = `(function () {
  var API = "https://tmltoday.com/api/leafs";
  var host = document.querySelector(".p-body-inner") || document.querySelector(".p-body");
  if (!host) return;

  var bar = document.createElement("div");
  bar.id = "tml-score-banner";
  bar.style.cssText = "background:#00205b;color:#fff;text-align:center;padding:8px 12px;font:600 15px/1.4 sans-serif;margin-bottom:10px;border-radius:4px;display:none";
  host.insertBefore(bar, host.firstChild);

  function render(g) {
    if (!g || g.error || !g.away) { bar.style.display = "none"; return; }
    var shots = g.away.shots != null && g.home.shots != null
      ? " &nbsp;|&nbsp; SOG " + g.away.code + " " + g.away.shots + " - " + g.home.code + " " + g.home.shots
      : "";
    var clock = g.live && g.clock ? " " + g.clock : "";
    bar.innerHTML = g.away.code + " " + g.away.score + " - " + g.home.code + " " + g.home.score +
      " &nbsp;|&nbsp; " + g.periodText + clock + shots;
    bar.style.display = "block";
  }

  function load() {
    fetch(API).then(function (r) { return r.json(); }).then(render).catch(function () {});
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
