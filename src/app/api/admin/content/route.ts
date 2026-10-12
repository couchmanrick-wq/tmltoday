import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { ADMIN_COOKIE, verifyAdminSession } from '@/lib/admin-auth';

const CONTENT_TYPES = new Set(['article', 'blog', 'podcast', 'video', 'tweet']);
const TOPICS = new Set(['', 'breaking', 'game', 'injury', 'trade', 'rumour', 'analysis', 'prospects', 'roster', 'media', 'community']);

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  if (!(await verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value))) {
    return NextResponse.redirect(new URL('/admin', request.url), 303);
  }

  const form = await request.formData();
  const id = textField(form, 'id', 200);
  const intent = form.get('intent');
  const page = textField(form, 'page', 6);
  if (!id) return redirectWithNotice(request, 'Item ID is missing.', page);

  const { env } = getCloudflareContext();
  if (intent === 'delete') {
    const item = await env.DB.prepare('SELECT link FROM enriched_content WHERE id = ?').bind(id).first<{ link: string }>();
    if (!item) return redirectWithNotice(request, 'That item no longer exists.', page);
    await env.DB.batch([
      env.DB.prepare(`INSERT OR IGNORE INTO blocked_content (link, reason) VALUES (?, 'unrelated')`).bind(item.link),
      env.DB.prepare('DELETE FROM enriched_content WHERE id = ?').bind(id),
    ]);
    return redirectWithNotice(request, 'Item deleted from the aggregated feed.', page);
  }

  if (intent === 'confirm' || intent === 'unconfirm') {
    if (intent === 'confirm') {
      await env.DB.prepare(`INSERT OR IGNORE INTO reviewed_content (id) VALUES (?)`).bind(id).run();
    } else {
      await env.DB.prepare('DELETE FROM reviewed_content WHERE id = ?').bind(id).run();
    }
    return redirectWithNotice(request, intent === 'confirm' ? 'Item marked as reviewed.' : 'Review cleared.', page);
  }

  const title = textField(form, 'title', 500);
  const description = textField(form, 'description', 4000);
  const source = textField(form, 'source', 200);
  const contentType = textField(form, 'contentType', 30);
  const topic = textField(form, 'topic', 30);
  if (!title || !source || !CONTENT_TYPES.has(contentType) || !TOPICS.has(topic)) {
    return redirectWithNotice(request, 'The item could not be saved because one or more fields are invalid.', page);
  }

  await env.DB.prepare(`UPDATE enriched_content SET title = ?, description = ?, source = ?, content_type = ?, topic = ?, updated_at = datetime('now') WHERE id = ?`)
    .bind(title, description, source, contentType, topic || null, id).run();
  return redirectWithNotice(request, 'Item updated successfully.', page);
}

function textField(form: FormData, name: string, maxLength: number) {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function redirectWithNotice(request: NextRequest, notice: string, page?: string) {
  const url = new URL('/admin/content', request.url);
  const pageNumber = Number.parseInt(page ?? '', 10);
  if (Number.isFinite(pageNumber) && pageNumber > 1) url.searchParams.set('page', String(pageNumber));
  url.searchParams.set('notice', notice);
  return NextResponse.redirect(url, 303);
}
