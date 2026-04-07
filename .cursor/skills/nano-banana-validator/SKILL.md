---
name: nano-banana-validator
description: Audit or validate Nano Banana Pro layered prompts against the codebase validator protocol. Use when checking prompt layers for structure, FORBIDDEN/REQUIRED logic, semantic quality, and business rules; or when re-running the audit after changes.
---

# Nano Banana Pro Codebase Validator

Use this skill when you need to **audit** or **validate** the layered prompt implementation (Campaign, Hero, Tattoo, Photoshoot) against the Nano Banana Pro protocol, or when re-running the formal audit after code changes.

## What to use

- **Implementation rules (how to build layers):** Use the **prompt-layers** skill. It defines the layer system, FORBIDDEN/REQUIRED in every layer, L0 persona and No Frames, copy sanitization, and per-section layer maps.
- **Audit criteria and report:** `docs/audit-nano-banana-pro-validator.md` contains the full audit report (score 93/100), grading scale, evaluation criteria, and summary tables.

## Protocol at a glance (from audit JSON)

**Grading:** 0–40 Critical, 41–70 Functional, 71–90 Professional, 91–100 Master.

**Evaluation criteria (weights):**

1. **Structural Integrity (25)**  
   - Layers separated by `\n\n`.  
   - Every layer has `[LAYER N — TITLE]`.  
   - Sequence L0 (Base) → … → style/copy/batch strictly maintained.

2. **Semantic Quality (30)**  
   - Prompts in natural language (prose), not CSV tags.  
   - L0 establishes a professional persona.  
   - Cinematic terminology in L1/L4 where relevant.  
   - Text-based requirements (quotes) handled safely (sanitize user copy).

3. **Negative Constraint Logic (20)**  
   - **Every** layer has a FORBIDDEN block before the REQUIRED block.  
   - Forbidden terms contextualized (e.g. “no extra limbs” in anatomy layer).  
   - “No Frames/Borders” (and letterboxing) enforced in L0.

4. **Business Logic & Presets (25)**  
   - Selects and presets map to the correct layer without overlap.  
   - Tattoo: Design Only vs Person Shot mutually exclusive in L0.  
   - Hero: Aspect ratio (L1) and industry context (L2) can optionally be validated for consistency.

## How to audit

1. **Structure:** Confirm `LAYER_SEP = '\n\n'` and `join(LAYER_SEP)` in each section’s store; every layer has `[LAYER N — TITLE]`; order matches the section’s layer map (see prompt-layers skill).
2. **FORBIDDEN/REQUIRED:** In data files, each layer constant must have FORBIDDEN then REQUIRED. In stores, any layer built only in code (e.g. Campaign L6/L7/L8, Photoshoot L4/L5) must prepend a short FORBIDDEN line before REQUIRED.
3. **L0:** Must include persona and frame/letterboxing/empty zones in FORBIDDEN (Campaign, Hero, Photoshoot; Tattoo L0 variants as applicable).
4. **Copy:** Any user text (headline, CTA, tagline) must be sanitized (e.g. `sanitizeCopyText`) before interpolation.
5. **Presets/selects:** Check they feed into the REQUIRED block of the correct layer as prose.

Output format for a formal re-audit: `final_score`, `critical_fixes`, `semantic_upgrades`, `logic_gaps` (see existing report in `docs/audit-nano-banana-pro-validator.md`).

## When to use this skill

- You are **re-auditing** the codebase after changing prompt layers or adding a section.
- You need to **check** that new or edited layers follow the protocol (structure, FORBIDDEN in every layer, L0 rules, sanitization).
- You want the **criteria and weights** for the Nano Banana Pro validator without re-reading the full audit doc.

For **writing or refactoring** the layers themselves, use the **prompt-layers** skill.
