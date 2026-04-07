---
name: nuxt-ui-buttons
description: Use UButton from Nuxt UI for every button, with cursor-pointer and UTooltip. Use when creating or editing buttons in the nananuxt app.
---

# Buttons and tooltips (Nuxt UI)

When you add or change a **button** in the app:

1. **Use `UButton`** from `@nuxt/ui` — never a raw `<button>` or other button component.
2. **Add `class="cursor-pointer"`** to the UButton by default (or include it in the `class` prop).
3. **Wrap the button in `UTooltip`** from Nuxt UI — use the `text` prop for the tooltip content. Buttons that only have an icon must have a tooltip (e.g. `aria-label`-style text). Buttons with a visible label can have an optional tooltip for extra context.

## Example

```vue
<UTooltip text="Copy prompt">
  <UButton
    size="xs"
    variant="ghost"
    color="neutral"
    icon="i-lucide-copy"
    class="cursor-pointer"
    @click="copy()"
  />
</UTooltip>
```

For a button with a visible label, tooltip is optional but recommended when the action could use a short explanation.
