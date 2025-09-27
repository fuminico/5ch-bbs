# 匿名掲示板 (Anonymous BBS)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffuminico%2F5ch-bbs)

これは、Next.js, Prisma, Supabase (PostgreSQL) を使用して構築された、高機能な匿名掲示板のプロトタイプです。クラシックなテキスト掲示板の体験を、モダンな技術スタックで再現することを目指しています。

[ここにデプロイしたアプリケーションのスクリーンショットを挿入]

---

## 機能要件 (Features)

本プロジェクトは、以下の主要な匿名掲示板の機能を実装しています。

-   **掲示板 (Boards)**: カテゴリ分けされた複数の掲示板を作成・閲覧できます。
-   **スレッド (Threads)**: 各掲示板内で、ユーザーが新しい議論のトピック（スレッド）を立てることができます。
-   **投稿 (Posts)**: 既存のスレッドに対して、匿名で返信（レス）を投稿できます。
-   **トリップコード (Tripcodes)**: `名前#password` の形式で名前を入力すると、ユニークなID（トリップ）が生成され、固定のハンドルネームとして利用できます。
-   **sage機能**: メール欄に `sage` と入力して投稿すると、スレッドの順位を上げずに返信できます。
-   **日替わりID (Daily IDs)**: 投稿者には、IPアドレスとユーザーエージェントに基づいた、24時間ごとにリセットされる匿名IDが自動で割り当てられます。
-   **レートリミット**: スレッドの乱立を防ぐため、同一IDからのスレッド作成には時間間隔の制限が設けられています。

## 技術スタック (Tech Stack)

-   **フレームワーク**: [Next.js](https://nextjs.org/) (Pages Router)
-   **言語**: [TypeScript](https://www.typescriptlang.org/)
-   **UI**: [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
-   **ORM**: [Prisma](https://www.prisma.io/)
-   **データベース**: [PostgreSQL](https://www.postgresql.org/) (開発・本番環境ともに[Supabase](https://supabase.com/)を推奨)
-   **デプロイ**: [Vercel](https://vercel.com/)

## システム構成

このアプリケーションは、Next.jsのAPIルートをバックエンドとして使用するフルスタック構成です。

-   **クライアントサイド**: Next.js (React) がUIのレンダリングを担当します。ページの表示はSSR (Server-Side Rendering) で行われ、高速な初期表示を実現しています。
-   **サーバーサイド**: Next.jsのAPIルート (`pages/api/*`) が、スレッド作成や投稿などのリクエストを処理します。
-   **データベース**: Prisma ORMを介してPostgreSQLデータベースと通信します。データの一貫性と型安全性が保証されています。

---

## 開発環境の構築 (Getting Started)

他の開発者がこのプロジェクトをセットアップするための手順です。

### 1. 前提条件 (Prerequisites)

-   [Node.js](https://nodejs.org/en/) (v18.x 以降)
-   [pnpm](https://pnpm.io/installation) (v8.x 以降)
-   [Git](https://git-scm.com/)
-   [Supabase](https://supabase.com/) アカウント (または任意のPostgreSQLデータベース)

### 2. インストールとセットアップ

1.  **リポジトリをクローンします。**
    ```bash
    git clone https://github.com/fuminico/5ch-bbs.git
    cd 5ch-bbs
    ```

2.  **依存関係をインストールします。**
    ```bash
    pnpm install
    ```

3.  **データベースをセットアップします。**
    -   Supabaseで新しいプロジェクトを作成します。
    -   プロジェクトの `Settings` > `Database` に移動し、**Connection Pooling**用の接続文字列（URI）をコピーします。
    -   プロジェクトのルートに `.env` ファイルを作成します（`.env.example` を参考にしてください）。
    -   コピーした接続文字列を `DATABASE_URL` として `.env` ファイルに貼り付けます。
      ```.env
      DATABASE_URL="postgresql://..."
      ```

4.  **データベーススキーマを適用します。**
    以下のコマンドを実行して、Supabaseデータベースにテーブルを作成します。
    ```bash
    pnpm exec prisma migrate deploy
    ```

5.  **(任意) 初期データを投入します。**
    デモ用の掲示板やスレッドを作成するには、SupabaseのSQL Editorから直接SQLを実行するか、ローカルのシードスクリプトを修正・実行してください。
    ```bash
    pnpm run prisma:seed
    ```

6.  **開発サーバーを起動します。**
    ```bash
    pnpm run dev
    ```
    ブラウザで `http://localhost:3000` を開くと、アプリケーションが表示されます。

## 主要なコマンド (Available Scripts)

-   `pnpm dev`: 開発サーバーを起動します。
-   `pnpm build`: 本番用にアプリケーションをビルドします。
-   `pnpm start`: ビルドされたアプリケーションを起動します。
-   `pnpm lint`: コードの静的解析を実行します。
-   `pnpm prisma:generate`: Prisma Clientを生成・更新します。
-   `pnpm prisma:migrate`: 開発用のマイグレーションを作成します。

## デプロイ (Deployment)

このプロジェクトはVercelへのデプロイに最適化されています。

1.  リポジトリをGitHubにプッシュします。
2.  Vercelで新しいプロジェクトを作成し、GitHubリポジトリをインポートします。
3.  **環境変数を設定します。**
    -   Vercelのプロジェクト設定で、`DATABASE_URL` という名前の環境変数を追加します。
    -   値には、Supabaseの**Connection Pooling**用接続文字列を貼り付けます。
    -   **重要**: 接続文字列の末尾に、必ず `&pgbouncer=true` を追加してください。これにより、サーバーレス環境での接続が安定します。
      ```
      postgresql://...?sslmode=require&pgbouncer=true
      ```
4.  「Deploy」ボタンを押すと、ビルドとデプロイが自動的に開始されます。
