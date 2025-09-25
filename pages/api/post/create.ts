import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { createDayId } from '../../../lib/dayId';
import { parseTrip } from '../../../lib/tripcode';
import { isRateLimited } from '../../../lib/rate-limit';

type Response =
  | { postId: string }
  | { error: string };

const POST_RATE_LIMIT_MS = 5_000;

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { threadId, name, email, body } = req.body ?? {};

  if (!threadId || typeof threadId !== 'string') {
    return res.status(400).json({ error: 'threadId is required' });
  }

  if (!body || typeof body !== 'string' || !body.trim()) {
    return res.status(400).json({ error: '本文は必須です' });
  }

  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    select: { id: true, boardId: true },
  });

  if (!thread) {
    return res.status(404).json({ error: '指定されたスレッドが見つかりませんでした' });
  }

  const identity = createDayId(req);
  const rateLimitKey = `post:${threadId}:${identity.ipHash}`;
  if (isRateLimited(rateLimitKey, 1, POST_RATE_LIMIT_MS)) {
    return res.status(429).json({ error: '書き込み間隔の制限を超えています。少し時間を置いて再度お試しください。' });
  }

  const parsed = typeof name === 'string' ? parseTrip(name) : parseTrip('');
  const safeName = parsed.displayName.slice(0, 32) || '名無し';
  const safeTrip = parsed.trip?.slice(0, 12) ?? null;
  const safeEmail = typeof email === 'string' && email.trim() ? email.trim().slice(0, 128) : null;
  const trimmedBody = body.trim().slice(0, 4000);
  const shouldSage = safeEmail?.toLowerCase() === 'sage';

  try {
    const postId = await prisma.$transaction(async (tx) => {
      const latest = await tx.post.findFirst({
        where: { threadId },
        orderBy: { no: 'desc' },
        select: { no: true },
      });

      const now = new Date();

      const post = await tx.post.create({
        data: {
          threadId,
          no: (latest?.no ?? 0) + 1,
          name: safeName,
          trip: safeTrip,
          email: safeEmail,
          body: trimmedBody,
          dayId: identity.dayId,
          ipHash: identity.ipHash,
          uaHash: identity.uaHash,
          wasSaged: shouldSage,
        },
      });

      await tx.board.update({
        where: { id: thread.boardId },
        data: { activityAt: now },
      });

      if (shouldSage) {
        await tx.thread.update({
          where: { id: threadId },
          data: { updatedAt: now },
        });
      } else {
        await tx.thread.update({
          where: { id: threadId },
          data: { lastBumpedAt: now },
        });
      }

      return post.id;
    });

    return res.status(201).json({ postId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: '投稿に失敗しました' });
  }
}
