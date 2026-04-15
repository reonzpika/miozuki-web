---
title: Miozuki - Nano Banana image guide
type: reference
project: miozuki-web
created: 2026-04-08
updated: 2026-04-15
purpose: >-
  Canonical prompt-engineering and laozhang.ai workflow for AI-generated mood imagery in miozuki-web. Jewellery-free, brand-locked. Use with scripts/prompts/_templates.md.
---

# Miozuki - Nano Banana image guide

**Brand scaffolds and non-negotiables:** `scripts/prompts/_templates.md` (palette, no jewellery, no hands in frame, starter scaffolds).

Compiled 2026-04-08; Miozuki integration and §7 / §10 / §13 updated 2026-04-15. Source links at the bottom of every section.

## 1. What it is

**Nano Banana Pro = Google Gemini 3 Pro Image.** Released November 2025. Successor to the original "Nano Banana" (Gemini 2.5 Flash Image) and a sibling to the lighter "Nano Banana 2" released February 2026.

Three Google image models exist as of April 2026:

| Model | Identity | Best for |
|---|---|---|
| Nano Banana | Gemini 2.5 Flash Image | Fast, fun edits, low-stakes generation |
| Nano Banana 2 | Lighter Nov 2025 successor | Faster generation, slightly lower fidelity |
| **Nano Banana Pro** | **Gemini 3 Pro Image** | **Highest quality, complex compositions, editorial output, the choice for landing-page hero work** |

**Access points:**
- Gemini app (consumer)
- Google AI Studio (free dev access)
- Vertex AI (enterprise / API)
- Available to enterprise customers via Google Cloud Blog announcement

**Distinguishing capabilities:**
- Up to 4K resolution
- Multiple aspect ratios (1:1, 16:9, 9:16, 4:3, 3:4, 21:9)
- Up to **14 input reference images** for composition control
- **5-character consistency** across a generation set
- **14-object fidelity** in a single workflow
- Best-in-class text-in-image rendering, multilingual
- Built on Gemini 3 Pro reasoning, so it understands compositional language well

**Miozuki use:** mood imagery, section backgrounds, blog heroes, OG backgrounds. **Never** AI-rendered jewellery, hands wearing pieces, or product-accurate gems; real product photography stays in Shopify. See `_templates.md`.

Sources:
- [Nano Banana Pro - Google Blog (Nov 2025)](https://blog.google/innovation-and-ai/products/nano-banana-pro/)
- [Gemini 3 Pro Image - Google DeepMind](https://deepmind.google/models/gemini-image/pro/)
- [Nano Banana Pro for Enterprise - Google Cloud Blog](https://cloud.google.com/blog/products/ai-machine-learning/nano-banana-pro-available-for-enterprise)
- [Google launches Nano Banana 2 - TechCrunch (Feb 2026)](https://techcrunch.com/2026/02/26/google-launches-nano-banana-2-model-with-faster-image-generation/)

---

## 2. Prompt structure - the 7-part template

Google's recommended structure, distilled from the official prompting guide. **Order matters**: earlier elements carry more weight in the model's attention.

| # | Part | Miozuki-oriented example |
|---|---|---|
| 1 | **Subject** | "A cream linen table runner with a deep burgundy silk drape, a matte ceramic vessel, and a brass tray edge barely in frame - still life only, no people" |
| 2 | **Scene** | "Auckland interior, late afternoon, north- or west-facing window" |
| 3 | **Lens / aperture** | "Hasselblad H6D-50c, 80mm at f/2.2, ISO 200, 1/125" |
| 4 | **Lighting direction** | "Single warm window from camera left at about 30°, 4500K, soft falloff across the right side" |
| 5 | **Materials / textures** | "Visible linen weave, silk nap catching rim light, hairline crackle in glaze, faint brass oxidation, fine film grain" |
| 6 | **Colour grade** | "Kodak Portra 400 warmth, cream highlights, charcoal shadows, burgundy accents only where natural (fabric), low saturation" |
| 7 | **Fidelity constraints** | "RAW unprocessed look, no HDR, no rim lighting, no studio glow, off-centre composition, Kinfolk-style editorial still life" |

**Length:** Long descriptive paragraphs work better than short tag lists. Nano Banana Pro is a Gemini 3 reasoning model; it processes natural language better than comma-separated keywords. Aim for 250-500 words for hero shots.

Sources:
- [Ultimate Prompting Guide for Nano Banana - Google Cloud Blog](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)
- [Best prompt structure for Nano Banana Pro realism - Sider](https://sider.ai/blog/ai-image/best-prompt-structure-for-nano-banana-pro-realism-a-practical-guide)
- [Nano Banana Pro Prompting Guide & Strategies - Google AI on dev.to](https://dev.to/googleai/nano-banana-pro-prompting-guide-strategies-1h9n)

---

## 3. Photographic language that defeats the AI look

The single biggest realism lever: stop using AI-art words ("hyper-detailed", "masterpiece", "8K UHD") and start using **real photographer language**.

### Camera bodies that produce realistic results

- **Leica Q2 / Q3** - small, fixed-lens, signature documentary look
- **Sony A7R IV / A7 III** - modern editorial workhorse
- **Canon 5D Mark IV** - classic photojournalism
- **Fujifilm X100V** - film-emulation digital, magazine aesthetic
- **Hasselblad 907X** - medium format, slow editorial

**Miozuki default (per `_templates.md`):** Hasselblad H6D-50c or 907X, Leica Q3, Fujifilm GFX 100 II for still life; avoid Sony A7 for this brand track.

### Lens / aperture references
- "50mm f/1.8" or "85mm f/1.4" for portrait work
- "28mm f/1.7" or "35mm f/2" for wide documentary
- "100mm macro f/2.8" for close-up clinical / product
- Always name the aperture explicitly: "f/2.0" not "shallow depth of field"
- Add ISO and shutter for extra credibility: "ISO 400, 1/200"

### Film stock references (powerful)
- "Kodak Portra 400" - warm, editorial, magazine
- "Kodak Tri-X 400" - black and white reportage
- "Cinestill 800T" - tungsten warmth, indie film aesthetic
- "Fujifilm Velvia 50" - saturated landscape

### Editorial style anchors (anchor by publication)
- "Reminiscent of a Kinfolk magazine spread"
- "FT Weekend magazine documentary photography"
- "New York Times Magazine feature photography"
- "Monocle editorial portraiture"
- "Wallpaper* product photography"

These publication anchors tell the model "photograph, not illustration" without using the word "photorealistic" (which can paradoxically push toward AI-art tells).

Sources:
- [How to prompt Gemini 2.5 Flash Image Generation - Google Developers Blog](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/)
- [Leonardo.ai Nano Banana Prompt Guide](https://leonardo.ai/news/nano-banana-prompt-guide/)

---

## 4. Anti-AI-look techniques

Concrete techniques that defeat the uncanny / glossy / over-rendered AI aesthetic.

| Technique | Why it works |
|---|---|
| **"RAW unprocessed look"** | Tells the model to skip its default smoothing pass |
| **Explicit imperfections** ("dust", "wrinkles in fabric", "slight stain", "crackle glaze") | The AI's default output is hyper-clean; naming flaws breaks that |
| **"No HDR, no rim lighting, no studio glow"** | Three of the most common AI tells, killed in one phrase |
| **Off-centre composition language** ("rule of thirds, slightly right of centre, off-axis") | AI defaults to centred subjects; this breaks the symmetry tell |
| **Natural light direction** ("from camera left", "single source") | AI defaults to flat omnidirectional light; specifying direction creates real shadows |
| **Real colour temperature** ("4500K") | AI defaults to oversaturated; Kelvin temps anchor reality |
| **Editorial publication anchor** ("Kinfolk magazine spread") | Pulls aesthetic toward photojournalism, away from stock |
| **Avoid "masterpiece", "8K UHD", "hyper-detailed"** | These are the AI-art quality markers and paradoxically cause AI tells |
| **Negative constraints** (no logos, minimal or no on-image text, no watermark, no symmetric composition) | Removes the most common giveaways |

Sources:
- [How to Write Prompts for Photorealistic AI Images in 2026 - artsmart.ai](https://artsmart.ai/blog/ai-image-prompts-photorealistic/)
- [Advanced Prompt Techniques for Hyper-Realistic Results - stockimg.ai](https://stockimg.ai/blog/prompts/advanced-prompt-techniques-getting-hyper-realistic-results-from-your-ai-photo-generator)

---

## 5. Hand handling - the #1 AI failure mode

**Miozuki:** Do **not** put hands or jewellery-on-hand in AI generations. `_templates.md` forbids it; jewellery and fingers are the highest AI-tell risk for this brand. Use still life, texture, and negative space only.

For **non-Miozuki** prompts (or rare exceptions agreed with the owner): hands are the hardest element. **Negative prompts alone are insufficient.** The trick is **positive description**.

### The rule
Tell the model **exactly what the hand is doing**, finger by finger. Don't say "no bad hands"; say "thumb on right edge of object, index finger curved around the back, three other fingers naturally folded beneath."

### Template for a hand holding an object
```
The hand is holding [object] with a relaxed natural
grip - five fingers, anatomically correct, the thumb resting
gently on the [side] edge of the [object], the index finger
curved around the [position], the middle ring and little
fingers folded naturally beneath. The hand belongs to a
[demographic], slightly veined, no jewellery, no watch,
clean trimmed fingernails.
```

### Always include
- **Finger count**: "five fingers, anatomically correct"
- **Posture**: "relaxed natural grip" / "loose but firm"
- **Demographics**: e.g. "in their 40s"
- **Wrist transition**: where the wrist leaves the frame

### Iteration strategy if hands fail
1. Generate 4-6 variations from the same prompt
2. If most are bad: rewrite the hand description with more anatomical specificity
3. If still bad: **remove the hand from the frame entirely**
4. Last resort: generate without the hand, then refine with a reference image

Sources:
- [How to Fix AI Hands: Complete Guide 2026 - zsky.ai](https://zsky.ai/blog/how-to-fix-ai-hands)
- [AI Hands, Anatomy & Body Fixes - GensGPT](https://www.gensgpt.com/blog/ai-hands-anatomy-body-fixes-common-errors-2026-guide)
- [How to Fix Hands in Stable Diffusion - AI Prompts Directory](https://www.aipromptsdirectory.com/how-to-fix-hands-in-stable-diffusion-a-step-by-step-guide/)

---

## 6. Screen handling - the #2 AI failure mode

Phone and monitor screens are the second hardest thing for image gen. They tend to render as nonsense pixels, fake UI, or impossible aspect ratios.

### Rules
- **Be explicit about what's on the screen** - describe the content
- **Keep on-screen text minimal** - single word or no text
- **Use shallow depth of field on background screens** - bokeh hides fidelity issues
- **Name the device family** - "current-generation iPhone" or "27-inch desktop monitor"
- **Allow imperfections** - "fingerprint smudge", "hairline scratch", "thin dust on the bezel"

### What to avoid
- Long blocks of UI text on a screen
- Specific app names - model will hallucinate
- Centred screens facing the camera - looks like a stock photo
- "App interface mockup" - pulls model toward AI-template defaults

**Miozuki:** Prefer **no screens** in AI art. For OG cards, use flat texture only and overlay typography in Figma or code (`_templates.md` scaffold 4).

---

## 7. Negative constraints checklist

The laozhang gateway has **no separate negative-prompt field**. Append constraints **in the prompt text**.

### 7.1 Miozuki - paste after every prompt

Use this block (or equivalent prose) on **every** miozuki-web generation:

```
no jewellery, no rings, no pearls, no gemstones, no engagement rings, no diamond imagery,
no models wearing jewellery, no hands, no fingers, no faces, no people,
no text, no watermark, no logos, no extra hands or fingers, no deformed anatomy,
no symmetrical composition, no perfectly centred subject,
no HDR, no rim lighting, no studio glow, no oversaturation, no orange-and-teal colour grading,
no neon, no purple or blue gradients, no border, no caption
```

Align colours with brand tokens in `_templates.md` (cream, deep burgundy, charcoal only); do not introduce off-palette hues.

### 7.2 Generic editorial block (other projects)

If you need a neutral editorial block without the Miozuki jewellery/human rules:

```
no text (except where explicitly needed)
no watermark
no logos
no extra hands or fingers
no deformed anatomy
no symmetrical composition
no perfectly centred subject
no HDR
no rim lighting
no studio glow
no oversaturation
no orange-and-teal colour grading
no border, no caption
```

---

## 8. Iteration workflow

The professional way to use Nano Banana Pro is **iterative refinement**, not single-shot generation.

1. **v1: detailed text-only prompt.** Generate 4-6 variations.
2. **Pick winner.** Look at light direction, composition, texture (Miozuki: no humans to check).
3. **v2: send the winner BACK as a reference image** with a refinement instruction. Nano Banana Pro accepts up to 14 reference images.
4. **v3: lock the composition, vary only the surface details.** Use reference-image refinement for surgical fixes.
5. **Avoid full re-generations** once you have a winning composition.

---

## 9. Aspect ratios for landing pages

| Use case | Ratio | Notes |
|---|---|---|
| Hero (desktop wide) | 16:9 | Default for section bands (e.g. homepage imagery) |
| Hero (square / mobile) | 1:1 | Fallback crops |
| Hero (cinematic ultra-wide) | 21:9 | Editorial magazine feel |
| Inline section image | 4:3 or 3:2 | Document-like |
| OG / social card | 16:9 | Source for 1200×630 crops; see `_templates.md` scaffold 4 |

**Miozuki shipped examples:** `public/generated/accessible-luxury.jpg`, `public/generated/og-image.jpg` (patterns for future slots).

For a restrained editorial feel (Mejuri / Monica Vinader register), **16:9 is the default for hero work**.

---

## 10. Verbatim example prompt - Miozuki editorial still life

Reference prompt for jewellery-free mood imagery. Expand or swap subject matter per slot; keep camera, light, palette, and §7.1 constraints.

```
An editorial still-life photograph for a fine jewellery brand mood piece - no jewellery,
no gemstones, no products, no people, no hands, no faces.

Subject: cream linen runner across a pale oak surface, a deep burgundy silk drape
falling in soft folds from the upper frame, a single matte off-white ceramic vessel
off-centre, and the corner of a brushed brass tray catching a thin line of light.
The composition is intentionally quiet and asymmetric.

Scene: Auckland interior, late afternoon. North- or west-facing window just out of frame.

Lighting: one warm window from camera left at about 30 degrees, colour temperature near
4500K, gentle falloff into charcoal shadow on the right third of the frame. No second
fill light, no bounce cards, no studio softness.

Camera: Hasselblad H6D-50c, 80mm lens at f/2.2, ISO 200, shutter 1/125. Shallow depth
of field; sharpest focus on the silk fold nearest the lens, creamy falloff on the
rear edge of the linen.

Materials and texture: visible linen weave, fine slubs in the silk, a hairline crackle
in the ceramic glaze, faint oxidation on the brass, one small water mark on the wood
that reads as real use, subtle Kodak Portra-style grain.

Colour: warm cream highlights, deep burgundy in fabric only, charcoal shadows, low
overall saturation. No neon, no teal-orange grading, no glossy HDR.

Style: Kinfolk or Cereal magazine still life - restrained luxury, editorial, calm.

Fidelity: RAW unprocessed look, natural grain, no plastic smoothing, no rim light,
no symmetrical composition, no centred hero object.

Negative constraints: no jewellery, no rings, no pearls, no gemstones, no hands,
no fingers, no faces, no people, no text, no watermark, no logos, no border, no caption.
```

---

## 11. Quick-reference checklist (when writing a new prompt)

- [ ] Open with the subject in plain language (Miozuki: still life / texture only)
- [ ] Name the scene specifically (place, time of day)
- [ ] Specify camera body, lens, aperture, ISO, shutter (match `_templates.md` preferences)
- [ ] Describe lighting direction, source, Kelvin temperature
- [ ] List 3-5 explicit imperfections (fabric, glaze, wood, dust)
- [ ] Anchor the colour grade with an editorial publication name
- [ ] **Append §7.1 Miozuki negative block**
- [ ] Include "RAW unprocessed look" + "no HDR, no rim lighting, no studio glow"
- [ ] Aim for 250-500 words total
- [ ] Generate 4-6 variations, then refine the winner via reference-image input
- [ ] Save sidecar `scripts/prompts/<slot>.prompt.md` and commit with `public/generated/` output

---

## 12. Sources (full list)

- [Nano Banana Pro: Gemini 3 Pro Image - Google blog](https://blog.google/innovation-and-ai/products/nano-banana-pro/)
- [Gemini 3 Pro Image - Google DeepMind](https://deepmind.google/models/gemini-image/pro/)
- [Nano Banana Pro for Enterprise - Google Cloud Blog](https://cloud.google.com/blog/products/ai-machine-learning/nano-banana-pro-available-for-enterprise)
- [Nano Banana 2 launch - Google blog](https://blog.google/innovation-and-ai/technology/ai/nano-banana-2/)
- [Nano Banana 2 - TechCrunch](https://techcrunch.com/2026/02/26/google-launches-nano-banana-2-model-with-faster-image-generation/)
- [Gemini AI image generator overview](https://gemini.google/overview/image-generation/)
- [Ultimate Prompting Guide for Nano Banana - Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)
- [Nano Banana Pro Prompting Guide & Strategies - Google AI on dev.to](https://dev.to/googleai/nano-banana-pro-prompting-guide-strategies-1h9n)
- [Nano Banana Prompting Tips - Google blog](https://blog.google/products/gemini/prompting-tips-nano-banana-pro/)
- [How to prompt Gemini 2.5 Flash Image Generation - Google Developers](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/)
- [Leonardo.ai Nano Banana Prompt Guide](https://leonardo.ai/news/nano-banana-prompt-guide/)
- [Best prompt structure for Nano Banana Pro realism - Sider](https://sider.ai/blog/ai-image/best-prompt-structure-for-nano-banana-pro-realism-a-practical-guide)
- [Nano Banana Pro Complete Guide 2026 - AVB](https://aivideobootcamp.com/blog/nano-banana-pro-complete-guide-2026/)
- [How to Write Prompts for Photorealistic AI Images 2026 - artsmart.ai](https://artsmart.ai/blog/ai-image-prompts-photorealistic/)
- [Advanced Prompt Techniques for Hyper-Realistic Results - stockimg.ai](https://stockimg.ai/blog/prompts/advanced-prompt-techniques-getting-hyper-realistic-results-from-your-ai-photo-generator)
- [How to Fix AI Hands: Complete Guide 2026 - zsky.ai](https://zsky.ai/blog/how-to-fix-ai-hands)
- [AI Hands, Anatomy & Body Fixes - GensGPT](https://www.gensgpt.com/blog/ai-hands-anatomy-body-fixes-common-errors-2026-guide)
- [Awesome Nano Banana Pro - GitHub repo of curated prompts](https://github.com/ZeroLu/awesome-nanobanana-pro)

---

## 13. Integration: laozhang.ai gateway + miozuki-web

All §1 to §12 content above is the source of truth for **what** to put in a prompt. This section is **how** to run generation in this repo.

### 13.1 Why laozhang.ai

- Gateway service that proxies Google's Gemini image API at favourable rates versus going direct.
- Endpoint: `https://api.laozhang.ai/v1beta/models/{model}:generateContent`
- Auth: `Authorization: Bearer ${LAOZHANG_API_KEY}` header.
- Models available:
  - `gemini-3.1-flash-image-preview` - Nano Banana 2 (faster, default in `gen-image.mjs`)
  - `gemini-3-pro-image-preview` - Nano Banana Pro / Gemini 3 Pro Image (higher fidelity)
- Aspect ratios supported: `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`
- Sizes: `1K`, `2K` (default for landing-page work), `4K`
- Image-to-image: pass up to 14 reference images via `inline_data` parts in the same `contents` array. Use this for iteration (text-only v1, then refine via ref).
- **Not supported**: negative prompts as a separate field (encode negatives in the prompt text per §7), seed control (each call is fresh).
- Docs: https://docs.laozhang.ai/api-capabilities/nano-banana-pro-image

### 13.2 Environment variable

- **Name**: `LAOZHANG_API_KEY`
- **Where**: project `.env.local` (gitignored).
- **Vercel:** not required for generation. Run `npm run gen-image` locally; commit outputs under `public/generated/`. No runtime API key on the live site for this path.
- **Verification:** `git check-ignore .env.local` should print the path before committing anything else.

### 13.3 Repo layout

| File | Purpose |
|------|---------|
| `scripts/gen-image.mjs` | Node 20+ ESM script. Flags: `--prompt`, `--prompt-file`, `--out`, `--aspect` (default `16:9`), `--size` (default `2K`), `--model`, `--ref` (repeatable, max 14). |
| `scripts/prompts/_templates.md` | Brand-locked starter scaffolds; read before every slot. |
| `scripts/prompts/<slot>.prompt.md` | Sidecar audit trail per generated image. |
| `public/generated/` | Committed static assets referenced by the Next.js app. |
| `package.json` | `"gen-image": "node --env-file=.env.local scripts/gen-image.mjs"` |

Invocation:

```bash
npm run gen-image -- \
  --prompt "<full 250-500 word prompt>" \
  --aspect 16:9 \
  --size 2K \
  --out public/generated/<slot-name>.jpg
```

Multi-line prompts (recommended):

```bash
npm run gen-image -- \
  --prompt-file scripts/prompts/<slot-name>.prompt.md \
  --out public/generated/<slot-name>.jpg
```

Image-to-image refinement:

```bash
npm run gen-image -- \
  --prompt "<refinement instructions>" \
  --ref public/generated/<previous-output>.jpg \
  --out public/generated/<slot-name>-v2.jpg
```

### 13.4 Iteration workflow (Cursor / agent)

1. **Read** `scripts/prompts/_templates.md` and this file §2, §3, §4, §7.1, §11.
2. **Write** the expanded prompt in `scripts/prompts/<slot>.prompt.md`.
3. **Generate v1** via `npm run gen-image`.
4. **Sign-off:** AI-tell smell test, brand palette (`_templates.md`), alignment with `docs/context/brand-audit-2026.md` where relevant, owner approval for prominent slots.
5. **Iterate** with `--ref` if needed (up to 14 reference images per call).
6. **Commit** final JPEG under `public/generated/` and the matching `.prompt.md` sidecar; reference the sidecar path in the commit message when helpful.

### 13.5 Cost guardrails

- Flash model: order of ~$0.04–0.05 per generation; Pro slightly higher (confirm on provider pricing).
- If a slot fails sign-off twice, prefer typographic or abstract treatment per `_templates.md` rather than open-ended re-rolls.

### 13.6 Repo status

| Repo | Status |
|------|--------|
| `miozuki-web` | **Active.** `scripts/gen-image.mjs`, `public/generated/*`, and prompt sidecars in use. |

Former cross-project notes live only in git history (`nano-banana-pro-research.md` renamed and retargeted to this file).
