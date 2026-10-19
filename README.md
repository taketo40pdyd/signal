# Signal｜HLSチャンネルプレーヤー

ネット配信（HLS）を、テレビのようにチャンネル切り替えで再生するブラウザ向けプレーヤーです。
ビルド不要の静的サイトなので、そのまま GitHub Pages で公開できます。

## ファイル構成

| ファイル | 役割 |
| --- | --- |
| `index.html` | アプリ本体（HTML・CSS・JavaScriptが1ファイル） |
| `manifest.webmanifest` | ホーム画面に追加するための設定 |
| `sw.js` | Service Worker（アプリ本体のキャッシュ） |
| `icons/` | アプリのアイコン（192 / 512 / マスカブル / Apple用） |
| `og-image.png` | SNSで共有したときのプレビュー画像（1200×630） |
| `404.html` | ページが見つからないときの表示 |
| `robots.txt` | 検索エンジン向けの設定 |
| `.nojekyll` | GitHub PagesでJekyll処理を使わない印 |

## 公開の手順

1. GitHubで新しいリポジトリを作り、このフォルダの中身を**すべて**（`.nojekyll` も含めて）アップロードします。
2. リポジトリの **Settings → Pages** を開きます。
3. **Source** を「Deploy from a branch」、**Branch** を `main` / `(root)` にして Save します。
4. 数分後、`https://ユーザー名.github.io/リポジトリ名/` で公開されます。

## 公開前に必ずやること

### 1. サイトのURLを置き換える

`index.html` の `canonical`・`og:url`・`og:image`・`twitter:image`・JSON-LD には、仮のURL
`https://YOUR-USERNAME.github.io/YOUR-REPO/` が入っています。自分のURLに置き換えてください。

```sh
sed -i 's#https://YOUR-USERNAME.github.io/YOUR-REPO/#https://ユーザー名.github.io/リポジトリ名/#g' index.html
```

（macOS の場合は `sed -i ''` にしてください。）

### 2. Firebaseの設定を確認する

`index.html` の先頭近くにある `FIREBASE_CONFIG` で、ログインと端末間の同期を使っています。

- **承認済みドメインを追加する:** Firebaseコンソール →「Authentication」→「設定」→「承認済みドメイン」に
  `ユーザー名.github.io` を追加します。これがないと、公開後にGoogleログインやメールログインが失敗します。
- **APIキーの扱い:** Firebaseのウェブ用APIキーは、公開されること自体は想定された設計です。
  そのうえで、Google Cloudコンソールの「認証情報」で、キーのHTTPリファラーを
  `https://ユーザー名.github.io/*` に制限してください。
- **Firestoreのルール:** ログイン中のユーザーが自分のデータだけを読み書きできるルールになっているか確認してください。
- Firebaseを使わない場合は、`apiKey` を空にすると端末内のパスコードロックだけで動きます。

### 3. 配信URLの権利を確認する

このアプリは、`index.html` 内に書かれた配信URLを再生します。公開するURLは、
**再配信・組み込みが許諾されているものだけ**にしてください。

この公開用の `index.html` では、元のファイルにあった次の5局を**取り除いてあります**。
公式の配信ではない転送サービス（`mov3.co`）のURLで、権利関係を確認できなかったためです。

- NHK総合（東京）／ テレビ朝日 ／ TBSテレビ ／ テレビ東京 ／ フジテレビ

残っているのは、NHK WORLD-JAPAN、DW、QVC、ショップチャンネル、楽天TV系などの配信です。
これらも、公開するリポジトリに載せてよいかを、各配信元の利用条件で確認してください。
ユーザー自身がM3Uを追加する機能は、そのまま使えます（追加分は各自のブラウザにだけ保存されます）。

## ローカルで確認する

Service Workerは `file://` では動かないので、簡易サーバーで開きます。

```sh
python3 -m http.server 8000
# → http://localhost:8000/
```

## 更新するとき

`index.html` などを書き換えて公開し直したら、`sw.js` の先頭にある `VERSION`
（`signal-v1` → `signal-v2` …）を上げてください。古いキャッシュが入れ替わります。

## 依存しているもの

- [hls.js](https://github.com/video-dev/hls.js)（jsDelivr CDNから読み込み）
- Firebase JS SDK（gstatic CDNから読み込み）
- Google Fonts（Barlow Condensed / Zen Kaku Gothic New）
