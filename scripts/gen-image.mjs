#!/usr/bin/env node
// Generate images via the laozhang.ai gateway (Google Gemini Image / Nano Banana Pro).
//
// Usage:
//   npm run gen-image -- \
//     --prompt "<full prompt>" \
//     --out public/generated/<file>.jpg \
//     [--aspect 16:9] [--size 2K] [--model gemini-3-pro-image-preview] \
//     [--ref path/to/ref.jpg] [--ref path/to/ref2.jpg]
//
// Requires LAOZHANG_API_KEY in .env.local. Loaded automatically via:
//   "gen-image": "node --env-file=.env.local scripts/gen-image.mjs"
//
// Reference: docs/context/miozuki-nano-banana-image-guide.md §13 (laozhang.ai integration)
// API docs:  https://docs.laozhang.ai/api-capabilities/nano-banana-pro-image

import { parseArgs } from 'node:util';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';

const VALID_ASPECTS = new Set([
  '1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9',
]);
const VALID_SIZES = new Set(['1K', '2K', '4K']);

function die(msg) {
  console.error(`gen-image: ${msg}`);
  process.exit(1);
}

const { values: args } = parseArgs({
  options: {
    prompt: { type: 'string' },
    'prompt-file': { type: 'string' },
    out: { type: 'string' },
    aspect: { type: 'string', default: '16:9' },
    size: { type: 'string', default: '2K' },
    model: { type: 'string', default: 'gemini-3.1-flash-image-preview' },
    ref: { type: 'string', multiple: true, default: [] },
    help: { type: 'boolean', default: false },
  },
});

if (args.help) {
  console.log(`gen-image, Nano Banana Pro via laozhang.ai

Required (one of):
  --prompt        Full prompt text (250-500 words per docs/context/miozuki-nano-banana-image-guide.md §2)
  --prompt-file   Path to a markdown file whose body is the prompt.
                  Use this for multi-line prompts to avoid shell escaping.
                  YAML frontmatter (--- ... ---) is stripped automatically.

Required:
  --out      Output path, e.g. public/generated/og-bg.jpg

Optional:
  --aspect   Aspect ratio (default 16:9). One of:
             1:1, 2:3, 3:2, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9
  --size     Image size (default 2K). One of: 1K, 2K, 4K
  --model    Model id (default gemini-3.1-flash-image-preview, "Nano Banana 2").
             Alternatives: gemini-3-pro-image-preview (Nano Banana Pro)
  --ref      Reference image path for image-to-image. Repeatable, max 14.
  --help     Show this message.

Env: LAOZHANG_API_KEY must be set in .env.local.
`);
  process.exit(0);
}

if (args.prompt && args['prompt-file']) {
  die('pass either --prompt or --prompt-file, not both');
}

if (args['prompt-file']) {
  let text;
  try {
    text = await readFile(resolve(args['prompt-file']), 'utf8');
  } catch (err) {
    die(`failed to read --prompt-file ${args['prompt-file']}: ${err.message}`);
  }
  // Strip leading YAML frontmatter (--- ... ---) if present.
  const fm = text.match(/^---\n[\s\S]*?\n---\n?/);
  if (fm) text = text.slice(fm[0].length);
  args.prompt = text.trim();
  if (!args.prompt) die(`--prompt-file ${args['prompt-file']} is empty after stripping frontmatter`);
}

if (!args.prompt) die('--prompt or --prompt-file is required (use --help for usage)');
if (!args.out) die('--out is required');
if (!VALID_ASPECTS.has(args.aspect)) {
  die(`invalid --aspect "${args.aspect}". Must be one of: ${[...VALID_ASPECTS].join(', ')}`);
}
if (!VALID_SIZES.has(args.size)) {
  die(`invalid --size "${args.size}". Must be one of: ${[...VALID_SIZES].join(', ')}`);
}
if (args.ref.length > 14) {
  die(`too many --ref images (${args.ref.length}); max is 14`);
}

const apiKey = process.env.LAOZHANG_API_KEY;
if (!apiKey) {
  die('LAOZHANG_API_KEY not set. Add it to .env.local and rerun via `npm run gen-image -- ...`');
}

function mimeForPath(p) {
  const ext = extname(p).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}

async function loadRef(path) {
  const buf = await readFile(resolve(path));
  return {
    inline_data: {
      mime_type: mimeForPath(path),
      data: buf.toString('base64'),
    },
  };
}

const refParts = await Promise.all(args.ref.map(loadRef));

const body = {
  contents: [
    {
      parts: [
        { text: args.prompt },
        ...refParts,
      ],
    },
  ],
  generationConfig: {
    responseModalities: ['IMAGE'],
    imageConfig: {
      aspectRatio: args.aspect,
      imageSize: args.size,
    },
  },
};

const url = `https://api.laozhang.ai/v1beta/models/${args.model}:generateContent`;

console.log(`gen-image: POST ${url}`);
console.log(`gen-image:   model=${args.model} aspect=${args.aspect} size=${args.size} refs=${args.ref.length}`);
console.log(`gen-image:   prompt[${args.prompt.length} chars]: ${args.prompt.slice(0, 80).replace(/\s+/g, ' ')}...`);

const t0 = Date.now();
let res;
try {
  res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
} catch (err) {
  die(`network error: ${err.message}`);
}

if (!res.ok) {
  const text = await res.text();
  die(`API ${res.status} ${res.statusText}\n${text}`);
}

let json;
try {
  json = await res.json();
} catch (err) {
  die(`failed to parse JSON response: ${err.message}`);
}

const part = json?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data || p.inline_data?.data);
const inline = part?.inlineData ?? part?.inline_data;
const b64 = inline?.data;

if (!b64) {
  die(`no image data in response. Full payload:\n${JSON.stringify(json, null, 2).slice(0, 2000)}`);
}

const outPath = resolve(args.out);
await mkdir(dirname(outPath), { recursive: true });
const buf = Buffer.from(b64, 'base64');
await writeFile(outPath, buf);

const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
const kb = (buf.length / 1024).toFixed(1);
console.log(`gen-image: ✓ wrote ${outPath} (${kb} KB) in ${elapsed}s`);
console.log(`gen-image:   sidecar suggestion: scripts/prompts/${args.out.split(/[\\/]/).pop()}.prompt.md`);
