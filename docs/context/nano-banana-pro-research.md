---
title: Nano Banana Pro — Prompt Engineering Research
type: reference
created: 2026-04-08
updated: 2026-04-08
purpose: Durable reference for crafting photorealistic image prompts using Google's Nano Banana Pro (Gemini 3 Pro Image) model.
---

# Nano Banana Pro — Prompt Engineering Research

Compiled 2026-04-08. Source links at the bottom of every section.

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

Sources:
- [Nano Banana Pro — Google Blog (Nov 2025)](https://blog.google/innovation-and-ai/products/nano-banana-pro/)
- [Gemini 3 Pro Image — Google DeepMind](https://deepmind.google/models/gemini-image/pro/)
- [Nano Banana Pro for Enterprise — Google Cloud Blog](https://cloud.google.com/blog/products/ai-machine-learning/nano-banana-pro-available-for-enterprise)
- [Google launches Nano Banana 2 — TechCrunch (Feb 2026)](https://techcrunch.com/2026/02/26/google-launches-nano-banana-2-model-with-faster-image-generation/)

---

## 2. Prompt structure — the 7-part template

Google's recommended structure, distilled from the official prompting guide. **Order matters**: earlier elements carry more weight in the model's attention.

| # | Part | Example |
|---|---|---|
| 1 | **Subject** | "A New Zealand general practitioner's hand holding a smartphone in mid-capture" |
| 2 | **Scene** | "Inside a quiet consultation room, late afternoon" |
| 3 | **Lens / aperture** | "Shot on a Leica Q2, 28mm Summilux f/1.7, aperture f/2.0, ISO 400, 1/200" |
| 4 | **Lighting direction** | "Single warm directional window light from camera left, 4500K, soft falloff across the right side" |
| 5 | **Materials / textures** | "Visible skin pores, faint freckling on the knuckle, fingerprint smudge on the phone screen, real wood grain on the desk" |
| 6 | **Colour grade** | "Muted editorial palette, warm cream highlights, deep ink-black shadows, low saturation, gentle film grain" |
| 7 | **Fidelity constraints** | "RAW unprocessed look, no HDR, no rim lighting, no studio glow, no symmetrical composition" |

**Length:** Long descriptive paragraphs work better than short tag lists. Nano Banana Pro is a Gemini 3 reasoning model — it processes natural language better than comma-separated keywords. Aim for 250-500 words for hero shots.

Sources:
- [Ultimate Prompting Guide for Nano Banana — Google Cloud Blog](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)
- [Best prompt structure for Nano Banana Pro realism — Sider](https://sider.ai/blog/ai-image/best-prompt-structure-for-nano-banana-pro-realism-a-practical-guide)
- [Nano Banana Pro Prompting Guide & Strategies — Google AI on dev.to](https://dev.to/googleai/nano-banana-pro-prompting-guide-strategies-1h9n)

---

## 3. Photographic language that defeats the AI look

The single biggest realism lever: stop using AI-art words ("hyper-detailed", "masterpiece", "8K UHD") and start using **real photographer language**.

### Camera bodies that produce realistic results
- **Leica Q2 / Q3** — small, fixed-lens, signature documentary look
- **Sony A7R IV / A7 III** — modern editorial workhorse
- **Canon 5D Mark IV** — classic photojournalism
- **Fujifilm X100V** — film-emulation digital, magazine aesthetic
- **Hasselblad 907X** — medium format, slow editorial

### Lens / aperture references
- "50mm f/1.8" or "85mm f/1.4" for portrait work
- "28mm f/1.7" or "35mm f/2" for wide documentary
- "100mm macro f/2.8" for close-up clinical / product
- Always name the aperture explicitly: "f/2.0" not "shallow depth of field"
- Add ISO and shutter for extra credibility: "ISO 400, 1/200"

### Film stock references (powerful)
- "Kodak Portra 400" — warm, editorial, magazine
- "Kodak Tri-X 400" — black and white reportage
- "Cinestill 800T" — tungsten warmth, indie film aesthetic
- "Fujifilm Velvia 50" — saturated landscape

### Editorial style anchors (anchor by publication)
- "Reminiscent of a Kinfolk magazine spread"
- "FT Weekend magazine documentary photography"
- "New York Times Magazine clinical feature"
- "Monocle editorial portraiture"
- "Wallpaper* product photography"

These publication anchors tell the model "photograph, not illustration" without using the word "photorealistic" (which can paradoxically push toward AI-art tells).

Sources:
- [How to prompt Gemini 2.5 Flash Image Generation — Google Developers Blog](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/)
- [Leonardo.ai Nano Banana Prompt Guide](https://leonardo.ai/news/nano-banana-prompt-guide/)

---

## 4. Anti-AI-look techniques

Concrete techniques that defeat the uncanny / glossy / over-rendered AI aesthetic.

| Technique | Why it works |
|---|---|
| **"RAW unprocessed look"** | Tells the model to skip its default smoothing pass |
| **Explicit imperfections** ("skin pores", "fingerprint smudge", "dust", "wrinkles", "stain") | The AI's default output is hyper-clean; naming flaws breaks that |
| **"No HDR, no rim lighting, no studio glow"** | Three of the most common AI tells, killed in one phrase |
| **Off-centre composition language** ("rule of thirds, slightly right of centre, off-axis") | AI defaults to centred subjects; this breaks the symmetry tell |
| **Natural light direction** ("from camera left", "single source") | AI defaults to flat omnidirectional light; specifying direction creates real shadows |
| **Real colour temperature** ("4500K") | AI defaults to oversaturated; Kelvin temps anchor reality |
| **Editorial publication anchor** ("Kinfolk magazine spread") | Pulls aesthetic toward photojournalism, away from stock |
| **Avoid "masterpiece", "8K UHD", "hyper-detailed"** | These are the AI-art quality markers and paradoxically cause AI tells |
| **Negative constraints** (no logos, no text, no watermark, no symmetric composition, no medical-stock look) | Removes the most common giveaways |

Sources:
- [How to Write Prompts for Photorealistic AI Images in 2026 — artsmart.ai](https://artsmart.ai/blog/ai-image-prompts-photorealistic/)
- [Advanced Prompt Techniques for Hyper-Realistic Results — stockimg.ai](https://stockimg.ai/blog/prompts/advanced-prompt-techniques-getting-hyper-realistic-results-from-your-ai-photo-generator)

---

## 5. Hand handling — the #1 AI failure mode

Hands are the single hardest thing for AI image gen. Even Nano Banana Pro fails on hands maybe 30-50% of the time. **Negative prompts alone are insufficient.** The trick is **positive description**.

### The rule
Tell the model **exactly what the hand is doing**, finger by finger. Don't say "no bad hands" — say "thumb on right edge of phone, index finger curved around the back, three other fingers naturally folded beneath."

### Template for a hand holding an object
```
The doctor's hand is holding [object] with a relaxed natural
grip — five fingers, anatomically correct, the thumb resting
gently on the [side] edge of the [object], the index finger
curved around the [position], the middle ring and little
fingers folded naturally beneath. The hand belongs to a
[demographic], slightly veined, no jewellery, no watch,
clean trimmed fingernails.
```

### Always include
- **Finger count**: "five fingers, anatomically correct"
- **Posture**: "relaxed natural grip" / "loose but firm"
- **Demographics**: "in their 40s" / "working clinician's hand"
- **Details that imply care**: "no jewellery, no watch, clean trimmed fingernails"
- **Wrist transition**: where does the wrist disappear? "into a softly out-of-focus charcoal long-sleeve shirt cuff"

### Iteration strategy if hands fail
1. Generate 4-6 variations from the same prompt
2. If most are bad: rewrite the hand description with more anatomical specificity
3. If still bad: **remove the hand from the frame entirely** and use a top-down or alternate-angle composition that crops the hand out
4. Last resort: generate the scene without the hand, then composite the hand in via reference image refinement

Sources:
- [How to Fix AI Hands: Complete Guide 2026 — zsky.ai](https://zsky.ai/blog/how-to-fix-ai-hands)
- [AI Hands, Anatomy & Body Fixes — GensGPT](https://www.gensgpt.com/blog/ai-hands-anatomy-body-fixes-common-errors-2026-guide)
- [How to Fix Hands in Stable Diffusion — AI Prompts Directory](https://www.aipromptsdirectory.com/how-to-fix-hands-in-stable-diffusion-a-step-by-step-guide/)

---

## 6. Screen handling — the #2 AI failure mode

Phone and monitor screens are the second hardest thing for image gen. They tend to render as nonsense pixels, fake UI, or impossible aspect ratios.

### Rules
- **Be explicit about what's on the screen** — describe the content
- **Keep on-screen text minimal** — single word ("Download") or no text
- **Use shallow depth of field on background screens** — bokeh hides fidelity issues
- **Name the device family** — "current-generation iPhone" or "27-inch desktop monitor"
- **Allow imperfections** — "fingerprint smudge on the lower edge of the screen", "hairline scratch catching the light", "thin layer of dust on the bezel"

### What to avoid
- Long blocks of UI text on a screen
- Specific app names ("Medtech32", "Stripe Dashboard") — model will hallucinate
- Centred screens facing the camera — looks like a stock photo
- "App interface mockup" — pulls model toward AI-template defaults

---

## 7. Negative constraints checklist

For editorial / clinical / product hero shots, this is the standard negative-constraint block:

```
no text (except where explicitly needed)
no watermark
no logos
no extra hands or fingers
no deformed anatomy
no medical illustration aesthetic
no clinical-stock-photography look
no white coat
no stethoscope around anyone's neck
no overhead fluorescent tubes
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
2. **Pick winner.** Look at hands, screens, light direction, composition.
3. **v2: send the winner BACK as a reference image** with a refinement instruction (e.g., "preserve composition and lighting, fix the dust on the monitor bezel, sharpen the phone screen, restore the hand grip"). Nano Banana Pro accepts up to 14 reference images.
4. **v3: lock the composition, vary only the surface details.** Use reference-image refinement for surgical fixes.
5. **Avoid full re-generations** once you have a winning composition — every full re-roll burns the seed.

This is why "burn through 50 generations and pick one" is wasteful — the right way is "lock composition in 4-6 generations, then refine with reference images".

---

## 9. Aspect ratios for landing pages

| Use case | Ratio | Notes |
|---|---|---|
| Hero (desktop wide) | 16:9 | Standard cinematic |
| Hero (square / mobile) | 1:1 | Use as fallback for mobile |
| Hero (cinematic ultra-wide) | 21:9 | Editorial magazine feel |
| Inline section image | 4:3 or 3:2 | More document-like |
| Product card | 1:1 | Bento grids |

For a Mercury / NYT Magazine feel, **16:9 is the default for hero work**.

---

## 10. Verbatim example prompt — reference

The hero prompt drafted for ClinicPro Referral Images, kept here as a reference for future hero shots that follow the same pattern. Replace the subject and scene specifics; keep the camera/lighting/colour/fidelity language intact.

```
A close-up editorial documentary photograph of a New Zealand
general practitioner's hand holding a smartphone in mid-capture
inside a quiet consultation room.

The phone screen clearly shows a freshly photographed clinical
close-up of a small dark pigmented mole on the back of a
patient's hand. The patient's hand is partially visible at the
lower edge of the frame, slightly out of focus, just enough to
suggest the consultation context without dominating.

In the soft background bokeh, a 27-inch desktop monitor sits on
a wooden clinic desk. The monitor displays the same skin
photograph appearing inside a calm, minimal web application
interface — cream background, a single small "Download" text
button visible. The web app on the monitor is just clear enough
to read but rendered in shallow focus. A stethoscope is draped
naturally over the far corner of the desk; two paper patient
files sit beside a mechanical keyboard. A ceramic coffee mug
with cold tea is partly in frame.

Setting: a New Zealand general practice consult room in late
afternoon. Single warm directional window light from camera
left, colour temperature around 4500 Kelvin, soft falloff
across the right side of the frame. Window light catches the
edge of the phone screen and the side of the doctor's
knuckles. Real golden-hour shadows, not synthetic glow.

Composition: medium close-up, subject placed slightly right of
centre, rule of thirds, off-axis. Shot from a natural seated
eye-line, very slightly above the phone. Doctor's hand fills
the lower-left third of the frame, phone screen the centre,
soft desktop monitor in the upper-right third. Negative space
in the upper-left.

Camera and lens: shot on a Leica Q2, fixed 28mm Summilux f/1.7
lens, aperture wide open at f/2.0, ISO 400, shutter 1/200,
handheld documentary style. Shallow depth of field with the
phone screen tack sharp and the monitor in creamy bokeh.

Materials and texture: photorealistic skin texture on the
doctor's hand — visible pores, faint freckling on the knuckle,
a slight wrinkle across the index finger joint, a single thin
veining line. The phone is a current-generation iPhone with a
faint fingerprint smudge on the lower edge of the screen and a
hairline scratch catching the light. The wooden desk shows
real grain and one small ring stain. The monitor bezel has
faint dust visible in the bokeh.

Colour grade: muted editorial palette — warm cream highlights,
deep ink-black shadows, low overall saturation, very gentle
green and amber cast from the window light, natural fine film
grain throughout. No HDR, no oversaturation, no orange-and-teal
colour grading. Reminiscent of a Kinfolk magazine spread or a
New York Times Magazine clinical-feature photo essay.

The doctor's hand is holding the phone with a relaxed natural
grip — five fingers, anatomically correct, the thumb resting
gently on the right edge of the phone, the index finger curved
around the back of the device near the camera bump, the middle
ring and little fingers folded naturally beneath. The hand
belongs to a working clinician in their early 40s, slightly
veined, no jewellery, no watch, clean trimmed fingernails.
Wrist disappears into a softly out-of-focus charcoal long-
sleeve shirt cuff.

Style: editorial documentary photojournalism. Quiet,
considered, intimate, real. The kind of photograph that would
illustrate a feature article in the FT Weekend magazine or
Monocle.

Fidelity: photorealistic, RAW unprocessed look, natural film
grain, accurate skin tones, no plastic smoothing, no rim
lighting effects, no studio-light glow, no sterile clinical-
stock aesthetic, no symmetrical composition, no perfectly
centred subject.

Negative constraints: no text on the monitor except a single
small "Download" button, no logos on the phone, no Apple logo
visible, no medical illustration aesthetic, no stock-photo
clinical look, no white coat, no stethoscope around anyone's
neck, no overhead fluorescent tubes, no harsh shadows, no
extra hands or fingers, no deformed anatomy, no watermark, no
border, no caption.
```

---

## 11. Quick-reference checklist (when writing a new prompt)

- [ ] Open with the subject in plain language
- [ ] Name the scene specifically (place, time of day, season if relevant)
- [ ] Specify camera body, lens, aperture, ISO, shutter
- [ ] Describe lighting direction, source, Kelvin temperature
- [ ] List 3-5 explicit imperfections (pores, dust, smudges, wrinkles, scratches)
- [ ] Anchor the colour grade with an editorial publication name
- [ ] Describe hands finger-by-finger if any are in frame
- [ ] Keep screen text minimal or use bokeh
- [ ] Add the negative-constraint block
- [ ] Include "RAW unprocessed look" + "no HDR, no rim lighting, no studio glow"
- [ ] Aim for 250-500 words total
- [ ] Generate 4-6 variations, then refine the winner via reference-image input

---

## 12. Sources (full list)

- [Nano Banana Pro: Gemini 3 Pro Image — Google blog](https://blog.google/innovation-and-ai/products/nano-banana-pro/)
- [Gemini 3 Pro Image — Google DeepMind](https://deepmind.google/models/gemini-image/pro/)
- [Nano Banana Pro for Enterprise — Google Cloud Blog](https://cloud.google.com/blog/products/ai-machine-learning/nano-banana-pro-available-for-enterprise)
- [Nano Banana 2 launch — Google blog](https://blog.google/innovation-and-ai/technology/ai/nano-banana-2/)
- [Nano Banana 2 — TechCrunch](https://techcrunch.com/2026/02/26/google-launches-nano-banana-2-model-with-faster-image-generation/)
- [Gemini AI image generator overview](https://gemini.google/overview/image-generation/)
- [Ultimate Prompting Guide for Nano Banana — Google Cloud](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)
- [Nano Banana Pro Prompting Guide & Strategies — Google AI on dev.to](https://dev.to/googleai/nano-banana-pro-prompting-guide-strategies-1h9n)
- [Nano Banana Prompting Tips — Google blog](https://blog.google/products/gemini/prompting-tips-nano-banana-pro/)
- [How to prompt Gemini 2.5 Flash Image Generation — Google Developers](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/)
- [Leonardo.ai Nano Banana Prompt Guide](https://leonardo.ai/news/nano-banana-prompt-guide/)
- [Best prompt structure for Nano Banana Pro realism — Sider](https://sider.ai/blog/ai-image/best-prompt-structure-for-nano-banana-pro-realism-a-practical-guide)
- [Nano Banana Pro Complete Guide 2026 — AVB](https://aivideobootcamp.com/blog/nano-banana-pro-complete-guide-2026/)
- [How to Write Prompts for Photorealistic AI Images 2026 — artsmart.ai](https://artsmart.ai/blog/ai-image-prompts-photorealistic/)
- [Advanced Prompt Techniques for Hyper-Realistic Results — stockimg.ai](https://stockimg.ai/blog/prompts/advanced-prompt-techniques-getting-hyper-realistic-results-from-your-ai-photo-generator)
- [How to Fix AI Hands: Complete Guide 2026 — zsky.ai](https://zsky.ai/blog/how-to-fix-ai-hands)
- [AI Hands, Anatomy & Body Fixes — GensGPT](https://www.gensgpt.com/blog/ai-hands-anatomy-body-fixes-common-errors-2026-guide)
- [Awesome Nano Banana Pro — GitHub repo of curated prompts](https://github.com/ZeroLu/awesome-nanobanana-pro)

---

## 13. Integration: laozhang.ai gateway + Claude Code setup

This section documents how Claude Code generates Nano Banana Pro images for project work (Miozuki = first adopter). All §1 to §12 content above is the source of truth for *what* to put in a prompt — this section is about *how* to run it from inside Claude Code.

Added 2026-04-08.

### 13.1 Why laozhang.ai

- Gateway service that proxies Google's Gemini image API at ~80% discount versus going direct.
- Endpoint: `https://api.laozhang.ai/v1beta/models/{model}:generateContent`
- Auth: `Authorization: Bearer ${LAOZHANG_API_KEY}` header.
- Models available:
  - `gemini-3.1-flash-image-preview` — Nano Banana 2 (faster, ~$0.045/image, default)
  - `gemini-3-pro-image-preview` — Nano Banana Pro / Gemini 3 Pro Image (~$0.05/image, higher fidelity)
- Aspect ratios supported: `1:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`
- Sizes: `1K`, `2K` (default for landing-page work), `4K`
- Image-to-image: pass up to 14 reference images via `inline_data` parts in the same `contents` array. Use this for iteration (text-only v1, then refine via ref).
- **Not supported**: negative prompts as a separate field (encode negatives in the prompt text per §7), seed control (each call is fresh).
- Docs: https://docs.laozhang.ai/api-capabilities/nano-banana-pro-image

### 13.2 Environment variable

- **Name**: `LAOZHANG_API_KEY`
- **Where**: project's `.env.local` (gitignored by Next.js default).
- **Vercel**: NOT required. Generation runs locally only. Outputs are committed as static assets to `public/generated/`. Zero runtime API exposure on production.
- **Verification**: `git check-ignore .env.local` should print the path before committing anything else.

### 13.3 Claude Code script setup (per-repo footprint)

| File | Purpose |
|------|---------|
| `scripts/gen-image.mjs` | Node 20+ ESM script. No deps. Native `fetch`, `node:fs/promises`. CLI flags: `--prompt` (required), `--out` (required), `--aspect` (default `16:9`), `--size` (default `2K`), `--model` (default `gemini-3.1-flash-image-preview`), `--ref` (repeatable, path to local image for img2img). |
| `scripts/prompts/_templates.md` | Brand-locked starter scaffolds. Each scaffold is intentionally incomplete — must be expanded per §2 to reach 250 to 500 words before generating. |
| `scripts/prompts/<slot>.prompt.md` | Sidecar audit trail. One per generated image. Captures: final expanded prompt, model used, date, sign-off-gate reviewer, decision (commit / regenerate / fall-back). |
| `public/generated/.gitkeep` | Outputs land here. Committed (not gitignored) — the deployed site references them as static assets. |
| `package.json` | Add script: `"gen-image": "node --env-file=.env.local scripts/gen-image.mjs"` |

Invocation:

```bash
npm run gen-image -- \
  --prompt "<full 250-500 word prompt expanded from §2 template>" \
  --aspect 16:9 \
  --size 2K \
  --out public/generated/<slot-name>.jpg
```

For image-to-image refinement:

```bash
npm run gen-image -- \
  --prompt "<refinement instructions>" \
  --ref public/generated/<previous-output>.jpg \
  --out public/generated/<slot-name>-v2.jpg
```

### 13.4 Iteration workflow with Claude Code

**Critical**: every generation cycle starts by re-reading the canonical prompt-engineering content above. The `_templates.md` scaffolds are deliberately incomplete to force this step — Claude Code MUST not skip it.

1. **Re-read** §2 (7-part template), §3 (photographic language), §4 (anti-AI techniques), §7 (negative constraints), and §11 (checklist) before writing the prompt.
2. **Write the prompt** in the target slot's sidecar `.prompt.md` file under `scripts/prompts/`, expanded per §2 to 250 to 500 words. Apply the §11 checklist as a self-review.
3. **Generate v1** (text-only) via `npm run gen-image`.
4. **Apply the project sign-off gate** (smell test for AI tells, brand palette check, real-photographer test, owner approval). For Miozuki this is plan §5.5.
5. **Iterate if needed**: pass v1 as `--ref` and write a refinement prompt focusing on what to fix. Up to 14 ref images supported per call. Hands and faces typically need 2 to 3 iterations per §5 and §6.
6. **Commit** the final image to `public/generated/` along with its `.prompt.md` sidecar in `scripts/prompts/`. The commit message should reference the sidecar path so future audits can trace the prompt.

### 13.5 Cost guardrails

- Flash model: ~$0.045 per generation. Pro: ~$0.05.
- Recommended sprint cap: 20 generations (~$1) for a Sprint 1 batch. Plenty of headroom for 2 to 3 candidates per slot across ~7 slots.
- If a slot fails the sign-off gate twice, fall back to a typographic or abstract treatment instead of burning more generations. The gate is non-negotiable.

### 13.6 Per-repo adoption status

| Repo | Status | Notes |
|------|--------|-------|
| `miozuki-web` | First adopter (planned) | Sprint 1.5 sets up the script + first 3 generated images. |
| `clinicpro-saas` | Not yet | Could adopt for marketing site assets if useful — separate scoping decision. |
| `clinicpro-medtech` | Not in scope | Clinical product, no marketing imagery. |
| `nexwave-rd` | Not in scope | R&D track, isolated from commercial assets. |
