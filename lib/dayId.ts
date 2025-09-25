import crypto from 'crypto';
import type { NextApiRequest } from 'next';

const FALLBACK_REMOTE = '127.0.0.1';

export function extractRemoteIp(req: NextApiRequest): string {
  const header = (req.headers['x-forwarded-for'] || req.headers['x-real-ip']) as string | undefined;
  if (header) {
    const candidate = header.split(',')[0]?.trim();
    if (candidate) {
      return candidate;
    }
  }

  return req.socket.remoteAddress ?? FALLBACK_REMOTE;
}

export function createDayId(req: NextApiRequest): { dayId: string; ipHash: string; uaHash: string } {
  const ip = extractRemoteIp(req);
  const ua = req.headers['user-agent'] ?? 'unknown';
  const dayKey = new Date().toISOString().slice(0, 10);

  const dayId = crypto
    .createHash('sha256')
    .update(`${ip}|${ua}|${dayKey}`)
    .digest('hex')
    .slice(0, 8)
    .toUpperCase();

  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32);
  const uaHash = crypto.createHash('sha256').update(ua).digest('hex').slice(0, 32);

  return { dayId, ipHash, uaHash };
}
