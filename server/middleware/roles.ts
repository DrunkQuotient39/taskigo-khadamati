import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';

export interface ClaimsRequest extends Request {
	user?: admin.auth.DecodedIdToken;
}

export const requireAuth = async (req: ClaimsRequest, res: Response, next: NextFunction) => {
	try {
		const header = req.headers.authorization || '';
		const token = header.startsWith('Bearer ') ? header.slice(7) : null;
		if (!token) return res.status(401).json({ error: 'Missing token' });
		const decoded = await admin.auth().verifyIdToken(token, true);
		(req as any).user = decoded;
		return next();
	} catch (e) {
		return res.status(401).json({ error: 'Invalid token' });
	}
};

export const requireAdmin = async (req: ClaimsRequest, res: Response, next: NextFunction) => {
	const u = (req as any).user as admin.auth.DecodedIdToken | undefined;
	if (!u) return res.status(401).end();
	const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
	const isAdminEmail = !!adminEmail && (u.email || '').toLowerCase() === adminEmail;
	if (!isAdminEmail) return res.status(403).end();
	try {
		if (!(u as any).admin) {
			await admin.auth().setCustomUserClaims(u.uid, { ...(u as any), admin: true });
		}
		return next();
	} catch {
		return res.status(500).json({ error: 'Failed to assert admin claim' });
	}
};

export const requireProvider = (req: ClaimsRequest, res: Response, next: NextFunction) => {
	const u = (req as any).user as admin.auth.DecodedIdToken | undefined;
	if (u && (u as any).provider) return next();
	return res.status(403).json({ error: 'Provider privileges required' });
};




