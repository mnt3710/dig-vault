# CLAUDE.md — Dig Vault

## アプリ概要

**Dig Vault** は、リサイクルショップ「dig」向けの商品判定 + クローゼット管理アプリです。
カメラで撮影した商品画像を Gemini Vision API に送り、購入判定（GRAB / BUY / HOLD / PASS / TRY）を返します。

---

## 技術スタック

| レイヤー     | 技術                                      |
| ------------ | ----------------------------------------- |
| Web フロント | Next.js 14+（App Router）+ TypeScript     |
| Native       | React Native（Phase 2 以降）              |
| AI           | Google Gemini Vision API                  |
| DB           | Firebase Firestore                        |
| 画像ストレージ | Firebase Storage                         |
| 認証         | Firebase Authentication                   |
| 地図         | Google Maps API                           |
| スタイリング | Tailwind CSS                              |
| パッケージ管理 | pnpm                                    |

---

## Phase 1 スコープ

- [ ] Gemini Vision API へ画像を送り判定を返す API Route の実装
- [ ] 画像アップロード UI（ドラッグ＆ドロップ / カメラ撮影）
- [ ] 判定結果の表示（GRAB / BUY / HOLD / PASS / TRY）
- [ ] Firebase Authentication によるログイン/ログアウト
- [ ] 判定履歴の Firestore 保存と一覧表示

---

## ディレクトリ構成

```
dig-vault/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 認証が必要なルートグループ
│   │   ├── closet/               # クローゼット管理ページ
│   │   │   └── page.tsx
│   │   └── history/              # 判定履歴ページ
│   │       └── page.tsx
│   ├── (public)/                 # 認証不要のルートグループ
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── page.tsx              # トップページ（判定UI）
│   ├── api/
│   │   └── judge/
│   │       └── route.ts          # Gemini Vision API 呼び出し
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                       # 汎用UIコンポーネント（Button, Card など）
│   ├── judge/                    # 判定機能関連コンポーネント
│   │   ├── ImageUploader.tsx
│   │   ├── JudgeResult.tsx
│   │   └── JudgeResultBadge.tsx
│   ├── closet/                   # クローゼット関連コンポーネント
│   └── layout/                   # Header, Footer など共通レイアウト
│
├── hooks/                        # カスタムフック
│   ├── useAuth.ts
│   ├── useJudge.ts
│   └── useFirestore.ts
│
├── lib/                          # ライブラリ初期化・ユーティリティ
│   ├── firebase/
│   │   ├── client.ts             # Firebase クライアント初期化
│   │   ├── server.ts             # Firebase Admin SDK 初期化
│   │   ├── auth.ts               # 認証ヘルパー
│   │   ├── firestore.ts          # Firestore CRUD ヘルパー
│   │   └── storage.ts            # Storage アップロードヘルパー
│   ├── gemini/
│   │   └── client.ts             # Gemini API クライアント初期化
│   └── utils.ts                  # 汎用ユーティリティ
│
├── types/                        # 型定義
│   ├── judge.ts                  # 判定結果の型
│   ├── item.ts                   # 商品・クローゼットアイテムの型
│   └── user.ts                   # ユーザー型
│
├── constants/                    # 定数
│   └── judge.ts                  # 判定ラベル・カラー定義
│
├── .env.local                    # ローカル環境変数（git 管理外）
├── .env.example                  # 環境変数テンプレート（git 管理対象）
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── CLAUDE.md
```

---

## コーディング規約

### TypeScript

- `strict: true` を維持する。`any` は原則禁止（やむを得ない場合は `// eslint-disable-next-line @typescript-eslint/no-explicit-any` + 理由コメントを付ける）
- 型定義は `interface` より `type` を優先する（Union Type が多いため）
- `as` キャストは避け、型ガード関数を使う
- 非同期処理は `async/await` を使い、`Promise` チェーンは書かない
- エラーハンドリングは `try/catch` で行い、エラーを握りつぶさない

```ts
// ✅ Good
type JudgeVerdict = "GRAB" | "BUY" | "HOLD" | "PASS" | "TRY";

// ❌ Bad
const result: any = await fetchJudge();
```

### 命名規則

| 対象                     | 規則                          | 例                          |
| ------------------------ | ----------------------------- | --------------------------- |
| コンポーネント           | PascalCase                    | `JudgeResult.tsx`           |
| カスタムフック           | camelCase + `use` プレフィックス | `useJudge.ts`            |
| 通常の関数・変数         | camelCase                     | `uploadImage`, `judgeResult` |
| 型・インターフェース     | PascalCase                    | `JudgeVerdict`, `ItemType`  |
| 定数                     | UPPER_SNAKE_CASE              | `MAX_IMAGE_SIZE_MB`         |
| Firestore コレクション名 | camelCase（複数形）           | `judgeHistories`, `items`   |
| 環境変数                 | UPPER_SNAKE_CASE + プレフィックス | `NEXT_PUBLIC_FIREBASE_API_KEY` |

### ファイル・フォルダ命名

- コンポーネントファイル：PascalCase（`ImageUploader.tsx`）
- それ以外のファイル：camelCase（`useJudge.ts`, `firestore.ts`）
- フォルダ：kebab-case（`judge-history/`）または camelCase（`lib/firebase/`）

---

## コンポーネント設計方針

### 基本原則

- **Server Component をデフォルトとする**。`useState` / `useEffect` / イベントハンドラが必要な場合のみ `"use client"` を付与する
- コンポーネントは単一責任の原則に従い、1 ファイルにつき 1 コンポーネントを基本とする
- Props の型は同じファイル内に `type Props = { ... }` として定義する
- ロジックはカスタムフック（`hooks/`）に切り出し、コンポーネントは UI に専念する

### コンポーネント分類

```
components/ui/        → ドメイン知識を持たない汎用UIパーツ（Button, Badge, Card, Modal）
components/judge/     → 判定機能に特化したコンポーネント
components/closet/    → クローゼット機能に特化したコンポーネント
components/layout/    → ページ共通のレイアウトパーツ
```

### Server / Client の判断基準

```
Server Component    → データフェッチ、静的表示、Firestore 読み取り（サーバーサイド）
Client Component    → ファイルアップロード、リアルタイム更新、ユーザー操作
```

---

## Firebase 連携方針

### 初期化

- クライアントサイドの Firebase は `lib/firebase/client.ts` で一度だけ初期化し、シングルトンとして export する
- サーバーサイド（API Route / Server Component）では `lib/firebase/server.ts` の Firebase Admin SDK を使う
- 環境を跨いだ誤用を防ぐため、`client.ts` と `server.ts` は明確に分離する

```ts
// lib/firebase/client.ts
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = { ... };

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
```

### Firestore

- CRUD 操作は `lib/firebase/firestore.ts` にヘルパー関数としてまとめ、コンポーネントから直接 SDK を呼ばない
- コレクション名は `constants/` で文字列定数として管理する（タイポ防止）
- ドキュメントの型は `types/` で定義し、`withConverter` を使って型安全を保つ

### Storage

- 画像アップロードは `lib/firebase/storage.ts` の `uploadImage()` ヘルパーを経由する
- アップロードパス：`users/{uid}/items/{itemId}/{filename}`
- 最大ファイルサイズ：5MB（クライアントサイドでバリデーション）
- 許可する MIME タイプ：`image/jpeg`, `image/png`, `image/webp`

### Authentication

- 認証状態は `hooks/useAuth.ts` で管理し、`AuthContext` で全体に配布する
- 未認証ユーザーの保護ルートへのアクセスは `middleware.ts` でリダイレクトする
- Google / メールリンク認証を Phase 1 でサポートする

---

## Gemini Vision API 連携方針

### API Route

- Gemini への呼び出しは必ず **サーバーサイド**（`app/api/judge/route.ts`）で行う（API キーをクライアントに露出させない）
- リクエスト：`multipart/form-data` で画像を受け取り、Base64 エンコードして Gemini に送る
- レスポンス：判定結果（verdict + reason）を JSON で返す

```ts
// app/api/judge/route.ts のレスポンス型
type JudgeResponse = {
  verdict: "GRAB" | "BUY" | "HOLD" | "PASS" | "TRY";
  reason: string;
  confidence: number; // 0.0 ~ 1.0
};
```

### プロンプト管理

- Gemini に渡すシステムプロンプトは `lib/gemini/prompts.ts` に定数として切り出す
- プロンプトのバージョン管理を行い、変更時はコメントで変更理由を残す

### エラーハンドリング

- Gemini API のタイムアウトは 30 秒に設定する
- レート制限エラー（429）は `503` に変換してクライアントに返す
- 不明な判定結果が返ってきた場合は `HOLD` にフォールバックする

---

## 環境変数の管理方針

### ファイル

| ファイル         | 用途                                | git 管理 |
| ---------------- | ----------------------------------- | -------- |
| `.env.local`     | ローカル開発用の実際の値            | ❌ 除外  |
| `.env.example`   | 必要な変数名とダミー値のテンプレート | ✅ 含める |
| `.env.production` | 本番環境（Vercel の環境変数で管理） | ❌ 除外  |

### 変数一覧

```bash
# .env.example

# Firebase（クライアントサイド：NEXT_PUBLIC_ プレフィックス必須）
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK（サーバーサイドのみ：NEXT_PUBLIC_ 不要）
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Gemini API（サーバーサイドのみ）
GEMINI_API_KEY=your_gemini_api_key

# Google Maps（クライアントサイド）
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

### ルール

- `NEXT_PUBLIC_` プレフィックスはクライアントバンドルに含まれる。**秘密情報には絶対に付けない**
- 環境変数が未定義の場合はアプリ起動時に `throw new Error(...)` で早期に失敗させる
- 型安全な環境変数アクセスのため `lib/env.ts` に検証済みの変数をまとめて export する

```ts
// lib/env.ts
export const env = {
  geminiApiKey: process.env.GEMINI_API_KEY ?? (() => { throw new Error("GEMINI_API_KEY is not set"); })(),
  firebase: {
    adminProjectId: process.env.FIREBASE_ADMIN_PROJECT_ID ?? (() => { throw new Error("FIREBASE_ADMIN_PROJECT_ID is not set"); })(),
    // ...
  },
} as const;
```

---

## Git ブランチ戦略

```
main          → 本番リリース済みコード
develop       → 統合ブランチ
feature/*     → 機能開発（例：feature/gemini-judge-api）
fix/*         → バグ修正
chore/*       → 設定・依存関係の更新
```

コミットメッセージは [Conventional Commits](https://www.conventionalcommits.org/) に従う：

```
feat: Gemini Vision API による判定エンドポイントを追加
fix: 画像アップロード時のファイルサイズバリデーションを修正
chore: Firebase SDK を v10 にアップグレード
```
