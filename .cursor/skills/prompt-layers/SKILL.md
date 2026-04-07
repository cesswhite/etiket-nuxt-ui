---
name: prompt-layers
description: Structure image or LLM prompts as LAYERS (like photo-editing layers)—each layer builds on the previous, with FORBIDDEN before REQUIRED in every layer. Use when writing or refactoring prompts for Nano Banana, Campaign, Hero, Tattoo, Photoshoot, or new image/LLM sections in nananuxt so the model reads and applies rules correctly.
---

# Layered prompt structure (prompt layers)

Use this skill when you **add, change, or refactor prompts** sent to image or LLM APIs (Nano Banana Pro / Gemini, Campaign, Hero, Tattoo, Photoshoot) so the model receives a clear, ordered set of instructions and applies prohibitions and requirements correctly.

## 1. What “layers” means

Think of the prompt like **layers in a photo editor**: each layer sits on top of the previous one and builds on it. The model (e.g. Gemini) parses section headers and applies **FORBIDDEN** (what must never appear) before **REQUIRED** (what must appear), reducing contradictions and visual artifacts (e.g. letterboxing, extra limbs).

## 2. Non-negotiable rules

1. **Separator:** Layers are separated by **double newline** (`\n\n`). In code: `const LAYER_SEP = '\n\n'` and `layers.join(LAYER_SEP)`.
2. **Header per layer:** Every layer starts with `[LAYER N — TITLE]` (e.g. `[LAYER 0 — BASE]`, `[LAYER 1 — FRAME & FORMAT]`). Sequential N; title short and descriptive.
3. **Inside every layer:** Order is always **FORBIDDEN first**, then **REQUIRED**. No layer is REQUIRED-only—including store-built layers (e.g. Campaign L6/L7/L8, Photoshoot L4/L5). Add a short FORBIDDEN line when building those in the store.
4. **L0 must include:**  
   - **Professional persona** in REQUIRED (e.g. “Act as a professional marketing and campaign photographer.”).  
   - **No Frames/Borders** in FORBIDDEN: for Nano Banana, L0 must forbid frame, border, black bars, letterboxing, pillarboxing, empty margins, large empty zones at edges. This prevents the model’s tendency to add letterboxing.
5. **Language in REQUIRED:** Natural, cinematic language—full sentences and prepositional phrases. Avoid long comma-separated tag lists; prefer short sentences that read like a brief.
6. **Selects and presets:** Inject into the **REQUIRED** block of the layer that matches their purpose, as fluent sentences (e.g. “Light falls on the scene as …”), not raw “Key: value” lines.
7. **User copy (headline, CTA, tagline):** Sanitize before interpolating into the prompt: trim, collapse whitespace (including newlines) to a single space, and replace double quotes with single quotes so the prompt string stays valid. Example: `sanitizeCopyText(stateStore.headline ?? '')` in Campaign L7.

## 3. Structure within each layer

Every layer must follow:

```text
[LAYER N — TITLE]
FORBIDDEN: <contextual prohibitions>.
REQUIRED: <what the model must do, in natural language>.
```

- **FORBIDDEN:** What the model must **never** do (e.g. container blur, extra limbs, letterboxing, contradicting the selected option).
- **REQUIRED:** What the model **must** do. Use clear labels so the model can parse them.

When the store builds a layer (e.g. style choices, copy, batch, scene, pose), prepend a short FORBIDDEN line, then `REQUIRED: ` + content. Example for a “style” layer:

```text
FORBIDDEN: contradicting the chosen format, product role, or brand tone. REQUIRED: The asset is for ...
```

## 4. Per-section layer map (data file → store)

| Section     | Data file                  | Store (build prompt)       | Layer sequence |
|------------|----------------------------|----------------------------|----------------|
| Campaign   | `app/data/campaignOptions.ts` | `app/stores/images/campaign.ts` | L0 BASE → L1 FRAME → L2 CONTENT → L3 REALISM → L4 BRAND → L5 TYPOGRAPHY or NO TYPOGRAPHY → L6 STYLE → L7 COPY → L8 BATCH (optional). |
| Hero       | `app/data/heroOptions.ts`  | `app/stores/images/hero.ts`    | L0 BASE → L1 FRAME → L2 CONTENT → L3 STYLE → L4 BATCH (optional). |
| Tattoo     | `app/data/tattooOptions.ts`| `app/stores/images/tattoo.ts`  | L0 BASE (design_only \| person_shot \| couples) → L1 SUBJECT & PLACEMENT → L2 RENDER → L3 SAFETY → L4 BATCH (optional). |
| Photoshoot | `app/data/photoshootOptions.ts` | `app/stores/images/photoshoot.ts` | L0 BASE → L1 QUALITY → L2 IDENTITY & ANATOMY → L3 CLOTHING → L4 SCENE → L5 POSE & STYLE. |

- **Data file:** Export layer constants (e.g. `SECTION_LAYER_0_BASE`, `SECTION_LAYER_1_...`) with FORBIDDEN and REQUIRED text; export option arrays and presets.
- **Store:** `buildSectionPrompt(stateStore)` (or equivalent) builds an array of strings: each element is `[LAYER N — TITLE]\n` + layer content. Join with `LAYER_SEP`. For layers built in the store (no constant), include a FORBIDDEN line then REQUIRED.

## 5. Campaign-specific details

- **L0:** `CAMPAIGN_LAYER_0_BASE` must include FORBIDDEN (illustration, 3D, anime, **frame, border, letterboxing**, …) and REQUIRED starting with “Act as a professional marketing and campaign photographer.”
- **L5:** If `fontId` and not `'neutral'` → typography overlay (gradient + text; use `CAMPAIGN_LAYER_5_TYPOGRAPHY_*`). Else → `[LAYER 5 — NO TYPOGRAPHY]` with `CAMPAIGN_LAYER_5_VISUAL_ONLY` (no text in image).
- **L6:** Prepend `FORBIDDEN: contradicting the chosen format, product role, or brand tone. REQUIRED: ` before the style sentences.
- **L7:** After header, add line `FORBIDDEN: adding headline, CTA, or typography that was not provided; contradicting the brand tone or values.` Then `REQUIRED: ` + copy content. Use `sanitizeCopyText()` for headline, CTA, tagline.
- **L8:** Prepend `FORBIDDEN: repeating the same scenario, action, or setting as another image in this batch. REQUIRED: ` before the batch text. Only when `batchTotal > 1 && batchIndex >= 1`.

## 6. Hero-specific details

- **L0:** `HERO_LAYER_0_BASE` already has FORBIDDEN (frame, letterboxing, …) and persona.
- **L3:** `HERO_LAYER_3_STYLE` must include FORBIDDEN (e.g. “visual style or context that does not match the selected industry and options above”) before REQUIRED.

## 7. Tattoo-specific details

- **L0:** Exactly one of `TATTOO_LAYER_0_DESIGN_ONLY`, `TATTOO_LAYER_0_PERSON_SHOT`, `TATTOO_LAYER_0_COUPLES` (mutually exclusive: check `isCouples` then `isPersonShot = shotType && shotType !== 'design_only'`).
- **L1:** Use `TATTOO_LAYER_1_FORBIDDEN` then `REQUIRED: ` + placement/motif sentences. Constant in `tattooOptions.ts`, assembly in `tattoo.ts`.

## 8. Photoshoot-specific details

- **L0:** `PHOTOSHOOT_LAYER_0_BASE` has FORBIDDEN (frame, vignette, border, …) and persona.
- **L3:** Keep/Adapt/Fitness variants all have FORBIDDEN before REQUIRED (Keep: “changing or replacing any garment…”; Adapt: “clothing that conflicts with the chosen environment or action…”).
- **L4:** When building in store, prepend `FORBIDDEN: environment or camera choice that contradicts the selected options. REQUIRED: `.
- **L5:** When building in store, prepend `FORBIDDEN: expression or pose that conflicts with the chosen mood or action. REQUIRED: `.

## 9. Validation checklist (Nano Banana Pro alignment)

When adding or editing layered prompts, ensure:

- [ ] Each layer has `[LAYER N — TITLE]` and is separated by `\n\n`.
- [ ] **Every** layer has FORBIDDEN before REQUIRED (including store-built layers).
- [ ] L0 includes professional persona and No Frames/Borders/letterboxing in FORBIDDEN.
- [ ] Forbidden terms are contextualized (e.g. “no extra limbs” in anatomy layer, “no container blur” in typography).
- [ ] User copy (headline, CTA, tagline) is sanitized before being placed in the prompt.
- [ ] Selects/presets map to a single layer’s REQUIRED block as fluent prose.
- [ ] Sequence is strict: base → frame/format → content → … → style/copy → optional batch.

Full audit criteria and scoring: see `docs/audit-nano-banana-pro-validator.md`. For a quick validation protocol reference, use the **nano-banana-validator** skill.

## 10. When to use this skill

- Writing or refactoring prompts for Nano Banana, Campaign, Hero, Tattoo, Photoshoot, or a **new** image section.
- Adding a new layer or a new section: define layer constants (FORBIDDEN then REQUIRED) in the section’s data file and assemble in the store with `[LAYER N — TITLE]` and `\n\n`; ensure store-built layers also get a FORBIDDEN line.
- Auditing or reviewing prompt code for protocol compliance (structure, persona, no frames in L0, copy sanitization, FORBIDDEN in every layer).

## 11. New section (short)

For a new image section (e.g. “Change hairstyle”): (1) Define layers (e.g. BASE → IDENTITY → HAIR & STYLE → SAFETY). (2) Data file: option arrays + layer constants (FORBIDDEN then REQUIRED); L0 with persona and no frames. (3) Store: `buildXPrompt(stateStore)` returning layers joined by `LAYER_SEP`; inject selects into the appropriate layer’s REQUIRED as fluent sentences; if a layer is built only in the store, add a short FORBIDDEN line before REQUIRED. (4) Sanitize any user-provided text before interpolating. See also `docs/layered-prompt-architecture-for-llms.md` and the **nananuxt-image-section** skill for UI/state/API patterns.
