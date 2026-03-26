# Design System Strategy: The Humanist Editorial

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Empathetic Architect."** 

In the healthcare NGO space, "clean" often translates to "clinical" and "sterile." We are breaking that trope. By combining the precision of a high-end editorial magazine with the warmth of human-centric care, this system moves away from the rigid, boxed-in layouts of traditional medical portals. 

We achieve a signature look through **Intentional Asymmetry** and **Tonal Depth**. Instead of a standard 12-column grid where everything aligns to a hard edge, we use generous, sweeping whitespace (using our `20` and `24` spacing tokens) to let content breathe. Elements should feel like they are floating on a calm sea of `surface`, layered with shifting opacities rather than separated by harsh lines.

## 2. Colors & Surface Philosophy
The palette is rooted in a sophisticated Teal hierarchy, balanced by a range of nuanced greys that provide depth without visual noise.

### The "No-Line" Rule
To maintain a premium, high-end feel, **1px solid borders are prohibited for sectioning.** 
Structural boundaries must be defined solely through:
*   **Background Color Shifts:** Use `surface-container-low` (#f3f4f6) sections sitting on a `surface` (#f8f9fb) background.
*   **Tonal Transitions:** Define areas by the transition from `surface` to `surface-container`.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface tiers to create "nested" importance:
*   **Base Level:** `surface` (#f8f9fb) for the main canvas.
*   **Section Level:** `surface-container-low` (#f3f4f6) for large content blocks.
*   **Interactive Level:** `surface-container-lowest` (#ffffff) for primary cards to make them "pop" against the grey background.

### The "Glass & Gradient" Rule
For hero sections or primary calls-to-action, use a subtle linear gradient from `primary` (#00685f) to `primary-container` (#008378) at a 135-degree angle. This adds "soul" and prevents the NGO interface from feeling flat or generic. For floating navigation or modal overlays, apply **Glassmorphism**: use `surface` at 80% opacity with a `backdrop-filter: blur(12px)`.

## 3. Typography
We utilize a pairing of **Manrope** for authoritative, editorial expression and **Inter** for functional, high-legibility data.

*   **Display & Headlines (Manrope):** Large scale ratios (e.g., `display-lg` at 3.5rem) should be used with `on-surface` (#191c1e) to create a bold, trustworthy narrative. Manrope’s geometric yet warm curves mirror the "Professional yet Warm" requirement.
*   **Body & Labels (Inter):** Inter is used for all functional data. Use `body-md` for standard text to ensure maximum readability for diverse users.
*   **Hierarchy Tip:** Never use "All Caps" for headers; it feels aggressive. Use `title-sm` with slightly increased letter-spacing for labels to maintain a sophisticated, calm tone.

## 4. Elevation & Depth
Depth in this system is a whisper, not a shout.

*   **The Layering Principle:** Avoid shadows where background shifts can work. A `surface-container-lowest` card placed on a `surface-container-low` background creates a natural, soft lift.
*   **Ambient Shadows:** When a card must "float" (e.g., a hovered state), use an extra-diffused shadow: `box-shadow: 0 12px 32px -4px rgba(25, 28, 30, 0.06)`. Note the use of `on-surface` tinted at 6% rather than a generic black.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility in input fields, use `outline-variant` (#bcc9c6) at **20% opacity**. Never use 100% opaque borders.
*   **Roundedness:** Use the `md` (12px) radius for primary containers and `sm` (4px) for small interactive elements like checkboxes to create a cohesive, friendly "squircle" aesthetic.

## 5. Components

### Buttons
*   **Primary:** Filled with `primary` (#00685f), text in `on-primary` (#ffffff). Use a `DEFAULT` (8px) corner radius. On hover, transition to `primary-container`.
*   **Secondary (Outlined):** Use the "Ghost Border" rule (outline-variant at 30%) with `primary` text. No solid fill.
*   **Tertiary:** Text-only using `primary` color, with a `surface-container-high` background appearing only on hover.

### Cards & Lists
*   **Rule:** Forbid divider lines. Use `spacing-6` (2rem) of vertical white space to separate list items.
*   **Style:** Cards use `surface-container-lowest` (#ffffff) with the `md` (12px) roundedness scale and a subtle ambient shadow.

### Input Fields
*   **State:** Default state uses `surface-container-high` as a subtle background fill rather than a border.
*   **Focus:** Transition the background to `surface-container-lowest` and add a 2px `primary` ghost-border (20% opacity).

### Specialized NGO Components
*   **Impact Metric Chips:** Use `tertiary-container` (#00855b) with `on-tertiary-container` text to highlight positive data points (e.g., "500 Lives Saved").
*   **Patient Progress Trackers:** Use thick 8px bars with `primary-fixed` as the track and `primary` as the progress indicator for a modern, tactile feel.

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical padding. A wider left margin for a headline creates an editorial, high-end look.
*   **Do** use `surface-dim` for inactive or disabled states to maintain the soft tonal palette.
*   **Do** prioritize `primary-fixed-dim` for subtle highlights in "warm" areas of the app.

### Don't
*   **Don't** use pure black (#000000) for text. Use `on-surface` (#191c1e) to keep the contrast accessible but soft.
*   **Don't** use standard 1px dividers to separate content. Use the spacing scale (`spacing-4` or `spacing-8`) to create "invisible" boundaries.
*   **Don't** use sharp corners. Everything should have at least the `sm` (4px) radius to maintain the "Warm" brand pillar.