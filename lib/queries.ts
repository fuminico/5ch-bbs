import { prisma } from './prisma';

export type BoardSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  threads: number;
  activityAt: Date;
};

export async function listBoards(): Promise<BoardSummary[]> {
  const boards = await prisma.board.findMany({
    orderBy: { activityAt: 'desc' },
    include: {
      _count: { select: { threads: true } },
    },
  });

  return boards.map((board) => ({
    id: board.id,
    slug: board.slug,
    title: board.title,
    description: board.description,
    threads: board._count.threads,
    activityAt: board.activityAt,
  }));
}

export type ThreadSummary = {
  id: string;
  title: string;
  replies: number;
  lastBumpedAt: Date;
};

export type BoardDetail = {
  board: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
  };
  threads: ThreadSummary[];
};

export async function listThreads(boardId: string, limit = 100): Promise<ThreadSummary[]> {
  const threads = await prisma.thread.findMany({
    where: { boardId },
    orderBy: { lastBumpedAt: 'desc' },
    take: limit,
    include: {
      _count: { select: { posts: true } },
    },
  });

  return threads.map((thread) => ({
    id: thread.id,
    title: thread.title,
    replies: thread._count.posts,
    lastBumpedAt: thread.lastBumpedAt,
  }));
}

export async function getBoardWithThreads(slug: string, limit = 100): Promise<BoardDetail | null> {
  const board = await prisma.board.findUnique({
    where: { slug },
    include: {
      threads: {
        orderBy: { lastBumpedAt: 'desc' },
        take: limit,
        include: {
          _count: { select: { posts: true } },
        },
      },
    },
  });

  if (!board) {
    return null;
  }

  return {
    board: {
      id: board.id,
      slug: board.slug,
      title: board.title,
      description: board.description,
    },
    threads: board.threads.map((thread) => ({
      id: thread.id,
      title: thread.title,
      replies: thread._count.posts,
      lastBumpedAt: thread.lastBumpedAt,
    })),
  };
}

export type PostView = {
  id: string;
  no: number;
  name: string;
  trip: string | null;
  email: string | null;
  body: string;
  dayId: string;
  createdAt: Date;
  wasSaged: boolean;
};

export type ThreadDetail = {
  thread: {
    id: string;
    title: string;
    boardId: string;
    boardSlug: string;
    boardTitle: string;
  };
  posts: PostView[];
};

export async function getThreadWithPosts(threadId: string): Promise<ThreadDetail | null> {
  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    include: {
      board: { select: { id: true, slug: true, title: true } },
      posts: {
        orderBy: { no: 'asc' },
      },
    },
  });

  if (!thread) {
    return null;
  }

  return {
    thread: {
      id: thread.id,
      title: thread.title,
      boardId: thread.board.id,
      boardSlug: thread.board.slug,
      boardTitle: thread.board.title,
    },
    posts: thread.posts.map((post) => ({
      id: post.id,
      no: post.no,
      name: post.name,
      trip: post.trip,
      email: post.email,
      body: post.body,
      dayId: post.dayId,
      createdAt: post.createdAt,
      wasSaged: post.wasSaged,
    })),
  };
}
