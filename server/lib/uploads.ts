import admin from 'firebase-admin';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12);

export function isFirebaseStorageConfigured(): boolean {
  try {
    const bucket = admin.storage?.().bucket?.();
    return !!bucket?.name;
  } catch {
    return false;
  }
}

export function parseDataUrl(dataUrl: string): { contentType: string; buffer: Buffer } {
  const match = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  if (!match) throw new Error('Invalid data URL');
  const contentType = match[1];
  const base64 = match[2];
  const buffer = Buffer.from(base64, 'base64');
  return { contentType, buffer };
}

export async function uploadDataUrlToFirebase(dataUrl: string, options?: { folder?: string; filename?: string; contentType?: string }): Promise<string> {
  const bucket = admin.storage().bucket();
  const { contentType, buffer } = parseDataUrl(dataUrl);
  const safeFolder = (options?.folder || 'uploads').replace(/[^a-zA-Z0-9/_-]/g, '');
  const name = options?.filename || `${Date.now()}_${nanoid()}`;
  const filePath = `${safeFolder}/${name}`;
  const file = bucket.file(filePath);

  await file.save(buffer, {
    contentType: options?.contentType || contentType,
    resumable: false,
    public: false,
    metadata: { cacheControl: 'public, max-age=31536000' },
  });

  // Try to make public; if not allowed, issue a signed URL
  try {
    await file.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
  } catch {
    const [signedUrl] = await file.getSignedUrl({ action: 'read', expires: Date.now() + 365 * 24 * 60 * 60 * 1000 });
    return signedUrl;
  }
}

