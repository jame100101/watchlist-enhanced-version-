# Design System Strategy: The Cinematic Curator

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Auteur"**
This design system moves away from the utilitarian, data-heavy "database" look of traditional tracking sites. Instead, it treats every film and show as a piece of fine art. We are building a digital gallery, not a spreadsheet. 

To achieve this, the system breaks the traditional "box-and-line" template. We utilize **intentional asymmetry**, where text may overlap image margins, and **dynamic negative space** to let the high-quality cinematography of the content breathe. By leveraging a high-contrast typography scale (pairing a literary serif with a functional sans-serif), we create an editorial experience that feels curated, premium, and deeply cinematic.

---

## 2. Colors & Tonal Depth
The palette is rooted in a "Deep Obsidian" foundation, designed to make film posters and trailers pop with vibrant intensity.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1-pixel solid borders to section content. Boundaries must be defined through background color shifts. To separate a sidebar from a main feed, transition from `surface` (#121414) to `surface-container-low` (#1a1c1c). This creates a "soft edge" that feels integrated rather than partitioned.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of "frosted obsidian."
*   **Base:** `surface` (#121414) - The foundation.
*   **Recessed Content:** `surface-container-lowest` (#0d0f0f) - For search bars or secondary backgrounds.
*   **Elevated Elements:** `surface-container-high` (#282a2a) - For hover states or modals.
*   **Nesting:** Place a `surface-container-lowest` card inside a `surface-container-low` section to create natural depth without a single drop shadow.

### Signature Accents & Textures
*   **The Signature Gradient:** For Primary CTAs (e.g., "Add to Watchlist"), use a linear gradient from `primary` (#71d7cd) to `primary_container` (#00322e). This provides a "glass-lit" glow reminiscent of a cinema screen.
*   **Glassmorphism:** Navigation bars and floating headers must use `surface` at 70% opacity with a `20px` backdrop-blur. This allows movie poster colors to bleed through as the user scrolls, creating a reactive, immersive environment.

---

## 3. Typography
The typography is a dialogue between the "Art" (Serif) and the "Information" (Sans-Serif).

*   **Display & Headline (Newsreader):** This is our "Editorial Voice." Use `display-lg` for movie titles in hero sections. The high x-height and elegant serifs evoke the feeling of a film's opening credits.
*   **Title & Body (Manrope):** Our "Functional Voice." Manrope provides a modern, geometric clarity. Use `title-md` for metadata (Directors, Genres) to ensure readability against dark backgrounds.
*   **Label (Inter):** The "Utility Voice." Inter is used at `label-sm` for technical data (Runtime, Resolution, FPS) where every pixel counts.

**Hierarchy Tip:** Always use `on_surface_variant` (#c2c8c7) for body text and `on_surface` (#e2e2e2) for titles to create a natural reading priority.

---

## 4. Elevation & Depth
We eschew traditional "Material" shadows for a more atmospheric approach to light.

*   **The Layering Principle:** Depth is achieved by "stacking" tonal values. A `surface_container_highest` (#333535) element placed on `surface_dim` (#121414) creates an immediate focal point without needing structural lines.
*   **Ambient Shadows:** For "floating" components like dropdowns, use a shadow with a blur radius of `40px`, an opacity of `8%`, and a color value of `primary` (#71d7cd) rather than black. This simulates the "light leak" of a projector.
*   **The Ghost Border:** If a boundary is strictly required (e.g., a text input), use `outline_variant` (#424848) at **20% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons
*   **Primary:** Gradient of `primary` to `primary_container`. Roundedness: `md` (0.375rem). No border.
*   **Secondary:** Ghost style. No background. `outline` border at 20% opacity. Text in `secondary` (#e9c176).
*   **Tertiary:** Text-only in `on_surface_variant`. 

### Cards (The "Poster" Component)
*   **Rule:** Forbid all divider lines.
*   **Structure:** High-quality imagery with a `0.25rem` (sm) corner radius. Metadata (Title, Year) should sit below the image with `1.5rem` of vertical breathing room. Use `surface_container_low` for the card background on hover to "lift" the poster.

### Inputs & Search
*   **Visuals:** Use `surface_container_lowest` for the field background. 
*   **Focus State:** Shift background to `surface_container_high` and change the "Ghost Border" to 100% opacity `primary`.

### Navigation (The "Floating Rail")
*   Instead of a top bar, use a side-rail or a floating bottom-dock. Use `surface` at 80% opacity with a `backdrop-blur`. This maintains the "Cinematic" focus on the content.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use extreme white space. If a section feels crowded, double the padding.
*   **Do** lean into the "Gold" (`secondary`) and "Teal" (`primary`) accents for interactive elements only. Use them sparingly to signify "Action" or "Gold-tier content."
*   **Do** use asymmetrical grids. For example, a 2/3 width hero image paired with 1/3 width editorial text.

### Don’t
*   **Don't** use 1px solid borders to separate list items. Use a `1rem` vertical gap and a background shift.
*   **Don't** use pure black (#000000). Always use `surface` (#121414) to maintain depth and prevent eye strain.
*   **Don't** use "Default" system fonts. If the Serif isn't Newsreader, the "Editorial" soul of the system is lost.