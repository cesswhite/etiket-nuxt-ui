---
name: nuxt-ui-selects
description: Use USelectWithOptionTooltips for every USelect (and tooltips per option for USelectMenu) so each option shows a tooltip on hover. Use when creating or editing selects in the nananuxt app.
---

# Selects and option tooltips (Nuxt UI)

When you add or change a **USelect** or **USelectMenu** in the app:

1. **Use `USelectWithOptionTooltips`** instead of raw `USelect` whenever options have (or should have) a short description for the user. This component wraps Nuxt UI’s `USelect` and shows each option’s `description` as a **tooltip on hover**.
2. **Keep option objects with `description`**: each item in the `items` array should have at least `id` (or `value`), `label`, and an optional `description`. The description is shown in the tooltip when the user hovers over that option in the dropdown.
3. **Same props as USelect**: pass `value-key`, `label-key`, `description-key`, `v-model`, `items`, `class`, etc. exactly as you would to `USelect`. Defaults are `label-key="label"` and `description-key="description"`.
4. **USelectMenu**: if you add or edit a `USelectMenu`, prefer the same behaviour: each option should show a tooltip on hover. Use a custom item slot with `UTooltip` around each option if the menu component exposes an item slot; otherwise use `USelectWithOptionTooltips` where a single-value select is enough.

## Example (USelect)

```vue
<USelectWithOptionTooltips
  v-model="presetId"
  :items="presetItems"
  value-key="id"
  label-key="label"
  description-key="description"
  class="w-full"
/>
```

Options shape (e.g. from `app/data/`):

```ts
{ id: 'studio', label: 'Studio', description: 'Photo studio; grey or white backdrop.' }
```

## Where it’s used

- Tattoo, Campaign, Hero, Photoshoot, Relight: style/filter selects (presets, environment, lighting, mood, etc.)
- General filters: resolution, aspect ratio, safety filter, batch size (options already have descriptions)
- Model cards: model selector
- Any new select in these sections or new sections should use `USelectWithOptionTooltips` and options with `description`.

## Don’t

- Don’t use raw `USelect` for option lists that have or can have a description; use `USelectWithOptionTooltips` so the description appears as a tooltip.
- Don’t omit `description` on options when you’re adding or editing option lists for these selects; add a short, user-facing line for each option.
