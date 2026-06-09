import { NextResponse } from 'next/server';
import { checkAdminPassword, createAdminSession, setAdminCookie } from '@/lib/auth';
import {
  clearAttempts,
  getLockState,
  hashIp,
  recordFailedAttempt
} from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function formatRetry(seconds: number) {
  if (seconds < 60) return `${seconds} seconds`;
  const m = Math.ceil(seconds / 60);
  return `${m} minute${m === 1 ? '' : 's'}`;
}

export async function POST(req: Request) {
  const ipHash = hashIp(req);

  // 1. Check if this IP is currently locked out
  let lock;
  try {
    lock = await getLockState(ipHash);
  } catch (e) {
    // If the rate-limit DB is unreachable, fail-CLOSED — refuse the login.
    // eslint-disable-next-line no-console
    console.error('[admin login] MongoDB unreachable:', e);
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        error:
          'Login temporarily unavailable — the database is unreachable. ' +
          'Check MONGODB_URI in environment variables and that the host can reach MongoDB Atlas.',
        detail: msg
      },
      { status: 503 }
    );
  }

  if (lock.locked) {
    return NextResponse.json(
      {
        error: `Too many failed attempts. Try again in ${formatRetry(lock.retryAfterSeconds)}.`,
        retryAfterSeconds: lock.retryAfterSeconds
      },
      {
        status: 429,
        headers: { 'Retry-After': String(lock.retryAfterSeconds) }
      }
    );
  }

  // 2. Read body
  let password = '';
  try {
    const body = await req.json();
    password = typeof body?.password === 'string' ? body.password : '';
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ error: 'Password required' }, { status: 400 });
  }

  // 3. Small constant delay to slow online guesses
  await new Promise((r) => setTimeout(r, 250));

  // 4. Compare password
  if (!checkAdminPassword(password)) {
    let updated;
    try {
      updated = await recordFailedAttempt(ipHash);
    } catch {
      updated = { locked: false, retryAfterSeconds: 0, failsInWindow: 0, failsRemaining: 0 };
    }
    if (updated.locked) {
      return NextResponse.json(
        {
          error: `Too many failed attempts. Locked for ${formatRetry(updated.retryAfterSeconds)}.`,
          retryAfterSeconds: updated.retryAfterSeconds
        },
        {
          status: 429,
          headers: { 'Retry-After': String(updated.retryAfterSeconds) }
        }
      );
    }
    return NextResponse.json(
      {
        error: 'Invalid credentials',
        attemptsRemaining: updated.failsRemaining
      },
      { status: 401 }
    );
  }

  // 5. Success: clear failed-attempt record + issue session
  try {
    await clearAttempts(ipHash);
    const token = await createAdminSession();
    await setAdminCookie(token);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to create session';
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
