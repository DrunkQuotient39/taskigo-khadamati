import { Router } from 'express';
import { firebaseAuthenticate } from '../middleware/firebaseAuth';
import { validate } from '../middleware/security';
import { body } from 'express-validator';
import { isFirebaseStorageConfigured, uploadDataUrlToFirebase } from '../lib/uploads';

// This route accepts a data URL (base64) and returns a temporary URL.
// In production, switch to Firebase Storage/Supabase and store the file persistently.
const router = Router();

router.post('/data-url', firebaseAuthenticate as any, validate([
  body('dataUrl').isString().withMessage('dataUrl required'),
  body('filename').optional().isString(),
  body('contentType').optional().isString(),
]), async (req: any, res: any) => {
  try {
    const { dataUrl, filename, contentType } = req.body;
    if (isFirebaseStorageConfigured()) {
      const url = await uploadDataUrlToFirebase(dataUrl, { folder: 'provider-docs', filename, contentType });
      return res.json({ url });
    }
    // Fallback: echo back data URL (dev only)
    return res.json({ url: dataUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload' });
  }
});

export default router;

