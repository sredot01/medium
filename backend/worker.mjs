import { DurableObject, env } from 'cloudflare:workers';
import { httpServerHandler } from 'cloudflare:node';
import { createServer } from 'node:http';
import app from './server.js';
import database from './config/database.js';

const handler = httpServerHandler(createServer(app));

export class BlogDatabase extends DurableObject {
  constructor(ctx, bindings) {
    super(ctx, bindings);
    app.locals.workersAI = bindings.AI;
    const sql = ctx.storage.sql;
    ctx.blockConcurrencyWhile(() => database.initializeDatabase({
      run(query, parameters = []) {
        sql.exec(query, ...parameters).toArray();
      },
      exec(query, parameters = []) {
        const cursor = sql.exec(query, ...parameters);
        const columns = cursor.columnNames;
        const values = [...cursor.raw()];
        return values.length ? [{ columns, values }] : [];
      }
    }));
  }

  fetch(request) {
    if (!env.JWT_SECRET) return new Response('Service unavailable', { status: 503 });
    process.env.JWT_SECRET = env.JWT_SECRET;
    return handler.fetch(request, env, this.ctx);
  }
}

export default {
  fetch(request, bindings) {
    const path = new URL(request.url).pathname;
    if (path === '/api' || path.startsWith('/api/')) {
      return bindings.BLOG.getByName('production').fetch(request);
    }
    return bindings.ASSETS.fetch(request);
  }
};
