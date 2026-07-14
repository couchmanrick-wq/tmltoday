import { getCloudflareContext } from '@opennextjs/cloudflare';

export const ADMIN_COOKIE = 'tmltoday_admin';
const SESSION_LENGTH_SECONDS = 60 * 60 * 12;

type AdminEnv = CloudflareEnv & {
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
};

function getAdminEnv() {
  return getCloudflareContext().env as AdminEnv;
}

export function validateAdminCredentials(username: string, password: string) {
  const env = getAdminEnv();
  return Boolean(env.ADMIN_USERNAME && env.ADMIN_PASSWORD && username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD);
}

export async function createAdminSession(username: string) {
  const secret = getAdminEnv().ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured');

  const payload = toBase64Url(JSON.stringify({ username, expiresAt: Date.now() + SESSION_LENGTH_SECONDS * 1000 }));
  const signature = await sign(payload, secret);
  return { token: `${payload}.${signature}`, maxAge: SESSION_LENGTH_SECONDS };
}

export async function verifyAdminSession(token?: string) {
  if (!token) return false;
  const secret = getAdminEnv().ADMIN_SESSION_SECRET;
  if (!secret) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature || (await sign(payload, secret)) !== signature) return false;

  try {
    const data = JSON.parse(fromBase64Url(payload)) as { username?: string; expiresAt?: number };
    return Boolean(data.username && data.expiresAt && data.expiresAt > Date.now());
  } catch {
    return false;
  }
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return toBase64Url(String.fromCharCode(...new Uint8Array(signature)));
}

function toBase64Url(value: string) {
  return btoa(unescape(encodeURIComponent(value))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
  return decodeURIComponent(escape(atob(padded)));
}
