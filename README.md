# Anonymous BBS - Next.js Minimal Local Implementation

This repository contains a local-only anonymous bulletin board prototype built with Next.js (Pages Router), TypeScript, Tailwind CSS, shadcn/ui, Prisma, and SQLite. It implements the core anonymous flow described in `shiyou.md`: boards, threads, and posts with support for sage, tripcodes, day IDs, and a lightweight rate limiter.

## Prerequisites

- Node.js 18 or newer
- pnpm 8 or newer

## Setup

```bash
pnpm install
pnpm prisma generate
npx prisma db push
node scripts/seed.mjs   # optional seed data
```

## Development Server

```bash
pnpm dev
```

Open http://localhost:3000 to browse the boards, create threads, and post replies.

## Features

- Tailwind plus shadcn/ui styling with Framer Motion transitions
- Boards, threads, and post views rendered with SSR and Prisma
- Thread creation and replies with sage, tripcodes, day IDs, NG word filtering, and in-memory rate limiting
- SWR-based auto refresh (toggle-friendly), Lucide icons, and motion-enhanced lists

## Directory Guide

- `pages/` - Next.js pages and API routes
- `components/ui/` - shadcn/ui-inspired reusable components
- `lib/` - Prisma client, anonymous ID helpers, tripcode generator, rate limiter, NG-word list
- `prisma/` - Prisma schema, migration, and seed scripts
- `styles/` - Tailwind global stylesheet

## Known Trade-offs

- Rate limiting and anonymous IDs are stored in-process for development only
- Tripcode and day ID generation use cookies rather than raw IP or user agent hashing
- Image uploads, CAPTCHA, external OGP previews, and advanced moderation are out of scope
- Moderator endpoints rely on simple token checks and lack full authentication

