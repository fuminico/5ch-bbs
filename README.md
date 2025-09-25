# 匿名掲示板 - Next.jsによる最小限のローカル実装

このリポジトリは、Next.js (Pages Router)、TypeScript、Tailwind CSS、shadcn/ui、Prisma、SQLiteで構築された、ローカル専用の匿名掲示板のプロトタイプです。`shiyou.md`に記述されている、板、スレッド、sage、トリップコード、ID、簡易的なレートリミットなどの主要な匿名掲示板のフローを実装しています。

## 前提条件

- Node.js 18以降
- pnpm 8以降

## セットアップ

```bash
pnpm install
pnpm prisma generate
npx prisma db push
node scripts/seed.mjs   # オプションのシードデータ
```

## 開発サーバー

```bash
pnpm dev
```

http://localhost:3000 を開くと、板の閲覧、スレッドの作成、返信の投稿ができます。

## 機能

- Tailwindとshadcn/uiによるスタイリング、Framer Motionによるトランジション
- SSRとPrismaによる板、スレッド、投稿の表示
- sage、トリップコード、ID、NGワードフィルタリング、インメモリのレートリミットを備えたスレッド作成と返信機能
- SWRによる自動更新（切り替え可能）、Lucideアイコン、モーション付きリスト

## ディレクトリガイド

- `pages/` - Next.jsのページとAPIルート
- `components/ui/` - shadcn/uiにインスパイアされた再利用可能なコンポーネント
- `lib/` - Prismaクライアント、匿名IDヘルパー、トリップコードジェネレーター、レートリミッター、NGワードリスト
- `prisma/` - Prismaスキーマ、マイグレーション、シードスクリプト
- `styles/` - Tailwindのグローバルスタイルシート

## 既知のトレードオフ

- レートリミットと匿名IDは開発用にインプロセスで保存されます
- トリップコードとIDの生成には、IPやユーザーエージェントのハッシュ化ではなく、Cookieを使用しています
- 画像のアップロード、CAPTCHA、外部リンクのOGPプレビュー、高度なモデレーション機能は対象外です
- モデレーターエンドポイントは単純なトークンチェックに依存しており、完全な認証機能はありません