---
name: nananuxt-image-section
description: Add or change image-generation sections (Hero, Tattoo, Photoshoot) in the nananuxt dashboard. Covers shared utils, data options, Pinia state/actions, presets, batch progress, error handling, Dashboard components, and Surprise API. Use when adding a new section or aligning with existing patterns.
---

# Image-Generation Section (nananuxt)

Use this when adding or updating a **section** under Images (hero, tattoo, photoshoot). Follow existing patterns so behaviour and UX stay consistent.

## Shared utils (use these, do not duplicate)

- **`app/utils/imageGeneration.ts`**
  - `getErrorMessage(error, fallback)` – Unifies API errors (`data.message`, `data.error`, `message`). Use in catch blocks and API response checks.
  - `showErrorToast(message, options?)` – Error toast; default `duration: 0` (persistent). Optional `title`.
  - `generateId(prefix?)` – Unique id for images/batches (crypto.randomUUID or fallback).
- **`app/utils/random.ts`**
  - `pickRandom(arr)` – One random item from array; use for Random button and batch variety.
  - `getBatchVariationSuffix(phrases)` – Batch variation sentence; use `HERO_BATCH_VARIATION_PHRASES` or `TATTOO_BATCH_VARIATION_PHRASES` from same file.

Stores and components should import these instead of redefining equivalent logic.

## Pinia stores – required import

State and action stores **must** import Pinia so `defineStore` is defined at runtime:

```ts
import { acceptHMRUpdate, defineStore } from "pinia";
```

Add this at the top of every `*State.ts` and every `*.ts` store under `app/stores/images/` (e.g. `heroState.ts`, `hero.ts`, `tattooState.ts`, `tattoo.ts`, `photoshootState.ts`, `photoshoot.ts`). Without it, "defineStore is not defined" can occur when loading the section.

## Naming convention

| What             | Pattern                                       | Example (section id: `hero`)   |
| ---------------- | --------------------------------------------- | ------------------------------ |
| URL / route      | `/app/images/{id}`                            | `/app/images/hero`             |
| Page file        | `app/pages/app/images/{id}.vue`               | `hero.vue`                     |
| Data options     | `app/data/{id}Options.ts`                     | `heroOptions.ts`               |
| State store      | `app/stores/images/{id}State.ts`              | `heroState.ts`                 |
| Actions store    | `app/stores/images/{id}.ts`                   | `hero.ts`                      |
| Components dir   | `app/components/Dashboard/Images/{PascalId}/` | `Hero/`                        |
| Component names  | `DashboardImages{PascalId}*`                  | `DashboardImagesHeroContainer` |
| Surprise context | `context: '{id}'` in body                     | `context: 'hero'`              |

Use **camelCase** for the section id in code. PascalCase for component folder and `definePage`/navbar title.

## File checklist (create in this order)

1. **Data** – `app/data/{id}Options.ts`

   - `interface {PascalId}Option { id, label, prompt, description? }`
   - Export `*_ANCHOR` strings and `*_OPTIONS` arrays.
   - Optional: `interface {PascalId}Preset` and `*_PRESET_OPTIONS` (see Tattoo presets below).
   - Export `get{PascalId}PromptById(options, id)`, `getDescriptionById`, `get{PascalId}ParamsForDisplay(params)` (include optional `presetId` in params when section has presets).

2. **State store** – `app/stores/images/{id}State.ts`

   - **First line**: `import { acceptHMRUpdate, defineStore } from 'pinia'`
   - Interfaces: `{PascalId}Image`, `{PascalId}PromptParams` (all select ids + `customPrompt`, `resolution`, `aspectRatio`, `safetyFilterLevel`, `fullPrompt`; optional `presetId` if section has presets).
   - State: resolution, aspectRatio, safetyFilterLevel, batchSize; every select; `images`, `selectedImageId`; loading/error; optional `presetId`; for batch sections add `batchProgress: null as { current: number; total: number } | null`.
   - Actions: `set*` for each select (each must clear `presetId` when section has presets); `addImage`, `removeImage`, `removeBatch` (if batch), `setSelectedImageId`, `setLoadingGenerate`, `setError`, `setBatchProgress` (if batch), optional `applyPreset` (if presets); `reset`.
   - HMR: `import.meta.hot.accept(acceptHMRUpdate(..., import.meta.hot))`.

3. **Actions store** – `app/stores/images/{id}.ts`

   - Import **utils**: `getErrorMessage`, `showErrorToast`, `generateId` from `~/utils/imageGeneration`; for batch variation use `getBatchVariationSuffix` and `*_BATCH_VARIATION_PHRASES` from `~/utils/random`.
   - `build{PascalId}Prompt(stateStore, batchVariation, overrides?)`: build prompt from anchors and ordered selects; if section supports overrides (e.g. Tattoo batch random variety), accept optional overrides and use them instead of state for those keys only. **Prompt structure must follow the prompt-layers skill** (layered format with `[LAYER N — TITLE]`, FORBIDDEN before REQUIRED in every layer, L0 persona and no frames/letterboxing, copy sanitization for user text).
   - `generateImage(batchId?, overrides?)`: call `$fetch('/api/nanobanana', ...)`, then `stateStore.addImage({ id: generateId(), prompt, imageUrl, createdAt, promptParams, batchId? })`. Use `getErrorMessage` in catch and `showErrorToast` for errors.
   - Optional `generateBatch(count)`: set `batchProgress({ current, total })` each iteration; keep loading true between calls; clear `batchProgress` in `finally`.
   - Optional batch variety (e.g. Tattoo): do **not** mutate state for varying dimensions; pass overrides into `generateImage(batchId, overrides)` so UI selects stay fixed.

4. **Components** – `app/components/Dashboard/Images/{PascalId}/`

   - **Container.vue** – Grid: left GeneralFilters + ResetCard; center Carousel; right StyleCard (or Preset + StyleCard) + Generate (sticky). **Error**: show **UAlert** when `error` is set, with `close` and `@update:open` to call `imageStateStore.setError(null)`.
   - **GeneralFilters.vue** – Resolution, Aspect ratio, Safety filter, Batch size. Bind to state.
   - **StyleCard.vue** (or **StylePlacementCard.vue** etc.) – Preset select (if section has presets) then one UFormField per select; optional textarea for custom prompt; buttons Random (use `pickRandom` from `~/utils/random`), Enhance (gpt5nano), Surprise (surprise API with `context: '{id}'`). Use computed get/set for each select. **Every select must use the tooltip pattern** (see below). For errors in Enhance/Surprise use `getErrorMessage` and `showErrorToast` from `~/utils/imageGeneration`.
   - **Generate.vue** – When `batchProgress` exists show "Generating X of Y"; UButton "Generate" calling `generateImage()` or `generateBatch(batchSize)`.
   - **ResetCard.vue** – Button that calls `imageStateStore.reset()`.
   - **Carousel.vue** – Selected image large; thumbnails (single + batch groups); UModal with params from `get{PascalId}ParamsForDisplay(img.promptParams)`; menu: View full screen, Download, Upload (useBunnyStore), Delete; batch: Download as ZIP, Delete batch. All labels in English. Filename prefix e.g. `hero-`, `tattoo-`.

5. **Page** – `app/pages/app/images/{id}.vue`

   - NuxtLayout name="dashboard", UDashboardPanel, UDashboardNavbar title="Section Title", template #body with Container.
   - `useSeoMeta({ title, description })`.

6. **Sidebar** – `app/components/Dashboard/Sidebar/Container.vue`

   - Add under Images: `{ label: 'Section Title', to: '/app/images/{id}' }`.

7. **Surprise API** (optional) – `server/api/surprise.ts` + `server/utils/surprise.ts`
   - In handler: detect `body.context === '{id}'`; build `userMessage` from optional body labels.
   - In `surprise.ts`: add `export const {id}SurprisePrompt = '...'`; in API use it when `context === '{id}'`.

## Section-specific patterns

- **Hero** – Batch with `batchProgress`; Random/Enhance/Surprise in StyleCard; no presets.
- **Tattoo** – **Presets**: define `TattooPreset` and `TATTOO_PRESET_OPTIONS` in data; state has `presetId` and `applyPreset(preset)`; every `set*` clears `presetId`. Preset can set `customPrompt` (e.g. couple tattoo context). **Batch random variety**: `generateBatchRandomVariety(count)` uses `pickRandom` to build overrides (bodyPart, personGender, environment, subjectType) and calls `generateImage(batchId, overrides)` without mutating state. Save `presetId` in promptParams and show in `getTattooParamsForDisplay`.
- **Photoshoot** – **Seed**: state has seedMode, seedFile, seedUrl, seedPreviewUrl, seedUploadedUrl, seedGeneratePrompt; ensureSeedUploaded before generatePose. **Seed status**: in GeneratePose show a short status line ("Seed required" / "Seed ready" / "Generating seed...") with smooth transition. **Surprise + Enhance**: state has `loadingGpt`, `loadingSurprise`; in PoseFilters (or equivalent) add Enhance and Surprise for the pose prompt; Surprise API must handle `context: 'photoshoot'` and `photoshootSurprisePrompt`. No batch; no batchProgress. For parity with Hero/Tattoo, add `description?` to `PhotoshootOption` and `getDescriptionById` in data; use the **selects tooltip pattern** (description in tooltip only) in PoseFilters and CameraLightingCard (see [section-parity.md](section-parity.md)).

## Prompt order in build\*Prompt

1. Anchors (base + composition/emotion if used).
2. Layout: composition, subject/focus position.
3. Visual effect: visual style.
4. Environment: lighting, background.
5. Content: product presence, aesthetic (or section-equivalent).
6. Emotion/context: mood, photo context.
7. Custom prompt.
8. Batch variation suffix if `batchVariation` (use `getBatchVariationSuffix(phrases)`).

## API

- **Generate**: `POST /api/nanobanana` – body: `{ prompt, isPro: true, aspect_ratio, output_format: 'png', resolution, safety_filter_level }`; optional `image_input` for Photoshoot. Response: `{ output: string }`.
- **Enhance**: `POST /api/gpt5nano` – body: `{ prompt: context + userIdea, model: 'gpt-5-nano' }`. Response: `{ success, data: { text } }`.
- **Surprise**: `POST /api/surprise` – body: `{ context: '{id}', ...optionalLabels }`. Response: `{ success, data: { text } }`.

## Selects: tooltip only (no description paragraph)

**Every USelect in image sections must have a tooltip and must not show the description in a paragraph below the select.** Label text must be on the **left**, tooltip icon on the **right** (justify-between), vertically centered.

### UFormField `:ui` (required for label + icon to span full width)

Nuxt UI FormField renders `labelWrapper` (flex) with a **single** child `<label>`. That child does not grow by default, so `justify-between` on the inner div has no effect unless the `<label>` gets full width. Use this **exact** `:ui`:

```vue
:ui="{
  wrapper: 'w-full',
  labelWrapper: 'flex items-center w-full min-w-0',
  label: '!flex-1 !min-w-0 w-full',
}"
```

- **wrapper: 'w-full'** – form field container takes full width.
- **labelWrapper** – flex row; keep `w-full min-w-0` (no `justify-between` here; the only child is the label).
- **label: '!flex-1 !min-w-0 w-full'** – the `<label>` is the single flex child; `!flex-1` makes it grow to fill the row so the slot content inside can use full width. The `!` is important so theme defaults don’t override.

### Label slot content

Inside `<template #label>` use **one** div that is the flex row for “label left, icon right”:

```vue
<template #label>
  <div class="flex items-center justify-between w-full min-w-0 flex-1">
    <span>Field name</span>
    <UTooltip :text="tooltipText">
      <UIcon name="i-lucide-info" class="size-4 shrink-0" />
    </UTooltip>
  </div>
</template>
```

- The inner div needs **flex-1** so that when it’s the only content inside the `<label>`, it expands (the `<label>` already has full width from the `:ui` above).
- **shrink-0** on the icon avoids the icon shrinking.

### Tooltip text

- **With option descriptions**: `tooltipText = computed(() => getDescriptionById(OPTIONS, value) || 'General description of this field.')` — selected option’s description, or general when none selected.
- **Without option descriptions** (e.g. Resolution, Safety filter, Batch size): use a **static** `text="Short general description."` on UTooltip.

### Other rules

- **No `<p>` below the select** – description only in the tooltip.
- Apply this in: StyleCard/StylePlacementCard, GeneralFilters, PoseFilters, CameraLightingCard, PresetCard, CreateCampaignCard (font), and any new section that adds selects.

## Language: English only

**All user-facing and prompt text must be in English.** This applies to:

- **Data options** (`*Options.ts`): every `label`, `prompt`, and `description` in option arrays (e.g. `CAMPAIGN_IDEA_OPTIONS`, `CAMPAIGN_FORMAT_OPTIONS`). No Spanish or other languages.
- **UI copy**: form labels, button text, menu items (e.g. "Upload", "Delete batch", "View full screen"), toasts, error messages, tooltips. Use English only.
- **Prompts sent to APIs**: anchors, batch diversity text, variation hints, and any concatenated prompt parts must be in English so model output and behaviour stay consistent.

When adding or editing an image section (Hero, Tattoo, Photoshoot, Campaign), use English for every new or changed string. If you find existing copy in another language, change it to English.

## Section parity and cross-section features

Keep layout, tooltips, descriptions, and UX patterns **identical** across Hero, Tattoo, Photoshoot, and Campaign; only content (options, labels, prompts) is section-specific.

- **Full analysis**: [section-parity.md](section-parity.md) – how each section is used, what each has, what to align, when to propagate a change.
- **Propagate to other sections** when the change is a **pattern** (e.g. selects with tooltip only, no description paragraph) or a **concept that fits multiple sections** (e.g. "group of people" for Hero + Photoshoot). Keep section-only features in one place (e.g. tattoo style, body part, seed, batch random variety).
- After changing one section, check: layout, **selects tooltip pattern** (description in tooltip only), data `description?` / `getDescriptionById`, Surprise API labels.

## Reference

- Existing sections: Hero (`hero`), Tattoo (`tattoo`), Photoshoot (`photoshoot`).
- Utils: `app/utils/imageGeneration.ts`, `app/utils/random.ts`.
- Parity: [section-parity.md](section-parity.md).
- For exact prop names and batch handling, grep for `useImageHeroStateStore` / `useImageTattooStateStore` / `useImagePhotoshootStateStore` and mirror.
