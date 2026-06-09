import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { getSubmissionsCollection } from '@/lib/mongodb';
import { fetchUploadedAsset, CLOUDINARY_FOLDER } from '@/lib/cloudinary';
import { generateTicketId } from '@/lib/ticket';
import {
  CATEGORY_LABELS,
  type ProofFile,
  type Submission,
  type SubmissionCategory,
  type CloudinaryResourceType
} from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_PROOFS = 6;
const VALID_RESOURCE_TYPES: CloudinaryResourceType[] = ['image', 'video', 'raw'];

function trim(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

interface ProofInput {
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
  originalName: string;
  mimeType: string;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad('Invalid JSON');
  }

  const name = trim(body.name, 120);
  const phone = trim(body.phone, 16);
  const email = trim(body.email, 160);
  const village = trim(body.village, 120);
  const district = trim(body.district, 120);
  const state = trim(body.state, 80);
  const pincode = trim(body.pincode, 6);
  const category = trim(body.category, 32) as SubmissionCategory;
  const accused = trim(body.accused, 200);
  const subject = trim(body.subject, 160);
  const description = trim(body.description, 4000);
  const shareConsent = trim(body.shareConsent, 16);

  if (!name) return bad('Name is required');
  if (!/^[0-9+\-\s]{7,16}$/.test(phone)) return bad('Valid phone is required');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad('Invalid email');
  if (!village) return bad('Village/Town is required');
  if (!district) return bad('District is required');
  if (!state) return bad('State is required');
  if (pincode && !/^[0-9]{6}$/.test(pincode)) return bad('Pincode must be 6 digits');
  if (!CATEGORY_LABELS[category]) return bad('Invalid category');
  if (!subject) return bad('Subject is required');
  if (description.length < 40) return bad('Description must be at least 40 characters');
  if (shareConsent !== 'public' && shareConsent !== 'anonymous') {
    return bad('Consent is required');
  }

  const proofsIn = Array.isArray(body.proofs) ? (body.proofs as ProofInput[]) : [];
  if (proofsIn.length === 0) return bad('At least one proof file is required');
  if (proofsIn.length > MAX_PROOFS) return bad(`Maximum ${MAX_PROOFS} proof files`);

  // Validate each proof exists in Cloudinary in the expected folder.
  // This blocks fake/external publicIds.
  const verifiedProofs: ProofFile[] = [];
  for (const p of proofsIn) {
    if (typeof p?.publicId !== 'string' || !p.publicId) return bad('Bad proof entry');
    if (!p.publicId.startsWith(`${CLOUDINARY_FOLDER}/`)) {
      return bad('Proof files must be uploaded through this site');
    }
    if (!VALID_RESOURCE_TYPES.includes(p.resourceType as CloudinaryResourceType)) {
      return bad('Bad resource type');
    }

    let asset;
    try {
      asset = await fetchUploadedAsset(
        p.publicId,
        p.resourceType as CloudinaryResourceType
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[submit] cloudinary lookup error', e);
      return NextResponse.json(
        { error: 'Could not verify uploaded files. Try again.' },
        { status: 502 }
      );
    }
    if (!asset) {
      return bad('A proof file could not be verified. Try re-uploading.');
    }

    verifiedProofs.push({
      originalName: trim(p.originalName, 200) || asset.originalFilename || 'proof',
      publicId: asset.publicId,
      resourceType: asset.resourceType,
      format: asset.format,
      size: asset.bytes,
      mimeType: trim(p.mimeType, 100) || 'application/octet-stream'
    });
  }

  const now = new Date();
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '';
  const ipHash = ip
    ? createHash('sha256').update(ip).digest('hex').slice(0, 32)
    : undefined;

  const submission: Submission = {
    ticketId: generateTicketId(),
    name,
    phone,
    email: email || undefined,
    village,
    district,
    state,
    pincode: pincode || undefined,
    category,
    subject,
    description,
    accused: accused || undefined,
    shareConsent: shareConsent as 'public' | 'anonymous',
    proofs: verifiedProofs,
    status: 'new',
    createdAt: now,
    updatedAt: now,
    ipHash
  };

  try {
    const col = await getSubmissionsCollection();
    await col.insertOne(submission as unknown as Record<string, unknown>);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[submit] mongo insert error', e);
    return NextResponse.json({ error: 'Could not save submission' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ticketId: submission.ticketId });
}

function bad(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
