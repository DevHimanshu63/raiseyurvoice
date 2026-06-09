import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { isAdmin } from '@/lib/auth';
import { getSubmissionsCollection } from '@/lib/mongodb';
import type { SubmissionStatus } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_STATUS: SubmissionStatus[] = ['new', 'reviewing', 'published', 'archived'];

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let id: ObjectId;
  try {
    id = new ObjectId(params.id);
  } catch {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  let body: { status?: SubmissionStatus; adminNotes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 });
  }

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (body.status) {
    if (!VALID_STATUS.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    update.status = body.status;
  }
  if (typeof body.adminNotes === 'string') {
    update.adminNotes = body.adminNotes.slice(0, 2000);
  }

  const col = await getSubmissionsCollection();
  const result = await col.updateOne({ _id: id }, { $set: update });

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
