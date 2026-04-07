# Image section – paths and quick reference

## Shared utils

| Purpose        | Path                           | Exports                                                                                                   |
| -------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Error & toasts | `app/utils/imageGeneration.ts` | `getErrorMessage`, `showErrorToast`, `generateId`                                                         |
| Random & batch | `app/utils/random.ts`          | `pickRandom`, `getBatchVariationSuffix`, `HERO_BATCH_VARIATION_PHRASES`, `TATTOO_BATCH_VARIATION_PHRASES` |

## All files for section id `{id}` (e.g. `hero`)

| Step           | Path                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------- |
| Data           | `app/data/{id}Options.ts`                                                                |
| State          | `app/stores/images/{id}State.ts`                                                         |
| Actions        | `app/stores/images/{id}.ts`                                                              |
| Container      | `app/components/Dashboard/Images/{PascalId}/Container.vue`                               |
| GeneralFilters | `app/components/Dashboard/Images/{PascalId}/GeneralFilters.vue`                          |
| StyleCard      | `app/components/Dashboard/Images/{PascalId}/StyleCard.vue` (or StylePlacementCard, etc.) |
| Generate       | `app/components/Dashboard/Images/{PascalId}/Generate.vue`                                |
| ResetCard      | `app/components/Dashboard/Images/{PascalId}/ResetCard.vue`                               |
| Carousel       | `app/components/Dashboard/Images/{PascalId}/Carousel.vue`                                |
| Page           | `app/pages/app/images/{id}.vue`                                                          |
| Sidebar        | `app/components/Dashboard/Sidebar/Container.vue` (add one child)                         |
| Surprise util  | `server/utils/surprise.ts` (add `{id}SurprisePrompt`)                                    |
| Surprise API   | `server/api/surprise.ts` (handle `context === '{id}'`)                                   |

`{PascalId}` = section id with first letter uppercase (e.g. `hero` → `Hero`).

## Pinia import (required in every store file)

```ts
import { acceptHMRUpdate, defineStore } from "pinia";
```

Use in: `*State.ts` and `*.ts` under `app/stores/images/`.

## Option interface (data file)

```ts
export interface {PascalId}Option {
  id: string
  label: string
  prompt: string
  description?: string
}
```

## Preset interface (optional, e.g. Tattoo)

```ts
export interface TattooPreset {
  id: string;
  label: string;
  description: string;
  tattooStyle: string;
  bodyPart: string;
  subjectType: string;
  colorMode: string;
  healingState?: string;
  personGender?: string;
  environment: string;
  filter: string;
  shotType: string;
  customPrompt?: string;
}
```

## State store – minimal state shape

- `resolution`, `aspectRatio`, `safetyFilterLevel`, `batchSize`
- One key per select (same id as in options)
- `customPrompt`, `images`, `selectedImageId`
- `loadingGenerate`, `loadingGpt` (if Enhance), `loadingSurprise` (if Surprise), `error`
- Optional: `presetId` (when section has presets)
- Optional: `batchProgress: null as { current: number; total: number } | null` (for batch sections)

When section has presets: every `set*` for a select must set `this.presetId = ''`. Add `applyPreset(preset)` that sets `presetId` and all preset fields (and `customPrompt` if preset has it).

## Container – error display

- `UAlert` when `error` is set: `close` prop, `@update:open="(open) => { if (!open) imageStateStore.setError(null) }"`.
- Error toasts from stores use `showErrorToast()` with default persistent (`duration: 0`).

## Batch progress (Hero / Tattoo)

- State: `batchProgress: { current, total } | null`; action `setBatchProgress(progress)`.
- In `generateBatch`: set `batchProgress` at start of loop and each iteration; in `finally` set `batchProgress(null)` and `setLoadingGenerate(false)`.
- Generate.vue: show "Generating X of Y" when `batchProgress` is set; keep button loading.

## Tattoo – batch random variety

- Do **not** mutate state (bodyPart, personGender, environment, subjectType) during the loop.
- `buildTattooPrompt(stateStore, batchVariation, overrides?)`: when `overrides` is provided, use overrides for those keys instead of state.
- `generateImage(batchId, overrides?)`: pass overrides to `buildTattooPrompt`; when building `promptParams` for the saved image, use overridden values so the modal shows what was actually used.
- `generateBatchRandomVariety(count)`: each iteration call `generateImage(batchId, { bodyPart: pickRandom(BODY_PART_OPTIONS).id, ... })`.

## Nanobanana request body

```ts
{
  prompt: string,
  isPro: true,
  aspect_ratio: string,
  output_format: 'png',
  resolution: string,
  safety_filter_level: string
}
```

Photoshoot: add `image_input: [seedUrl]` when using a seed image.

## Surprise – server side

- `server/utils/surprise.ts`: export `{id}SurprisePrompt` (string, system-style instructions).
- `server/api/surprise.ts`: read `body.context`; if `context === '{id}'`, use `{id}SurprisePrompt` and build `userMessage` from body (e.g. `aestheticLabel`, `productPresenceLabel`, `environmentLabel`, `moodLabel`); return `{ success: true, data: { text } }`.

Contexts implemented: `hero`, `tattoo`, `photoshoot`.
