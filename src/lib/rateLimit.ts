import { createHash } from 'node:crypto';
import { getDb } from './mongodb';

const COLLECTION = 'admin_login_attempts';

// Rules
const MAX_FAILS = 5; // failures allowed in window before lock
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes — count fails inside this rolling window
const LOCK_MS = 15 * 60 * 1000; // 15 minutes lockout

let indexesEnsured = false;

async function ensureIndexes() {
  if (indexesEnsured) return;
  const db = await getDb();
  const col = db.collection(COLLECTION);
  try {
    await col.createIndex({ ipHash: 1 }, { unique: true });
    // TTL: documents auto-expire 1 hour after lastFailAt; lockedUntil may extend it.
    await col.createIndex({ lastFailAt: 1 }, { expireAfterSeconds: 60 * 60 });
  } catch {
    /* ignore index errors */
  }
  indexesEnsured = true;
}

export function hashIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const real = req.headers.get('x-real-ip');
  const ip = fwd || real || 'unknown';
  return createHash('sha256').update(ip).digest('hex').slice(0, 32);
}

export interface LockState {
  locked: boolean;
  retryAfterSeconds: number;
  failsInWindow: number;
  failsRemaining: number;
}

export async function getLockState(ipHash: string): Promise<LockState> {
  await ensureIndexes();
  const db = await getDb();
  const col = db.collection(COLLECTION);
  const doc = await col.findOne({ ipHash });
  const now = Date.now();

  if (!doc) {
    return { locked: false, retryAfterSeconds: 0, failsInWindow: 0, failsRemaining: MAX_FAILS };
  }

  const lockedUntil = doc.lockedUntil ? new Date(doc.lockedUntil).getTime() : 0;
  if (lockedUntil > now) {
    return {
      locked: true,
      retryAfterSeconds: Math.ceil((lockedUntil - now) / 1000),
      failsInWindow: doc.failsInWindow ?? 0,
      failsRemaining: 0
    };
  }

  // Reset stale window
  const firstFailAt = doc.firstFailAt ? new Date(doc.firstFailAt).getTime() : 0;
  if (now - firstFailAt > WINDOW_MS) {
    return { locked: false, retryAfterSeconds: 0, failsInWindow: 0, failsRemaining: MAX_FAILS };
  }

  const fails = doc.failsInWindow ?? 0;
  return {
    locked: false,
    retryAfterSeconds: 0,
    failsInWindow: fails,
    failsRemaining: Math.max(0, MAX_FAILS - fails)
  };
}

/**
 * Record a failed attempt. Returns the new lock state.
 * If the rolling-window fail count crosses MAX_FAILS, the IP gets locked for LOCK_MS.
 */
export async function recordFailedAttempt(ipHash: string): Promise<LockState> {
  await ensureIndexes();
  const db = await getDb();
  const col = db.collection(COLLECTION);
  const now = new Date();
  const nowMs = now.getTime();

  const doc = await col.findOne({ ipHash });
  let failsInWindow = 1;
  let firstFailAt: Date = now;

  if (doc) {
    const prevFirst = doc.firstFailAt ? new Date(doc.firstFailAt).getTime() : 0;
    if (nowMs - prevFirst <= WINDOW_MS) {
      failsInWindow = (doc.failsInWindow ?? 0) + 1;
      firstFailAt = new Date(prevFirst);
    }
  }

  let lockedUntil: Date | null = null;
  if (failsInWindow >= MAX_FAILS) {
    lockedUntil = new Date(nowMs + LOCK_MS);
  }

  await col.updateOne(
    { ipHash },
    {
      $set: {
        ipHash,
        failsInWindow,
        firstFailAt,
        lastFailAt: now,
        ...(lockedUntil ? { lockedUntil } : {})
      }
    },
    { upsert: true }
  );

  if (lockedUntil) {
    return {
      locked: true,
      retryAfterSeconds: Math.ceil((lockedUntil.getTime() - nowMs) / 1000),
      failsInWindow,
      failsRemaining: 0
    };
  }

  return {
    locked: false,
    retryAfterSeconds: 0,
    failsInWindow,
    failsRemaining: Math.max(0, MAX_FAILS - failsInWindow)
  };
}

/** On successful login, wipe the IP's attempt record. */
export async function clearAttempts(ipHash: string): Promise<void> {
  try {
    const db = await getDb();
    await db.collection(COLLECTION).deleteOne({ ipHash });
  } catch {
    /* non-critical */
  }
}

export const RATE_LIMIT_CONFIG = { MAX_FAILS, WINDOW_MS, LOCK_MS };
