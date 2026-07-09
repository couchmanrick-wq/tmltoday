import app from './.open-next/worker.js';

export default {
  fetch(request, env, ctx) {
    return app.fetch(request, env, ctx);
  },

  scheduled(_event, env, ctx) {
    const refreshPath = env.AGGREGATOR_REFRESH_PATH || '/api/aggregator/refresh';
    const url = new URL(refreshPath, 'https://tmltoday.com');
    const headers = new Headers();

    if (env.AGGREGATOR_SECRET) {
      headers.set('authorization', `Bearer ${env.AGGREGATOR_SECRET}`);
    }

    ctx.waitUntil(
      app.fetch(
        new Request(url, {
          method: 'POST',
          headers,
        }),
        env,
        ctx
      )
    );
  },
};
