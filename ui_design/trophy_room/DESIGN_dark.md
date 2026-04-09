# Design System Documentation: Dark Mode Editorial

## 1. Overview & Creative North Star: "The Obsidian Gallery"
This design system is a high-end, dark-mode framework designed to elevate gaming content into an editorial, gallery-like experience. Our Creative North Star is **The Obsidian Gallery**. We treat every interface not as a software application, but as a curated exhibition. 

To break the "template" feel, we lean into **intentional asymmetry**. Hero elements should overlap container boundaries, and typography should utilize aggressive scale shifts to create a sense of prestige. By utilizing a "Dark Obsidian" palette, we allow the vibrant accent color to act as a laser-focused spotlight, guiding the user’s eye toward victory and achievement.

---

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is rooted in `#131313` (Surface), providing a deep, sophisticated void that allows content to breathe.

### Surface Hierarchy & Nesting
We define depth through **Tonal Layering** rather than borders.
- **Surface (Base):** `#131313` - The primary canvas.
- **Surface Container Low:** `#1c1b1b` - Secondary content areas.
- **Surface Container Lowest:** `#0e0e0e` - Use this for "sunken" interactive areas or background utility bars.
- **Surface Container High:** `#2a2a2a` - Elevated interactive cards.

### The Rules of Engagement
*   **The "No-Line" Rule:** Explicitly prohibit 1px solid borders for sectioning. Boundaries must be defined solely through background shifts. If a section ends, the background transitions from `surface` to `surface-container-low`.
*   **The Glass & Gradient Rule:** For floating navigation or modal overlays, use `surface_bright` with a 60% opacity and a `24px` backdrop blur. 
*   **Signature Textures:** Main CTAs should not be flat. Use a linear gradient from `primary_container` (`#FF9100`) to `primary` (`#ffb97c`) at a 135-degree angle to provide a "metallic" luster.

---

## 3. Typography: Editorial Authority
We use **Manrope** exclusively. Its geometric yet modern construction allows for high legibility in dark environments.

*   **Display (lg/md):** Use for "Trophy Moments." Set with `-0.02em` letter spacing and `1.1` line height. These should often be asymmetric, pushed to the far left or right of the layout.
*   **Headline (lg/md):** The primary storytelling voice. High contrast (`on_surface` `#e5e2e1`) is mandatory.
*   **Title (lg/md):** Used for card headers. Ensure these have ample breathing room (minimum `24px` padding from any edge).
*   **Body (lg/md):** For descriptions. Use `on_surface_variant` (`#dcc2ae`) to reduce eye strain, reserving the pure white-adjacent tones for headings.
*   **Label:** Always uppercase with `0.05em` letter spacing to denote metadata or "Pro" status.

---

## 4. Elevation & Depth: The Layering Principle
Forget traditional drop shadows. We create height through light and translucency.

*   **Layering:** To lift a card, place a `surface_container_high` (`#2a2a2a`) element on top of a `surface` background.
*   **Ambient Shadows:** If a component must float (e.g., a dropdown), use a shadow with a `40px` blur, `0px` offset, and 8% opacity using the `surface_tint` (`#ffb778`) color. This mimics the glow of a screen in a dark room.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline_variant` (`#564334`) at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Precision & Prestige

### Buttons
*   **Primary:** Background: Gradient (`primary_container` to `primary`). Text: `on_primary_fixed` (`#2e1500`). Shape: `md` (`0.375rem`).
*   **Secondary:** Background: Transparent. Border: Ghost Border (15% `outline_variant`). Text: `primary`.
*   **Tertiary:** No background. Text: `on_surface_variant`. Underline on hover only.

### Cards & Lists
*   **Constraint:** Zero dividers. Use a `32px` vertical gap (Spacing Scale) to separate list items. 
*   **Card Styling:** Use `surface_container_low` with an `xl` (`0.75rem`) corner radius. On hover, transition the background to `surface_container_high`.

### Input Fields
*   **Resting:** Background: `surface_container_highest`. Border: None.
*   **Focus:** Border: `1px` solid `primary_container` (`#FF9100`). Add a subtle outer glow using the Ambient Shadow rule.

### Signature Component: The "Achievement Ribbon"
A full-bleed horizontal container using `surface_container_lowest` with a micro-gradient border on the top edge only (using `primary` at 20% opacity). Use this to highlight rare statistics.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins (e.g., 80px left, 120px right) to create a high-end editorial feel.
*   **Do** overlap images across container boundaries to break the "grid prison."
*   **Do** use `tertiary_container` (`#00b8fe`) sparingly for "Tech" or "System" notifications to contrast the "Human/Victory" orange.

### Don't
*   **Don't** use pure black (`#000000`). It kills the depth of the "Obsidian" effect.
*   **Don't** use standard Material dividers. If you feel you need a line, you actually need more white space.
*   **Don't** saturate the screen with `#FF9100`. It is a surgical tool, not a paint bucket. Use it for CTAs, active states, and highlights only.