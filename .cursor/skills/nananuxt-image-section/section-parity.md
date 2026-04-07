# Section parity: Hero, Tattoo, Photoshoot

This document describes how each image section is used, what each has in common, what differs by design, and what can be aligned so all three share the same **patterns** (layout, tooltips, descriptions, UX) while keeping section-specific content.

Use this when adding or changing a section so you can:
1. Keep layout and UX patterns identical across sections.
2. Decide whether a new feature (e.g. a new select) belongs in one section only or should be shared (e.g. "group of people" in Hero + Photoshoot).
3. Propagate improvements from one section (e.g. Hero) to the others where context fits.

---

## How each section is used

| Section     | Purpose | Batch | Seed | Presets | Main cards |
|------------|---------|-------|------|---------|------------|
| **Hero**   | Landscape hero/banner images: minimal, product, lifestyle. | Yes (`batchProgress`, Generate N) | No | No | GeneralFilters, StyleCard, ResetCard, Generate |
| **Tattoo** | Tattoo design images (style, placement, subject, etc.). | Yes (batch + random variety) | No | Yes (TattooPreset) | GeneralFilters, StylePlacementCard, ResetCard, Generate |
| **Photoshoot** | Pose/portrait from a reference (seed). Same person, new pose. | No | Yes (upload/URL/generate) | Yes (preset card) | Seed, GeneralFilters, PresetCard, PoseFilters, CameraLightingCard, ResetPhotoshootCard, GeneratePose |

---

## Layout (already aligned)

All three use the same grid and structure:

- **Container**: `grid-cols-12`, left col 2, center 8, right col 2; `h-[calc(100vh-64px)]`.
- **Left column**: General filters + Reset card (Photoshoot adds Seed above General).
- **Center**: Carousel (Hero/Tattoo: single + batch thumbnails; Photoshoot: poses only, no batch).
- **Right column**: Section-specific cards + sticky Generate at bottom.
- **Error**: UAlert when `error` is set, with close and `@update:open` → `setError(null)`.

Photoshoot has one extra left block (Seed) and two extra right blocks (PresetCard, CameraLightingCard). That is intentional; layout pattern is the same.

---

## GeneralFilters parity

| Field           | Hero | Tattoo | Photoshoot |
|----------------|------|--------|------------|
| Resolution      | ✅   | ✅     | ✅         |
| Aspect ratio    | ✅ (mobile/desktop/monitor) | ✅ (1:1, match_input, ratios) | ✅ (match_input, ratios) |
| Safety filter   | ✅   | ✅     | ✅         |
| Batch size      | ✅   | ✅     | ❌ (no batch) |

- **Tooltips/descriptions**: None of the three show tooltips or description text under Resolution, Aspect ratio, or Safety filter. If we add them later, use the same pattern in all three (e.g. optional `UTooltip` next to label or one line of `text-muted` below).
- **Options**: Resolution and Safety filter options are identical. Aspect ratio options differ by section (Hero: 9:16, 16:9, 21:9; Tattoo/Photoshoot: more ratios + match_input). Keep section-specific options; only the **pattern** (UFormField + USelect, same card UI) should be shared.

---

## Style / filters cards: tooltips and descriptions

### Pattern to follow (from Hero)

- **Per select**: UFormField with label; USelect; optional **description** below: `<p class="text-xs text-muted mt-1">{{ description }}</p>` using `getDescriptionById(options, stateId)`.
- **Optional**: For one or two key fields, add **UTooltip** next to the label (e.g. Hero’s Composition: `UTooltip :text="compositionDescription"` with info icon).
- **Custom prompt / pose prompt**: UTextarea + two icon buttons with **UTooltip**: "Enhance text" and "Surprise Me".

### Current state

| Element | Hero | Tattoo | Photoshoot (PoseFilters) | Photoshoot (CameraLightingCard) |
|--------|------|--------|---------------------------|----------------------------------|
| Description under each select | ✅ All selects | ✅ Most (Preset, Body part, Subject, Healing, Person, Environment, Filter, Shot type). ❌ Tattoo style, Color | ❌ None | ❌ None |
| UTooltip on a label (info icon) | ✅ Composition only | ❌ None | ❌ None | ❌ None (only one UTooltip for Clothing switch) |
| UTooltip "Enhance text" / "Surprise Me" | ✅ | ✅ | ✅ | — |

**Gaps to close for parity:**

1. **Tattoo**: Add optional `description` in data for Tattoo style and Color where useful; show `<p class="text-xs text-muted mt-1">` like other fields. Optionally add one UTooltip on a label (e.g. Body part or Preset) to match Hero’s pattern.
2. **Photoshoot**: `PhotoshootOption` has no `description?` and there is no `getDescriptionById` in `photoshootOptions.ts`. For parity:
   - Add `description?: string` to `PhotoshootOption` and `getDescriptionById(options, id)` in `photoshootOptions.ts`.
   - In PoseFilters and CameraLightingCard, show description below selects where descriptions exist (same `text-xs text-muted mt-1` pattern).
   - Optionally add one UTooltip on a label (e.g. Mood or Environment) to match Hero.

---

## ResetCard parity

| Section     | Header     | Body text | Action |
|------------|------------|-----------|--------|
| Hero       | "New session" | "Clear all generated images and options to start over." | reset() |
| Tattoo     | "New session" | Same as Hero | reset() |
| Photoshoot | "New session" | "Clear seed, poses, and all options to start a new photoshoot from scratch." | clearSeed() + reset() |

Pattern is aligned: same card UI, same button style; only the copy is section-specific. No change needed.

---

## Carousel + modal parity

- Hero and Tattoo: single images + batch groups; UPopover for batch; UModal fullscreen with "Parameters used" and `get{PascalId}ParamsForDisplay`.
- Photoshoot: single poses only; UModal with "Parameters used" and `getPromptParamsForDisplay` (different name but same role).

Pattern is aligned. Filename prefixes: `hero-`, `tattoo-`, `photoshoot-`. Menu items: View full screen, Download, Subir, Delete (and batch: Download as ZIP, Delete batch where applicable).

---

## Generate button parity

- **Hero**: Shows "Generating X of Y" when `batchProgress` is set; button label same; calls `generateImage()` or `generateBatch(batchSize)`.
- **Tattoo**: Same as Hero (batch + progress).
- **Photoshoot**: No batch. Shows seed status line with transition ("Seed required" / "Seed ready" / "Generating seed..."); button "Generate pose"; calls `generatePose()`.

Photoshoot correctly differs (seed status instead of batch progress). Pattern: one status line + one primary button. Aligned.

---

## Data options: description and getDescriptionById

| Section    | Option interface     | getDescriptionById | Used in UI |
|-----------|------------------------|--------------------|------------|
| Hero      | `HeroOption { description? }` | ✅ `heroOptions.ts` | StyleCard: all selects |
| Tattoo    | `TattooOption { description? }` | ✅ `tattooOptions.ts` | StylePlacementCard: most selects |
| Photoshoot| `PhotoshootOption` (no description) | ❌ | — |

To align Photoshoot with Hero/Tattoo: add `description?: string` to `PhotoshootOption`, implement `getDescriptionById` in `photoshootOptions.ts`, and in PoseFilters and CameraLightingCard render the description below each select when present (same class and structure as Hero/Tattoo).

---

## When to propagate a change to other sections

### Propagate (same pattern, same or adapted content)

- **Layout / structure**: Grid, card order, UAlert, sticky Generate.
- **UX patterns**: Description under select (`text-xs text-muted mt-1`), UTooltip next to label for key fields, UTooltip on Enhance/Surprise buttons.
- **General filters**: Resolution, Aspect ratio, Safety filter (and Batch size only where section has batch).
- **Concepts that apply in multiple sections**: e.g. "Group of people" (solo / couple / group) can apply to **Hero** (hero with one or several people) and **Photoshoot** (single vs group photo); add to both with section-specific labels/prompts. Not to Tattoo (design-focused, not "group of people" in the same way).

### Do not propagate (section-specific)

- **Tattoo-only**: Tattoo style, Body part, Healing state, Presets (couple tattoo, etc.), batch random variety.
- **Photoshoot-only**: Seed (upload/URL/generate), Seed status, Keep seed clothing, Preset card, Pose prompt vs custom prompt.
- **Hero-only**: Composition, Subject position, Product presence, batch without random variety (simple N images).

When adding a new select, ask: "Could this apply to another section with the same meaning?" If yes (e.g. number of people, mood, environment), consider adding it to the other section with the same UI pattern and section-specific options. If no (e.g. tattoo style, body part), keep it in one section.

---

## Checklist after changing one section

When you change Hero, Tattoo, or Photoshoot:

1. **Layout / components**: Did you add a new card or change the grid? If it’s a general pattern (e.g. always show a status line above Generate), consider applying it to the other sections where it makes sense.
2. **Tooltips / descriptions**: Did you add UTooltip or description under a select? Replicate the **pattern** in the other sections (same slot, same classes); content can be section-specific.
3. **Data**: Did you add `description` to options or a new `get*ParamsForDisplay` field? If the other sections have a similar concept, add `description?` and use `getDescriptionById` there too.
4. **Surprise API**: If you added a new label sent to Surprise (e.g. `groupLabel`), add handling in `server/api/surprise.ts` and use it in the prompt for each context where it applies.

---

## Summary: what to align next

1. **Photoshoot options**: Add `description?` to `PhotoshootOption`, add `getDescriptionById` in `photoshootOptions.ts`, and show descriptions in PoseFilters and CameraLightingCard for consistency with Hero/Tattoo.
2. **Tattoo**: Add description below Tattoo style and Color where you have (or add) option descriptions; optionally add one UTooltip on a label.
3. **Photoshoot**: Optionally add one UTooltip on a label (e.g. Mood or Environment) to match Hero’s Composition tooltip pattern.
4. **GeneralFilters**: Optionally add short tooltips or one-line descriptions for Resolution / Aspect ratio / Safety filter in all three sections if you want them; keep the same pattern in each.

Everything that is **already the same** in all three (layout, error UAlert, Reset card structure, Carousel + modal pattern, Enhance/Surprise tooltips) is the baseline; keep it when adding new sections or features.
