# Miozuki prompt templates — starter scaffolds

These are intentionally **incomplete**. Before generating, you MUST re-read:

- `docs/context/miozuki-nano-banana-image-guide.md` §2 (7-part template)
- §3 (photographic language: cameras, lenses, film, publications)
- §4 (anti-AI techniques: RAW look, imperfections, no HDR)
- §5 (hands — high risk; jewellery-on-hand is HIGH risk for AI)
- §6 (screens / on-image text — high risk)
- §7.1 (Miozuki negative-constraint block, append verbatim)
- §11 (quick-reference checklist before clicking generate)

Then expand each scaffold to 250–500 words covering all 7 parts: Subject, Scene, Lens/aperture, Lighting direction, Materials/textures, Colour grade, Fidelity constraints.

---

## Miozuki-specific rules (apply to every prompt)

- **Brand palette anchor**: cream `#F5F0E9` and deep burgundy `#7B1E22`, charcoal `#1A1A1A` for shadow detail. No off-brand hues, no neon, no orange-and-teal grading.
- **Editorial publication anchors that map to the brand**: Kinfolk magazine spread, Cereal magazine still life, Vogue Italia jewellery editorial, Wallpaper* product photography, Monocle quiet documentary. Avoid Vogue US / Harper's Bazaar (too glossy).
- **Film stock**: prefer Kodak Portra 400 (warm editorial), Cinestill 800T (mood / blue-hour), Fujifilm Velvia 50 (saturated naturalist).
- **Camera bodies**: Hasselblad H6D-50c or 907X for hero/still-life, Leica Q3 for documentary mood, Fujifilm GFX 100 II for medium-format editorial. Skip Sony A7 line.
- **Light direction default**: soft Auckland window light from camera left at 30°, single source, 4500K, hard shadow falloff on the right.
- **Hands**: NEVER include hands holding jewellery in AI work. Per guide §5, jewellery-on-hand is the highest AI-tell category.
- **Jewellery in frame**: NEVER. AI cannot render moissanite fire, prong settings, or pearl lustre convincingly. All Miozuki AI shots are jewellery-free mood imagery.
- **Negative constraints — ALWAYS append guide §7.1** (full Miozuki block; it already includes jewellery / hands / faces rules plus standard photographic negatives)

---

## Scaffold 1: Editorial mood band (16:9 or 21:9)

Use case: homepage section backgrounds (e.g. Accessible Luxury band), about-page imagery, atmospheric content separators.

```
SUBJECT:    [cream linen still life with burgundy silk drape and ceramic vessel | water ripples
            on dark cream paper | folded burgundy silk macro | brass tray with cream candle]
SCENE:      Auckland window-lit room, late afternoon, 4500K
LENS:       Hasselblad H6D-50c, 80mm f/2.2, shallow DoF
LIGHTING:   single warm window from camera left at 30°, hard shadow falloff right
MATERIALS:  visible linen weave, silk grain, ceramic crackle glaze, fine grain film stock
COLOUR:     Kodak Portra 400 grade, cream + deep burgundy + charcoal only
FIDELITY:   editorial Kinfolk magazine still life, no jewellery in frame, mood-only,
            shot RAW unprocessed, slight imperfection, off-centre composition
```

Then expand to 250-500 words per guide §2 → append §7.1 verbatim.

---

## Scaffold 2: Blog hero (16:9)

Use case: content hub article hero images (moissanite + pearl hubs, ~10 articles total).

```
SUBJECT:    article-specific. Examples:
            - "akoya vs freshwater" → loose pearl varieties on porcelain dish (NEVER set pieces)
            - "mohs hardness guide" → abstract moissanite crystal on dark velvet (do NOT
              resemble a real product)
            - "moissanite care guide" → soft cloth on cream marble, no jewellery
SCENE:      cream or burgundy minimal background, generous negative space top + bottom
            for headline overlay
LENS:       Leica Q3, 28mm f/1.7 wide open
LIGHTING:   soft diffuse north-facing window, single source
MATERIALS:  natural texture, no plastic, no synthetic shine
COLOUR:     Cinestill 800T mood grade, brand palette only
FIDELITY:   Kinfolk editorial style, room for typography, RAW unprocessed
```

---

## Scaffold 3: Atmospheric brand background (21:9 or 16:9)

Use case: section backgrounds with text overlay, hero secondary imagery.

```
SUBJECT:    abstract texture only — water surface ripples, moon reflection on dark cream
            paper, burgundy silk fold, crumpled linen
SCENE:      blue-hour or low-key, mostly negative space
LENS:       Leica M11, 50mm f/1.4 wide open
LIGHTING:   single low-angle window or candlelight equivalent
MATERIALS:  fabric weave or paper grain, palpable
COLOUR:     Cinestill 800T blue-hour grade, brand palette
FIDELITY:   minimalist Cereal magazine aesthetic, mostly negative space, no subjects
```

---

## Scaffold 4: OG card / typographic background (16:9 → resized 1200×630)

Use case: OpenGraph card background. **Do not generate text — overlay it later.**

```
SUBJECT:    typographic background ONLY (no text in image). Cream #F5F0E9 with subtle
            burgundy #7B1E22 decorative diamond divider top and bottom, magazine masthead
            aesthetic, generous central negative space for wordmark overlay
SCENE:      flat editorial spread
LENS:       N/A (this is a graphic, not a photograph)
LIGHTING:   even, no shadow
MATERIALS:  paper grain texture, slight cream warmth
COLOUR:     cream + burgundy ONLY, no other hues
FIDELITY:   magazine masthead aesthetic, ~3% paper noise, central negative space
```

After generation, overlay "Miozuki" Playfair wordmark in real text layer (Photoshop /
Figma / `next/og`). Per guide §6, generated text is HIGH RISK; never let the model
draw the wordmark.

---

## Scaffold 5: Founder / portrait stand-in (4:5 portrait)

**Recommendation: SKIP entirely**. Wait for real founder photo from photography track.

If you must, hands-and-workbench composition with face deliberately out of frame:

```
SUBJECT:    NO hands, NO face. Workbench objects only — leather-bound notebook,
            brass loupe, hand tools on oak surface, cream linen runner
SCENE:      jewellery designer's workbench, north-facing window
LENS:       Leica Q3, 28mm f/1.7
LIGHTING:   soft north-facing window from camera right
MATERIALS:  real wood grain, brass patina, leather pebbling
COLOUR:     Kodak Portra 400, brand palette
FIDELITY:   documentary Monocle aesthetic, NO PEOPLE, NO HANDS
```

Apply guide §5 hands template only if face-out-of-frame hands are unavoidable.

---

## Generation workflow (per slot)

1. Pick scaffold above.
2. Re-read `docs/context/miozuki-nano-banana-image-guide.md` §2, §4, §7.1, §11.
3. Expand scaffold to 250-500 words → save in `scripts/prompts/<slot-name>.prompt.md`.
4. `npm run gen-image -- --prompt "<full prompt>" --out public/generated/<slot>.jpg --aspect 16:9 --size 2K`
5. Sign-off gate (4-point smell test; see guide §13.4 and `docs/context/brand-audit-2026.md` for brand fit).
6. If pass: commit. If fail: refine via `--ref public/generated/<slot>.jpg` and iterate.
7. If fail twice: fall back to typographic / abstract treatment for that slot.

Cost: ~$0.045 per generation (Nano Banana 2 / `gemini-3.1-flash-image-preview`).
Sprint budget cap: 20 generations (~$1) per sprint.
