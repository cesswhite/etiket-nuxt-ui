---
name: nuxt-motion
description: Add and tune animations in the nananuxt app using @vueuse/motion (Nuxt Motion). Use when implementing entrance/exit, scroll-triggered, or interaction animations in Vue/Nuxt components.
---

# Nuxt Motion (@vueuse/motion)

Use **@vueuse/motion** (Nuxt Motion) for animations in this project. The module is registered in `nuxt.config.ts` as `@vueuse/motion/nuxt`.

## Setup

- **Package:** `@vueuse/motion`
- **Module:** `@vueuse/motion/nuxt` in `modules` (already added).
- **SSR:** Supported; `initial` is applied server-side so no layout shift.

## Directive usage

Use the `v-motion` directive with variant props:

- **`initial`** – state before mount / first frame
- **`enter`** – after mount (transition from initial)
- **`visible`** – when in viewport (repeats when leaving/entering)
- **`visible-once`** – when in viewport (runs once)
- **`hovered`** – pointer over element
- **`tapped`** – click/tap
- **`focused`** – element focused

Shorthand: **`delay`**, **`duration`** (number in ms).

### Inline variants

```vue
<template>
  <div
    v-motion
    :initial="{ opacity: 0, y: 20 }"
    :enter="{ opacity: 1, y: 0 }"
    :duration="300"
  >
    Content
  </div>
</template>
```

### Named instance (for useMotions)

```vue
<template>
  <div
    v-motion="'card'"
    :initial="{ opacity: 0 }"
    :enter="{ opacity: 1 }"
  />
</template>

<script setup lang="ts">
import { useMotions } from '@vueuse/motion'
const { card } = useMotions()
// card.variant.value = 'enter' | 'initial' | custom
</script>
```

## Presets (built-in)

Use as **`v-motion-<preset-name>`** (no extra props needed for default behaviour):

| Preset | Typical use |
|--------|------------------|
| `v-motion-fade` | Fade in |
| `v-motion-fade-visible` | Fade when in view (repeats) |
| `v-motion-fade-visible-once` | Fade when in view (once) |
| `v-motion-slide-visible-once-bottom` | Slide up into view (once) |
| `v-motion-slide-visible-once-left` | Slide from left (once) |
| `v-motion-slide-visible-once-right` | Slide from right (once) |
| `v-motion-slide-visible-once-top` | Slide from top (once) |
| `v-motion-pop` | Scale + opacity on enter |
| `v-motion-pop-visible-once` | Pop when in view (once) |
| `v-motion-roll-visible-once-bottom` | Roll up (once) |

Examples:

```vue
<div v-motion-fade-visible-once>Fades in when visible (once)</div>
<div v-motion-slide-visible-once-bottom>Slides up when visible (once)</div>
<div v-motion-pop :delay="100">Pops in after mount</div>
```

## Custom directives (optional)

Define in `nuxt.config.ts` under `runtimeConfig.public.motion.directives`:

```ts
runtimeConfig: {
  public: {
    motion: {
      directives: {
        'pop-bottom': {
          initial: { scale: 0, opacity: 0, y: 20 },
          enter: { scale: 1, opacity: 1, y: 0 },
        },
      },
    },
  },
},
```

Then use: `v-motion-pop-bottom`.

## Best practices (align with web-animation-design)

- **Enter/exit:** Prefer ease-out for responsiveness.
- **Duration:** Keep UI animations short (e.g. 200–300 ms); use `duration` and `delay` for stagger.
- **Stagger:** Use different `delay` per child (e.g. `:delay="index * 50"`).
- **Reduce motion:** Respect `prefers-reduced-motion` where possible (e.g. skip or shorten animations).
- **What to animate:** Prefer `transform` and `opacity` for performance.

## Where we use it

- **Campaign:** Container column content (staggered card enter), cards (fade/slide visible once), Generate button (subtle enter/pop).
- Add to other sections (Hero, Tattoo, Photoshoot) when adding or refining motion.
