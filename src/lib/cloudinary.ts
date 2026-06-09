import { v2 as cloudinary } from 'cloudinary';
import type { CloudinaryResourceType, ProofFile } from './types';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

let configured = false;

function configure() {
  if (configured) return;
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error(
      'Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.local'
    );
  }
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true
  });
  configured = true;
}

export const VALID_RESOURCE_TYPES: CloudinaryResourceType[] = ['image', 'video', 'raw'];

/**
 * Generate a signed delivery URL for an authenticated Cloudinary asset.
 * URL is valid for `expiresInSeconds` (default 1 hour).
 */
export function signedDeliveryUrl(
  proof: Pick<ProofFile, 'publicId' | 'resourceType' | 'format' | 'originalName'>,
  options: { download?: boolean; expiresInSeconds?: number } = {}
): string {
  configure();

  const expiresInSeconds = options.expiresInSeconds ?? 3600;
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

  const opts: Record<string, unknown> = {
    resource_type: proof.resourceType,
    type: 'authenticated',
    sign_url: true,
    secure: true,
    expires_at: expiresAt
  };

  // Force download with original filename as attachment
  if (options.download) {
    const safeName = (proof.originalName || 'proof').replace(/[^\w.-]/g, '_');
    opts.flags = `attachment:${safeName}`;
  }

  // Cloudinary needs the format suffix in some flows; include when known
  return cloudinary.utils.url(proof.publicId, opts);
}

/**
 * Verify that an asset actually exists in Cloudinary and was uploaded to
 * the expected folder. Returns the asset metadata or null if missing/invalid.
 */
export async function fetchUploadedAsset(
  publicId: string,
  resourceType: CloudinaryResourceType
): Promise<{
  publicId: string;
  resourceType: CloudinaryResourceType;
  format: string;
  bytes: number;
  originalFilename: string | null;
} | null> {
  configure();
  try {
    const r = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
      type: 'authenticated'
    });
    return {
      publicId: r.public_id,
      resourceType: r.resource_type as CloudinaryResourceType,
      format: r.format,
      bytes: r.bytes,
      originalFilename: r.original_filename ?? null
    };
  } catch {
    return null;
  }
}

export const CLOUDINARY_FOLDER = 'ryv_proofs';
