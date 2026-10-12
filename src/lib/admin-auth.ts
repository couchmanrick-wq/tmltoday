import { getCloudflareContext } from '@opennextjs/cloudflare';

export const ADMIN_COOKIE = 'tmltoday_admin';
const SESSION_LENGTH_SECONDS = 60 * 60 * 12;

type AdminEnv = CloudflareEnv & {
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
  ADMIN_GUEST_USERNAME?: string;
  ADMIN_GUEST_PASSWORD?: string;
  ADMIN_GUEST_PIN?: string;
};

export type AdminRole = 'admin' | 'viewer';

export interface AdminSession {
  username: string;
  role: AdminRole;
  expiresAt: number;
}

function getAdminEnv() {
  return getCloudflareContext().env as AdminEnv;
}

export function validateAdminCredentials(username: string, password: string, pin = ''): Omit<AdminSession, 'expiresAt'> | null {
  const env = getAdminEnv();
  if (env.ADMIN_USERNAME && env.ADMIN_PASSWORD && username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
    return { username, role: 'admin' };
  }

  if (
    env.ADMIN_GUEST_USERNAME &&
    env.ADMIN_GUEST_PASSWORD &&
    env.ADMIN_GUEST_PIN &&
    username === env.ADMIN_GUEST_USERNAME &&
    password === env.ADMIN_GUEST_PASSWORD &&
    pin === env.ADMIN_GUEST_PIN
  ) {
    return { username, role: 'viewer' };
  }

  return null;
}

export async function createAdminSession(identity: Omit<AdminSession, 'expiresAt'>) {
  const secret = getAdminEnv().ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured');

  const payload = toBase64Url(JSON.stringify({ ...identity, expiresAt: Date.now() + SESSION_LENGTH_SECONDS * 1000 }));
  const signature = await sign(payload, secret);
  return { token: `${payload}.${signature}`, maxAge: SESSION_LENGTH_SECONDS };
}

export async function verifyAdminSession(token?: string) {
  if (!token) return null;
  const secret = getAdminEnv().ADMIN_SESSION_SECRET;
  if (!secret) return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature || (await sign(payload, secret)) !== signature) return null;

  try {
    const data = JSON.parse(fromBase64Url(payload)) as Partial<AdminSession>;
    if (!data.username || !data.expiresAt || data.expiresAt <= Date.now()) return null;

    // Sessions created before roles were introduced belong to the configured
    // administrator. This preserves an existing login during deployment.
    const role = data.role ?? (data.username === getAdminEnv().ADMIN_USERNAME ? 'admin' : undefined);
    if (role !== 'admin' && role !== 'viewer') return null;
    return { username: data.username, role, expiresAt: data.expiresAt };
  } catch {
    return null;
  }
}

export function canEditAdmin(session: AdminSession | null) {
  return session?.role === 'admin';
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
