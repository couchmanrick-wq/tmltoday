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

    // The daily trigger refreshes the draft history, resolves new picks to NHL player IDs, and
    // reviews the prospect list — each a separate request so it gets its own subrequest budget
    // (the Workers ~50-subrequest cap). All other triggers refresh the aggregator feed.
    if (event && event.cron === '0 9 * * *') {
      fire('/api/draft/review');
      fire('/api/draft/resolve');
      fire(env.PROSPECTS_REVIEW_PATH || '/api/prospects/review');
    } else {
      fire(env.AGGREGATOR_REFRESH_PATH || '/api/aggregator/refresh');
    }
  },
};
