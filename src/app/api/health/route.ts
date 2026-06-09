import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Diagnostic endpoint — visit /api/health after deploy to confirm:
 *   - all required env vars are set
 *   - MongoDB is reachable
 *   - Cloudinary public config is present (server-only secrets are NOT echoed)
 *
 * Safe to leave enabled in production: nothing sensitive is returned.
 */
export async function GET() {
  const env = {
    MONGODB_URI: present(process.env.MONGODB_URI),
    MONGODB_DB: process.env.MONGODB_DB || null,
    ADMIN_PASSWORD: present(process.env.ADMIN_PASSWORD),
    ADMIN_JWT_SECRET: present(process.env.ADMIN_JWT_SECRET),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || null,
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET:
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || null,
    CLOUDINARY_API_KEY: present(process.env.CLOUDINARY_API_KEY),
    CLOUDINARY_API_SECRET: present(process.env.CLOUDINARY_API_SECRET)
  };

  let mongo: { ok: boolean; error?: string } = { ok: false };
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    mongo = { ok: true };
  } catch (e) {
    mongo = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  const ok = mongo.ok && Object.values(env).every((v) => v !== null && v !== false);

  return NextResponse.json(
    { ok, env, mongo, time: new Date().toISOString() },
    { status: ok ? 200 : 503 }
  );
}

function present(v: string | undefined): boolean {
  return Boolean(v && v.length > 0);
}
