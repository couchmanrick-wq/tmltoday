import app from './.open-next/worker.js';

export default {
  fetch(request, env, ctx) {
    return app.fetch(request, env, ctx);
  },

  scheduled(event, env, ctx) {
    const headers = new Headers();
    if (env.AGGREGATOR_SECRET) {
      headers.set('authorization', `Bearer ${env.AGGREGATOR_SECRET}`);
    }
    const fire = (path) =>
      ctx.waitUntil(
        app.fetch(new Request(new URL(path, 'https://tmltoday.com'), { method: 'POST', headers }), env, ctx)
      );

    // The nightly run (3 AM Eastern) refreshes the draft history, resolves new picks to NHL player IDs,
    // and reviews the prospect list — each a separate request so it gets its own subrequest budget
    // (the Workers ~50-subrequest cap). Cron is UTC-only, so it fires at 07:00 and 08:00 UTC and only
    // the run that lands on 3 AM in Toronto proceeds (EDT/EST). Other triggers refresh the aggregator feed.
    if (event && (event.cron === '0 7 * * *' || event.cron === '0 8 * * *')) {
      const hour = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Toronto', hour: 'numeric', hourCycle: 'h23' }).format(new Date(event.scheduledTime));
      if (Number(hour) !== 3) return;
      fire('/api/draft/review');
      fire('/api/draft/resolve');
      fire(env.PROSPECTS_REVIEW_PATH || '/api/prospects/review');
    } else {
      fire(env.AGGREGATOR_REFRESH_PATH || '/api/aggregator/refresh');
    }
  },
};
