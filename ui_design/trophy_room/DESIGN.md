# Design System: The Editorial Playbook

## 1. Overview & Creative North Star
**Creative North Star: "The Curated Gallery"**

This design system moves away from the "database" feel of traditional collection trackers and toward a high-end, editorial experience. We treat board games not as inventory, but as art. The aesthetic—**Modern Playful Editorial**—marries the sophisticated structure of a premium lifestyle magazine with the tactile energy of tabletop gaming.

To break the "template" look, we utilize:
*   **Intentional Asymmetry:** Avoid perfectly centered grids; use staggered layouts to create a sense of movement.
*   **Tonal Depth:** Replacing rigid lines with soft shifts in light and color.
*   **Type as Hero:** Large-scale typography that functions as a graphic element, not just a label.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a warm, sophisticated off-white (`#f7f6f3`), punctuated by the energetic glow of **Amber** and the calming depth of **Teal**.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Boundaries must be established through background shifts or white space.
*   *Correct:* A `surface-container-low` section sitting on a `surface` background.
*   *Incorrect:* A `1px #adadab` line separating a header from a body.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested, physical layers. 
*   **Base:** `surface` (#f7f6f3)
*   **Layer 1:** `surface-container-low` (#f1f1ee) for secondary zones.
*   **Layer 2:** `surface-container-highest` (#ddddda) for active, elevated components.
*   **Layer 3 (The Card):** `surface-container-lowest` (#ffffff) to make content "pop" against the off-white base.

### The "Glass & Gradient" Rule
To inject "soul" into the interface:
*   **Main CTAs:** Use a subtle linear gradient from `primary` (#8a4c00) to `primary-container` (#fd9000) at a 45-degree angle.
*   **Floating Navigation:** Utilize Glassmorphism. Apply `surface` with 70% opacity and a `24px` backdrop blur to allow the vibrant game art to bleed through the UI subtly.

---

## 3. Typography: The Editorial Voice
We use **Manrope** exclusively. Its geometric yet humanist qualities provide the "Modern Playful" balance.

*   **Display (lg/md):** Use for hero titles and collection counts. Tracking should be set to `-0.02em` for a tighter, premium feel.
*   **Headline (lg/md):** The primary storytelling tool. Use these for game titles.
*   **Title (sm):** Used for metadata (e.g., "Players: 2-4").
*   **Body (lg/md):** Set with generous line height (1.6) to ensure readability and an airy, editorial feel.
*   **Labels:** Always uppercase with `+0.05em` letter spacing to denote secondary utility information.

**Visual Hierarchy Tip:** Use `primary` (#8a4c00) for Display text occasionally to draw the eye, but keep Body text in `on-surface` (#2e2f2d) for maximum legibility.

---

## 4. Elevation & Depth
In this system, "Flat is boring, but Deep is distracting." We use **Tonal Layering**.

*   **The Layering Principle:** Instead of shadows, place a `surface-container-lowest` card on a `surface-container-low` section. The slight color shift creates a soft, natural lift.
*   **Ambient Shadows:** For "floating" elements (like a Modals or Action Menus), use: `box-shadow: 0 12px 40px rgba(46, 47, 45, 0.06);`. The shadow is a tinted version of `on-surface`, never pure black.
*   **The "Ghost Border" Fallback:** If a divider is mandatory for accessibility, use `outline-variant` at **15% opacity**. It should be felt, not seen.
*   **Edge Treatment:** All primary containers must use the `md` (0.75rem / 12px) corner radius to maintain the "Friendly & Approachable" brand pillar.

---

## 5. Components

### Buttons
*   **Primary:** Gradient of `primary` to `primary-container`. `md` rounded corners. White text (`on-primary`).
*   **Secondary:** `secondary-container` (#8df5e4) with `on-secondary-container` (#005c53) text. No border.
*   **Tertiary:** No background. Bold `primary` text. High-contrast hover state using `surface-container-high`.

### Cards & Game Tiles
*   **Forbid dividers.** Use `body-sm` typography and `surface-container-low` backgrounds to separate "Play Time" from "Difficulty Rating."
*   **Overlapping Elements:** Allow the game cover art to slightly "break the grid" and overlap the card's edge to enhance the editorial vibe.

### Chips (Game Tags)
*   Use `secondary-fixed` (#8df5e4) for "In Stock" and `tertiary-fixed` (#fdd73e) for "Wishlist." 
*   **Styling:** Pill-shaped (`full` roundedness) with `label-md` text.

### Input Fields
*   **Background:** `surface-container-low`.
*   **Active State:** No heavy border; instead, use a 2px `primary` underline or a subtle `primary` outer glow (4px blur).

---

## 6. Do’s and Don'ts

### Do
*   **DO** use whitespace as a functional tool. If elements feel crowded, increase the gap before adding a line.
*   **DO** use large, high-quality imagery. The games are the stars.
*   **DO** mix font weights. Use `Manrope ExtraBold` for headlines and `Manrope Regular` for body to create contrast.
*   **DO** use the `secondary` teal (#00675c) for success states and interactive elements to provide a refreshing break from the amber.

### Don't
*   **DON'T** use pure black (#000000) for text. Always use `on-surface` (#2e2f2d).
*   **DON'T** use standard 4px rounded corners. It feels "Bootstrap." Stick to the 12px (`md`) standard.
*   **DON'T** use 100% opaque borders. They clutter the editorial "breathability."
*   **DON'T** center-align long blocks of text. Stick to left-alignment to maintain the magazine-style layout.