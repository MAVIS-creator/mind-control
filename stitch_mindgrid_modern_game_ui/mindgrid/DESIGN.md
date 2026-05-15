---
name: MindGrid
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#464555'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#0060ac'
  on-secondary: '#ffffff'
  secondary-container: '#64a8fe'
  on-secondary-container: '#003c70'
  tertiary: '#6b00b7'
  on-tertiary: '#ffffff'
  tertiary-container: '#862dd4'
  on-tertiary-container: '#ebd2ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#a4c9ff'
  on-secondary-fixed: '#001c39'
  on-secondary-fixed-variant: '#004883'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#ddb7ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#6900b3'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
  container-max: 1200px
---

## Brand & Style
The design system for MindGrid is built on the principles of **Playful Minimalism**. It aims to evoke a sense of mental clarity, focus, and premium entertainment. The target audience includes modern casual gamers who appreciate high-production value, "Apple-like" polish, and frictionless interfaces.

The aesthetic blends **Glassmorphism** with **Modern Minimalism**. Key characteristics include:
- **Smoothness:** Motion and transitions should feel fluid and elastic.
- **Translucency:** Depth is created through frosted glass layers and soft background blurs rather than heavy shadows.
- **Cleanliness:** High use of whitespace to reduce cognitive load during puzzle-solving.
- **Tactile Softness:** Elements should feel "touchable" with generous corner radii and gentle gradients.

## Colors
The palette is centered around a sophisticated **Indigo** core, supported by calming blues and energetic purples. 

- **Primary (Indigo):** Used for main actions, active states, and brand-defining moments.
- **Secondary (Soft Blue):** Used for interactive elements that require less emphasis than the primary action.
- **Accent (Light Purple):** Reserved for rewards, level-ups, and special achievements to create a sense of delight.
- **Neutral (Dark Slate):** Provides high-contrast legibility for typography.
- **Surface Strategy:** Backgrounds are not flat white; they utilize very subtle radial gradients (e.g., from `#FFFFFF` to `#F1F5F9`) with soft indigo "blobs" positioned off-screen to create a sense of atmospheric depth.

## Typography
The design system utilizes **Inter** for its exceptional legibility and modern, neutral character. 

- **Weight Strategy:** Use Bold (700) or ExtraBold (800) for headlines to create a playful, confident hierarchy. Use Medium (500) for body text to maintain a premium feel even at smaller sizes.
- **Scaling:** Display sizes on mobile scale down significantly to ensure the game grid remains the focal point.
- **Character:** Tighten letter-spacing on large headlines to mimic premium editorial design.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a focus on safe-area margins to ensure playability on all mobile devices.

- **The Grid:** Game boards (grids) should be centered both vertically and horizontally within their containers.
- **Rhythm:** Use a 4px baseline shift, but prefer increments of 8px (16, 24, 32) for structural padding.
- **Floating Containers:** Content is grouped into "Floating Cards" that do not touch the screen edges, maintaining the "light and airy" feel.

## Elevation & Depth
Depth is the most critical aspect of the MindGrid visual language. We avoid standard drop shadows in favor of:

- **Glassmorphism:** Use `backdrop-filter: blur(12px)` and `background: rgba(255, 255, 255, 0.7)` for all overlays, modals, and navigation bars.
- **Inner Glows:** Subtle 1px white top borders (semi-transparent) on buttons and cards simulate light hitting the edge of a glass surface.
- **Soft Diffusion:** When shadows are used, they are long, very low opacity (5-8%), and tinted with the Primary Indigo color to avoid a "dirty" grey look.
- **Layering:** Level 0 is the gradient background; Level 1 is the main game content; Level 2 is floating UI overlays (scores, timers); Level 3 is modals and alerts.

## Shapes
The shape language is dominated by **Extra-Large Radii**. 

- **Primary Elements:** Buttons and game tiles use `rounded-2xl` (1.5rem / 24px) to feel friendly and safe.
- **Containers:** Main glass cards and modals use `rounded-3xl` (2rem / 32px).
- **Interactive States:** When a tile is selected, it should "pulse" or slightly increase its roundedness visually via a scale transform (e.g., 1.05x).

## Components
- **Primary Buttons:** High-saturation Indigo background with a subtle linear gradient (top to bottom). They use a soft white "inner-glow" on the top edge and a "squishy" press animation.
- **Game Tiles:** These are the heart of the UI. They should appear as thick, high-gloss white slabs. When flipped or matched, use a "glass-shatter" or "light-flare" particle effect.
- **Glass Chips:** Small info badges (like "Player 1" or "30s left") should be semi-transparent with a 1px border that matches the text color at 20% opacity.
- **Input Fields:** Minimalist design with only a bottom border or a very light grey background, focusing on the "Focus State" which glows with a soft Indigo aura.
- **Modals:** Centered floating panes with a heavy backdrop blur that desaturates the game grid behind it, focusing the player's attention entirely on the message.
- **Progress Bars:** Use the Secondary Blue with a trailing Light Purple gradient to show movement and energy.