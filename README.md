# movie-editer-schema

movie-editer（VTuber 配信の録画から縦型ショートの下書きを作るパイプライン）と movie-editer-viewer（Firestore 経由で見るビューア）がやりとりするデータの形を、1か所で決めるリポジトリ。

これまでは movie-editer の `shorts/publish.py`（`SCHEMA = 2`）と viewer の `src/types.ts` を手で合わせていて、片方だけ直すとずれても気付けなかった。ここを正本にして、両方のテストで同じ形を検査する。

## 中身

| ファイル | 内容 |
|---|---|
| `movie_editer_schema/schema.json` | 正本（JSON Schema draft-07）。`definitions` に Firestore のドキュメントと中身の形 |
| `movie_editer_schema/__init__.py` | Python から検査する（`validate`・`errors`・`validate_video_doc`） |
| `ts/types.ts` | `schema.json` から作った TypeScript の型（`npm run gen`） |
| `ts/index.ts` | 型と `SCHEMA_VERSION` |
| `examples/` | 見本のデータ（テストで検査する） |

主な形：

| 名前 | Firestore | 書く所 |
|---|---|---|
| `VideoDoc`・`VideoData` | `videos/{動画名}`（`data` は `VideoData` の JSON 文字列） | movie-editer の `publish` |
| `SourcesDoc`・`SourceItems` | `sources/all`（`data` は `SourceItem[]` の JSON 文字列） | movie-editer の `watch`・`publish` |
| `LearningDoc` | `sources/learning` | movie-editer の `publish` |
| `RequestDoc` | `requests/{id}` | ビューア（依頼）と movie-editer の `watch`（状態） |

## 使い方

Python（movie-editer）：

```bash
.venv/bin/python -m pip install "movie-editer-schema @ git+https://github.com/keigo-hisazumi/movie-editer-schema@v2.0.0"
```

```python
from movie_editer_schema import SCHEMA_VERSION, errors, validate

validate("VideoData", data)          # 違えば jsonschema.ValidationError
print(errors("VideoData", data))     # 違う所の一覧（例：VideoData.topic_cuts[0].cut.start: ...）
```

TypeScript（ビューア）：

```bash
npm install github:keigo-hisazumi/movie-editer-schema#v2.0.0
```

```ts
import { SCHEMA_VERSION, type VideoDoc, type VideoData } from 'movie-editer-schema';
```

## 開発

```bash
python3 -m venv .venv && .venv/bin/python -m pip install -e '.[dev]'
.venv/bin/python -m pytest && .venv/bin/python -m ruff check .
npm install && npm run gen && npm run check
```

ルール（版の上げ方など）は [`AGENTS.md`](./AGENTS.md)。
