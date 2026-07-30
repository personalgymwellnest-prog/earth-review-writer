# EARTH クチコミ下書き作成ツール

体験トレーニングを受けたお客様向けの、Googleクチコミ下書き自動作成サイト。

## できること

1. お客様が簡単なアンケート(コース・きっかけ・良かった点・満足度など)に回答
2. 回答をもとに、テンプレート×ランダム組み合わせで自然な文章を3パターン生成(外部AI APIキー不要)
3. お客様が気に入った文章を選んで編集 → コピー、またはそのままGoogleクチコミ投稿画面へ

すべて「実際にお客様が感じたこと」を文章化する下書きツールであり、事実と異なる内容を生成する機能ではありません(フォーム上にもその旨を明記しています)。

## セットアップ

```bash
npm install
npm run db:push   # SQLite (dev.db) にテーブルを作成
npm run dev
```

`.env` の設定項目:

- `DATABASE_URL` — SQLite ファイルパス(デフォルトのままでOK)
- `ADMIN_PASSWORD` — `/admin` 閲覧用パスワード。本番公開前に変更してください。
- `NEXT_PUBLIC_GOOGLE_REVIEW_URL` — Googleビジネスプロフィールの「クチコミの入力を依頼」から発行される短縮リンク。設定済み(`https://g.page/r/CTEf2Kdk-1l4EAI/review`)。

## 画面

- `/` — お客様向けアンケート・文章生成・コピー導線
- `/admin` — 送信された回答と生成文章の一覧(パスワード保護)

## 本番公開前のチェックリスト

- [x] `NEXT_PUBLIC_GOOGLE_REVIEW_URL` を実際のGoogleクチコミ投稿リンクに差し替える
- [ ] `ADMIN_PASSWORD` を推測されにくい値に変更する
- [ ] トライアル体験後にこのURLをどう配布するか決める(QRコード・LINE・紙のご案内など)

## デプロイ手順(GitHub → Vercel)

このリポジトリはローカルで `git init` 済み・コミット済みです。ご自身の端末(このツールの外)のターミナルで以下を実行してください。

### 1. GitHubにリポジトリを作成してpush

GitHub上で新規リポジトリを作成(例: `earth-review-writer`、Public/Privateどちらでも可、READMEなどは追加しない)してから:

```bash
cd "path\to\新しいフォルダー\earth-review-writer"
git remote add origin https://github.com/<あなたのGitHubユーザー名>/earth-review-writer.git
git branch -M main
git push -u origin main
```

### 2. Vercelでインポート

1. https://vercel.com/new を開き、GitHubアカウントでログイン
2. 先ほどpushした `earth-review-writer` リポジトリを選択して「Import」
3. Framework Preset は自動で "Next.js" になります。そのままでOK
4. 「Environment Variables」に以下を追加してから「Deploy」:

| Key | Value |
|---|---|
| `ADMIN_PASSWORD` | 本番用の推測されにくいパスワード |
| `NEXT_PUBLIC_GOOGLE_REVIEW_URL` | `https://g.page/r/CTEf2Kdk-1l4EAI/review` |
| `NEXT_PUBLIC_SITE_URL` | デプロイ後に割り当てられるURL(例: `https://earth-review-writer.vercel.app`。一度デプロイしてURLが分かってから設定→再デプロイでもOK) |

### 3. データベースについて(重要)

ローカルではSQLiteファイル(`dev.db`)にアンケート回答を保存していますが、**Vercelのようなサーバーレス環境ではファイルへの書き込みが保存されません**。そのため何もしないと `/admin` に履歴が残らなくなります(アンケート回答→文章生成自体は影響なく動きます)。

`/admin` の履歴を本番でも使いたい場合は、無料のTurso(SQLite互換のクラウドDB)を使うと最小の変更で対応できます:

1. https://turso.tech で無料アカウント作成 → データベースを1つ作成
2. `turso db show <db名> --url` と `turso db tokens create <db名>` でURLとトークンを取得
3. Vercelの環境変数に追加: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
4. 再デプロイ

不要であれば(履歴を見なくてよい場合)、この手順は飛ばして問題ありません。
