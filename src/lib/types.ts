export type SubmissionStatus = 'new' | 'reviewing' | 'published' | 'archived';

export type SubmissionCategory =
  | 'corruption'
  | 'government_official'
  | 'police'
  | 'healthcare'
  | 'education'
  | 'civic'
  | 'land_property'
  | 'women_safety'
  | 'other';

export const CATEGORY_LABELS: Record<SubmissionCategory, { en: string; hi: string }> = {
  corruption: { en: 'Corruption', hi: 'भ्रष्टाचार' },
  government_official: { en: 'Government Official', hi: 'सरकारी अधिकारी' },
  police: { en: 'Police / Law', hi: 'पुलिस / कानून' },
  healthcare: { en: 'Healthcare', hi: 'स्वास्थ्य' },
  education: { en: 'Education', hi: 'शिक्षा' },
  civic: { en: 'Civic Issue (Roads, Water, Electricity)', hi: 'नागरिक समस्या' },
  land_property: { en: 'Land / Property', hi: 'ज़मीन / सम्पत्ति' },
  women_safety: { en: 'Women Safety', hi: 'महिला सुरक्षा' },
  other: { en: 'Other', hi: 'अन्य' }
};

export type CloudinaryResourceType = 'image' | 'video' | 'raw';

export interface ProofFile {
  originalName: string;
  publicId: string; // Cloudinary public_id (e.g. "ryv_proofs/abc123")
  resourceType: CloudinaryResourceType;
  format: string; // jpg, mp4, pdf, …
  size: number;
  mimeType: string;
}

export interface Submission {
  _id?: string;
  ticketId: string; // short human-readable id, e.g. RYV-XYZ123
  name: string;
  phone: string;
  email?: string;
  village: string;
  district: string;
  state: string;
  pincode?: string;
  category: SubmissionCategory;
  subject: string;
  description: string;
  accused?: string; // person/department being accused (optional)
  shareConsent: 'public' | 'anonymous'; // can the YouTuber use the name on social media
  proofs: ProofFile[];
  status: SubmissionStatus;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  ipHash?: string; // optional: hashed IP for spam detection
}
