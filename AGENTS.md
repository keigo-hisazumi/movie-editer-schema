# AGENTS.md — AI エージェント向け指示書（正本）

movie-editer（パイプライン、private）・movie-editer-viewer（ビューア）・movie-editer-studio（予定。ローカルの確認・編集 UI）がやりとりするデータの形の正本。

## ルール
- 出力（チャット・コメント・ドキュメント・PR・コミット本文）は日本語。変数名・ファイル名・技術用語・コマンド名は英語のまま
- `main` への直接のコミット・プッシュはしない。作業ブランチから PR を出す
- コミットメッセージは `feat:` / `fix:` / `docs:` などのプレフィックス + 日本語本文
- 機密情報（鍵・メールアドレス・個人のパス）は書かない（public リポジトリ）

## 正本と作るもの
- 正本は `movie_editer_schema/schema.json`（JSON Schema draft-07、`definitions` に形を並べる）
- `ts/types.ts` は `npm run gen` で作る。手で書き換えない
- 形を変えたら：`schema.json` → `npm run gen` → `examples/` の見本を直す → `.venv/bin/python -m pytest` と `npm run check` を通す

## 版
- 形式の版（`SCHEMA_VERSION`、Firestore のドキュメントの `schema`）は、ビューアが読めなくなる変更（フィールドを消す・名前や型を変える）のときだけ上げる。フィールドを足すだけなら上げない（`additionalProperties: false` の所はここで足す）
- パッケージの版（`package.json`・`pyproject.toml`）の major は `SCHEMA_VERSION` と同じにする。そろっていなければテストが落ちる
- 使う側は git のタグ（`v2.0.0` など）で版を決めて入れる。形を変えたら schema → movie-editer → viewer の順に上げる
