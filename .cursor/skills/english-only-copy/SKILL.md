---
name: english-only-copy
description: Keep all user-facing and prompt text in English. Use when writing or reviewing copy, options, labels, toasts, prompts, or API-facing strings in the nananuxt app.
---

# English only – copy and prompts

**Everything must be in English.** No Spanish or other languages in:

- **Option data** (`app/data/*Options.ts`): `label`, `prompt`, and `description` for every option (e.g. campaign ideas, formats, aesthetics). Use English so prompts and UI stay consistent.
- **UI strings**: form labels, buttons, menu items (Upload, Delete, View full screen, etc.), toasts, error messages, tooltips. Never use Spanish or other languages for these.
- **Prompts and API payloads**: anchors, batch instructions, variation hints, and any text sent to image or LLM APIs must be in English.

When you add or change copy in image sections (Hero, Tattoo, Photoshoot, Campaign) or elsewhere, write it in English. If you see existing text in another language, replace it with English.
