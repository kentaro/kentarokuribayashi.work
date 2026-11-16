# Kentaro Kuribayashi — Profile & Work

栗林健太郎のプロフィールを、日記・制作物サイトから切り出した独立サイトです。
経歴、論文、特許、著書、登壇、取材、公共活動、資格を1ページに全件表示します。折り畳みはありません。

- 仮公開URL: https://kentarokuribayashi.com/kentarokuribayashi.work/
- 独自ドメイン（取得後に接続）: `kentarokuribayashi.work`
- 旧サイト: https://kentarokuribayashi.com/

## 開発と更新

Node.js 24以上を使用します。

```sh
npm ci
npm test
npm run dev
```

`npm test` はサイトをビルドし、原稿の全項目・リンク・期限切れ表記の保持、内部アンカーとアセット、折り畳みがないこと、メタデータを検証します。
`npm run dev` で http://127.0.0.1:4173 を開けます。編集後は `npm run build` で再生成してください。

| ファイル | 役割 |
|---|---|
| `content/profile.md` | 全プロフィールの原稿。このリポジトリが更新元です |
| `scripts/build.mjs` | 章・年代別に構造化し、静的HTMLを生成 |
| `src/template.html` | DADSを基にしたHTMLテンプレート |
| `src/style.css` | PC・スマートフォン・印刷用のレイアウト |
| `public/assets/portrait.jpg` | 本人提供のプロフィール写真 |
| `public/assets/dads/` | 同梱したデジタル庁デザインシステム |
| `site.config.json` | 公開URL、更新日、移行元リビジョン |

実行時JavaScriptとサーバーは不要です。`dist` を任意の静的ホスティングで配信できます。
GitHub Actionsはこのリポジトリだけをcheckoutし、テスト後にGitHub Pagesへ公開します。
旧サイトやObsidianへのビルド時依存・submodule・認証情報はありません。
AIや他のツール向けに `profile.json` と `profile.md` も配信します。

## ドメイン取得後の接続

1. `kentarokuribayashi.work` を取得し、GitHubアカウントのPages設定でドメインを検証します。
2. このリポジトリの Settings → Pages で Custom domain に `kentarokuribayashi.work` を設定します。
3. DNSに次のレコードを設定し、HTTPSの有効化を確認します。

| 種別 | 名前 | 値 |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | kentaro.github.io |

4. `site.config.json` の `url` を `https://kentarokuribayashi.work/` に変更して再公開します。
5. 旧サイトの `src/lib/profile.ts` の `PROFILE_URL` も同じURLへ変更します。

GitHub Actions方式なので `CNAME` ファイルは不要です。ドメイン未取得の段階では、仮URLをcanonicalとして使います。
DNS手順の参照元: [GitHub公式ドキュメント](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

## 移行元と素材

2026-11-16に `kentaro/obsidian` の公開プロフィール `public/profile.md` をリビジョン `53b561a1a45e9b264833132a20562704b4d775d3` から移行しました。
原稿は全件保存し、表示時に「株式会社はてな」の相対リンクを公式URLへ補正し、2件の空リンクに「関連資料」のラベルを補っています。

DADS: `design-system-example-components-html` v20261021、`@digital-go-jp/design-tokens` 2.1.0（MIT）。同梱ライセンスは `public/assets/dads/LICENSE` にあります。
写真は2026-11-16に本人から提供された元画像を使用しています。プロフィール文章・写真の権利はそれぞれの権利者に帰属します。
