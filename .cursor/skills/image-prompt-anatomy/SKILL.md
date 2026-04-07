---
name: image-prompt-anatomy
description: Ensure image-generation prompts in nananuxt never allow anatomical aberrations or impossible actions. Use when writing or reviewing prompts for Campaign, Hero, Tattoo, Photoshoot, or any API that generates images with people.
---

# Image prompts: anatomy and action realism

Whenever you add or change **prompts** (or prompt anchors) that are sent to image-generation APIs (Campaign, Hero, Tattoo, Photoshoot, etc.), you **must** enforce the following. These rules prevent extra limbs, impossible poses, and activity-breaking gaze (e.g. driver looking at camera instead of the road).

## 1. Human anatomy (non-negotiable)

- **Limb count:** Every person has **exactly two arms and two legs**. No third arm, no extra hands, no duplicated or phantom limbs.
- **Explicit in prompt:** Include a line such as: *"Every person must have exactly two arms and two legs; no anatomical aberrations, no third arm or extra hands."*
- **Consistency:** The same rule applies from any viewing angle; the model must not generate a person with more than two arms or two hands.

## 2. Physically possible actions

- **Two hands, two roles:** Any pose must be doable by a real human. For example: one hand on the steering wheel, one hand adjusting sunglasses—both actions belong to the same two arms.
- **No implied extra limbs:** Avoid descriptions that could be interpreted as a third arm (e.g. "one hand on wheel, one on glasses, one on gear lever" without clarifying it is the same two hands in sequence or from different frames).

## 3. Activity-appropriate gaze and posture

- **Focused activities:** When the subject is doing a **focused activity** (driving, reading, using a device, applying product, holding something), they must **look at the object of that activity**, not at the camera.
- **Camera vs subject:** The **camera** frames the subject; the **subject** does not break the action to look at the lens (unless the scene is explicitly "looking at camera" / portrait).
- **Driving example:** Driver in a car must have **gaze on the road ahead (straight)**. Hands: one on wheel, the other may adjust sunglasses or gear, but only two hands total. Camera can show the driver from the side or 3/4; driver keeps eyes on the road.

## 4. Where to apply in nananuxt

- **Campaign:** `CAMPAIGN_ANATOMY_ACTION_ANCHOR` in `app/data/campaignOptions.ts` is already included in the campaign prompt via `app/stores/images/campaign.ts`. Do not remove it; extend it if you add new activity types.
- **Other sections (Hero, Tattoo, Photoshoot):** If the prompt can generate **people**, add an equivalent anatomy + action block (or import a shared constant) so the same rules apply.
- **Surprise API / one-off prompts:** When building prompts that include people, append a short line: e.g. *"CRITICAL: Humans with exactly two arms and two legs; no extra limbs. If the person is doing an activity (e.g. driving), they look at the activity, not at the camera."*

## 5. Wording to reuse

You can copy or adapt this sentence into any prompt that shows people:

```text
CRITICAL—Anatomy: every person has exactly two arms and two legs; no third arm or extra hands. Actions must be physically possible. If the person is doing a focused activity (e.g. driving), they look at the activity (e.g. road ahead), not at the camera; the camera frames them.
```

## 6. Review checklist

When reviewing or writing image prompts:

- [ ] Is there an explicit "no extra limbs / two arms, two legs" rule when people are in the scene?
- [ ] For driving, using a device, or similar: does the prompt say the person looks at the task (e.g. road), not at the camera?
- [ ] Are poses described in a way that only two hands are needed (no implied third limb)?

If any checkbox is missing for a prompt that can show people, add or point to the anatomy/action anchor (or the shared wording above).
