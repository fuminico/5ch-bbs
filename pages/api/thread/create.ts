import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { createDayId } from '../../../lib/dayId';
import { parseTrip } from '../../../lib/tripcode';
import { isRateLimited } from '../../../lib/rate-limit';

type Response =
  | { threadId: string }
  | { error: string };

const THREAD_RATE_LIMIT_MS = 60_000;

export default async function handler(req: NextApiRequest, res: NextApiResponse<Response>) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { boardId, title, body, name, email } = req.body ?? {};

  if (!boardId || typeof boardId !== 'string') {
    return res.status(400).json({ error: 'boardId is required' });
  }

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'タイトルは必須です' });
  }

  if (!body || typeof body !== 'string' || !body.trim()) {
    return res.status(400).json({ error: '本文は必須です' });
  }

  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) {
    return res.status(404).json({ error: '指定した板が見つかりませんでした' });
  }

  const identity = createDayId(req);
  const rateLimitKey = `thread:${boardId}:${identity.ipHash}`;
  if (isRateLimited(rateLimitKey, 1, THREAD_RATE_LIMIT_MS)) {
    return res
      .status(429)
      .json({ error: 'スレ立て間隔の制限を超えています。少し時間を置いて再度お試しください。' });
  }

  const userName = typeof name === 'string' ? name : '';
  const { displayName, trip } = parseTrip(userName);
  const safeName = displayName.slice(0, 32) || '名無し';
  const safeTrip = trip?.slice(0, 12) ?? null;
  const safeEmail = typeof email === 'string' && email.trim() ? email.trim().slice(0, 128) : null;
  const trimmedTitle = title.trim().slice(0, 120);
  const trimmedBody = body.trim().slice(0, 4000);
  const shouldSage = safeEmail?.toLowerCase() === 'sage';
  const now = new Date();

  try {
    const threadId = await prisma.$transaction(async (tx) => {
      const thread = await tx.thread.create({
        data: {
          boardId: board.id,
          title: trimmedTitle,
          body: trimmedBody,
          authorName: safeName,
          authorTrip: safeTrip,
          authorEmail: safeEmail,
          lastBumpedAt: now,
        },
      });

      await tx.post.create({
        data: {
          threadId: thread.id,
          no: 1,
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
        where: { id: board.id },
        data: { activityAt: now },
      });

      return thread.id;
    });

    return res.status(201).json({ threadId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'スレッドの作成に失敗しました' });
  }
}
