---
name: no-hardcoded-colors-replan
description: Avoid hardcoded colors by using design tokens or theme variables; add rules to prevent repeating mistakes; stop and re-plan when something goes wrong instead of pushing through. Use when writing or reviewing UI styles, fixing recurring issues, or when an approach is failing.
---

# No Hardcoded Colors, Rules, and Re-Plan

## 1. Do Not Hardcode Colors

**Never** use raw color values (hex, rgb, hsl, named colors) in component styles or inline styles.

- **Use instead**: Design tokens, CSS variables, or the project’s theme/UI system (e.g. Nuxt UI semantic colors like `primary`, `neutral`, or utility classes that resolve to theme variables).
- **In Vue/Nuxt UI**: Prefer `color="primary"`, `color="neutral"`, or Tailwind/utility classes that map to the theme. In custom CSS, use `var(--ui-*)` or other project-defined variables.
- **If the project has no tokens**: Propose or use a small set of CSS variables (e.g. in `global.css` or app config) and reference those everywhere; do not introduce new raw color literals in components.

**Quick check**: Before committing style changes, search for `#`, `rgb(`, `hsl(`, or inline `style=".*color` and replace any literal colors with theme/token references.

---

## 2. Write Rules That Prevent the Same Mistake

When you or the user hits a mistake (bug, wrong pattern, wrong convention):

1. **Capture it**: Note what was wrong and what the correct approach is.
2. **Turn it into a rule**: Add or update a rule so the same mistake is less likely next time.
   - Prefer **project rules**: `.cursor/rules/*.mdc` or project-level RULE.md so the rule applies in this repo.
   - Optionally document in a skill or README if it’s a general principle.
3. **Keep rules short and actionable**: One rule per idea; use “Always/Never” and a single clear directive.

**Example**: After hardcoding `#3b82f6` in a component, add a rule: “Do not hardcode colors; use theme variables or design tokens only.”

---

## 3. If Something Goes Sideways, STOP and Re-Plan

When any of these happen:

- Errors persist after one or two attempted fixes
- Behavior is inconsistent or regressions appear
- You’re repeating the same kind of fix without success
- The user says it’s wrong or “still broken”

**Stop** the current approach. Do not add more tweaks, extra conditions, or keep applying the same fix.

**Re-plan**:

1. **Pause**: Briefly state what you were trying and what’s going wrong.
2. **Clarify**: Re-read the goal, constraints, and any error messages or user feedback.
3. **Choose a different strategy**: e.g. different API, different component, simplify the flow, or revert and redo a smaller change.
4. **Proceed** with the new plan; if that also fails, stop and re-plan again.

Do not “push through” with the same strategy once it’s clearly not working.

---

## Summary Checklist

- [ ] No hardcoded colors; all colors from theme/tokens/variables
- [ ] Recurring mistakes turned into a concrete rule (e.g. in `.cursor/rules/`)
- [ ] On repeated failure or confusion: stop, state the situation, re-plan, then continue
