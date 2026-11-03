// schema.json から TypeScript の型（ts/types.ts）を作る。--check は作り直したものと違えば失敗する（CI 用）
import { readFile, writeFile } from 'node:fs/promises';
import { compile } from 'json-schema-to-typescript';

const SCHEMA = new URL('../movie_editer_schema/schema.json', import.meta.url);
const OUT = new URL('../ts/types.ts', import.meta.url);

const schema = JSON.parse(await readFile(SCHEMA, 'utf8'));
const body = await compile(schema, 'MovieEditerSchema', {
  bannerComment:
    '/* このファイルは scripts/gen-types.mjs が movie_editer_schema/schema.json から作る。手で書き換えない（npm run gen） */',
  unreachableDefinitions: true,
  additionalProperties: false,
  strictIndexSignatures: false,
  format: true,
  style: { singleQuote: true, printWidth: 120 },
});

if (process.argv.includes('--check')) {
  const now = await readFile(OUT, 'utf8').catch(() => '');
  if (now !== body) {
    console.error('ts/types.ts が schema.json と合っていません。npm run gen で作り直してください');
    process.exit(1);
  }
  console.log('ts/types.ts は schema.json と合っています');
} else {
  await writeFile(OUT, body);
  console.log('ts/types.ts を書きました');
}
