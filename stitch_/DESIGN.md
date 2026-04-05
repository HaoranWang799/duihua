```markdown
# Design System Strategy: The Shadow & Silk Collective

## 1. Overview & Creative North Star: "The Noir Sanctuary"
This design system is built to facilitate an intimate, visceral connection between the listener and the narrative. Our Creative North Star is **The Noir Sanctuary**. We are not building a utility app; we are designing a digital confessional. 

To achieve this, the system moves away from the "app-like" rigidity of grids and boxes. Instead, we utilize **Intentional Asymmetry** and **Cinematic Pacing**. Elements do not simply appear; they emerge from the `#000000` void. By leveraging extreme whitespace (breathing room) and high-contrast typography scales, we create an editorial experience that feels premium, private, and intentionally provocative.

---

## 2. Colors: Depth in the Darkness
The palette is rooted in a pure black `surface` to ensure hardware-level immersion on OLED screens. 

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through background color shifts. Use `surface-container-low` (#1B1B1B) against a `surface` (#131313) background to imply structure. If a section feels "lost," increase the padding—do not add a line.

### Surface Hierarchy & Nesting
Treat the UI as layered sheets of obsidian.
*   **Base Level:** `surface` (#131313) or `surface-container-lowest` (#0E0E0E) for the deepest immersion.
*   **Interactive Level:** `surface-container` (#1F1F1F) for cards or response areas.
*   **Active Level:** `surface-bright` (#393939) for elevated elements that require immediate focus.

### The "Glass & Gradient" Rule
To add "soul" to the darkness, use **Radial Gradients**. A subtle `primary-container` (#8B0000) gradient should pulse behind audio controls to simulate a heartbeat. Floating elements (like temporary notifications) must use `surface-variant` with a 60% opacity and a 20px `backdrop-blur` to create a "Frosted Noir" effect.

---

## 3. Typography: The Narrative Voice
The system uses a dual-font approach to balance modern functionality with classical elegance.

*   **Display & Headlines (Noto Serif):** This is our "Editorial Voice." Large, serif, and unapologetic. `display-lg` (3.5rem) should be used for story titles to evoke the feeling of a prestige film title card.
*   **Body & Labels (Manrope):** This is our "Functional Voice." A clean, geometric sans-serif that ensures readability at small scales. 
*   **The Subtitle Standard:** Subtitles must use `headline-sm` (1.5rem) in `on-surface`. They are the heart of the app. Ensure a line-height of 1.4x to allow the words to "breathe" as they are read.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows look "muddy" on deep black. We use light, not dark, to define depth.

*   **The Layering Principle:** Place a `surface-container-high` card on a `surface-dim` background. The subtle 3-4% difference in luminosity creates a sophisticated "lift" that feels organic.
*   **Ambient Glows:** Instead of a black drop shadow, use a 4% opacity `primary` (#FFB4A8) glow for "floating" response buttons. This mimics the way light catches on silk in a dark room.
*   **Ghost Borders:** If accessibility requires a container definition, use the `outline-variant` token at **15% opacity**. It should be felt, not seen.

---

## 5. Components: Immersive Primitives

### Primary Response Buttons
*   **Shape:** `xl` (3rem) radius. They should feel like smooth river stones.
*   **Color:** `primary-container` (#8B0000) with `on-primary-container` text.
*   **Interaction:** On press, transition to `primary` with a subtle haptic pulse.

### Audio Player Controls
*   **Philosophy:** Minimalist and non-distracting.
*   **Visuals:** Use `on-secondary-container` (#D1A1FF) for the play/pause icon. Avoid progress bars with heavy "tracks." Use a single, 2px-thin line that glows as it advances.
*   **Centering:** All audio controls must be vertically centered to align with the thumb’s natural resting position.

### Response Chips
*   **Styling:** Use `secondary-container` (#622599) with `md` (1.5rem) roundedness. 
*   **Spacing:** Generous horizontal padding (1.5rem) to make them "touch-friendly" and luxurious.

### Narrative Text Area
*   **Cards:** Forbid divider lines. Use `surface-container-lowest` for the text background and `surface-container-low` for the surrounding environment. 
*   **Alignment:** Centered subtitles only. Left-aligned text is for productivity; center-aligned is for poetry and immersion.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace the Void:** Leave at least 40% of the screen as pure `#000000` during story playback.
*   **Soft Transitions:** Use 400ms-600ms ease-in-out transitions. Elements should "fade and float," never "snap."
*   **Visual Weight:** Use `primary` (#FFB4A8) sparingly—only for the most vital "Action" or "Peak Moment" in a story.

### Don’t:
*   **No Hard Edges:** Never use the `none` (0px) roundedness scale. It breaks the "intimate" feel.
*   **No Pure White:** Never use #FFFFFF. Use `on-surface` (#E2E2E2) to prevent eye strain in dark environments.
*   **No Grid Snapping:** Avoid perfectly symmetrical 2-column layouts. If displaying two story choices, offset one slightly lower than the other to create visual intrigue.

---

## 7. Designer’s Note: The "Pulse"
This system thrives on the tension between the deep purple (`secondary`) and the blood-red (`primary`). Use the purple for the "atmosphere" (background glows, inactive states) and the red for the "climax" (active buttons, dramatic subtitles). The user should feel the interface is reacting to the narrative's emotional temperature.```