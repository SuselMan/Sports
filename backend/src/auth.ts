import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { env } from './env';
import { UserModel } from './models/User';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export async function verifyGoogleIdToken(idToken: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email) {
    throw new Error('Invalid Google token payload');
  }
  return {
    googleId: payload.sub,
    email: payload.email,
    displayName: payload.name,
  };
}

export function signJwt(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '30d' });
}

export async function googleAuthHandler(req: Request, res: Response) {
  try {
    const { idToken } = req.body as { idToken?: string };
    if (!idToken) return res.status(400).json({ error: 'Missing idToken' });
    const profile = await verifyGoogleIdToken(idToken);
    let user = await UserModel.findOne({ googleId: profile.googleId });
    if (!user) {
      user = await UserModel.create({
        googleId: profile.googleId,
        email: profile.email,
        displayName: profile.displayName,
      });
    }
    const token = signJwt(String(user._id));
    return res.json({ token });
  } catch (e: any) {
    return res.status(401).json({ error: e.message || 'Unauthorized' });
  }
}

export interface AuthedRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing Authorization header' });
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Invalid Authorization header' });
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    req.userId = decoded.sub;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
