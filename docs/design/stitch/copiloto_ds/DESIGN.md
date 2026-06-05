---
name: Copiloto DS
colors:
  surface: '#fbf8fc'
  surface-dim: '#dcd9dd'
  surface-bright: '#fbf8fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f2f7'
  surface-container: '#f0edf1'
  surface-container-high: '#eae7eb'
  surface-container-highest: '#e4e1e6'
  on-surface: '#1b1b1e'
  on-surface-variant: '#59413b'
  inverse-surface: '#303033'
  inverse-on-surface: '#f3f0f4'
  outline: '#8d7169'
  outline-variant: '#e1bfb6'
  surface-tint: '#ac340a'
  primary: '#a93107'
  on-primary: '#ffffff'
  primary-container: '#cb4921'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb5a0'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#a23917'
  on-tertiary: '#ffffff'
  tertiary-container: '#c2512d'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb5a0'
  on-primary-fixed: '#3b0a00'
  on-primary-fixed-variant: '#862200'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffdbd1'
  tertiary-fixed-dim: '#ffb59f'
  on-tertiary-fixed: '#3a0a00'
  on-tertiary-fixed-variant: '#842503'
  background: '#fbf8fc'
  on-background: '#1b1b1e'
  surface-variant: '#e4e1e6'
typography:
  display-lg:
    fontFamily: Lexend
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Lexend
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Lexend
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-sm:
    fontFamily: Lexend
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  numeral-xl:
    fontFamily: Lexend
    fontSize: 40px
    fontWeight: '900'
    lineHeight: 40px
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is engineered for **Copiloto**, an AI-powered operations co-pilot for the high-intensity restaurant industry in LATAM. The brand personality balances **Operational Excellence** with **Culinary Warmth**, bridging the gap between cold data-driven SaaS and the vibrant, tactile environment of a contemporary Mexican kitchen.

The aesthetic follows a **Premium Modern** approach, characterized by:
- **Warm Minimalism:** Large amounts of off-white whitespace (Talavera-inspired) to prevent cognitive overload.
- **Data-Density (Linear-inspired):** Efficient use of space for complex inventory, payroll, and supply chain tables, but softened by high-radius corners.
- **Strategic Warmth:** The use of Terracotta and Saffron to highlight intelligence and action, moving away from "tech blue."
- **Glassmorphism:** Utilized for global navigation and floating action layers to maintain context of the underlying data.

## Colors

The palette is rooted in the earth tones of traditional Mexican craftsmanship but optimized for digital legibility.

- **Primary (Terracotta):** Used for primary actions, branding, and active states. It evokes the warmth of the kitchen.
- **Accent (Saffron):** Reserved exclusively for AI insights, "Copiloto recommends," and high-priority optimization alerts.
- **Surface Palette:** The background uses a specific off-white (`#F8F6F3`) to reduce screen glare during long shifts, while pure white is used for elevated cards to create clear separation.
- **Semantic Accents:** Status indicators should use 4px left-aligned borders on cards and list items to categorize "Inventory," "Staffing," or "Revenue" at a glance.

## Typography

This system uses a dual-font strategy:
1. **Lexend:** A highly readable geometric sans used for all headings and large numerical data (KPIs). Its structure provides a "modern-industrial" feel suitable for operations.
2. **Inter:** The workhorse for UI elements, labels, and long-form data. It provides the neutral, systematic clarity required for complex tables and settings.

**Key Rule:** All currency and "Big Numbers" (e.g., Daily Revenue, Food Cost %) must use Lexend Bold to emphasize the "Data-Driven" core of the product.

## Layout & Spacing

The design system utilizes a **12-column fluid grid** for desktop and a **single-column fluid layout** for mobile devices (Handheld tablets are the primary target for floor managers).

- **Grid:** 24px gutters provide enough "breathing room" to keep dense data from feeling cluttered.
- **Rhythm:** An 8px linear scaling system is used for most components, with 4px used for tight internal component spacing (e.g., icon next to text).
- **Margins:** Large 40px margins on desktop create a "Notion-like" clean canvas, centering the user's focus on the operational modules.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Glassmorphism** rather than heavy shadows.

- **Surface 0 (Background):** `#F8F6F3` (Off-white).
- **Surface 1 (Cards/Content):** `#FFFFFF` (Pure White) with a 1px border in `#E7E5E4` and a subtle `0 1px 4px rgba(0,0,0,0.06)` shadow.
- **Surface 2 (Floating/Headers):** Glassmorphic layers using `rgba(255, 255, 255, 0.86)` with a 24px backdrop blur. This is used for Top Navigation bars and floating "Quick Action" buttons.
- **Depth:** Elements that require urgent attention (Modals) should use a more pronounced shadow to distinguish them from the flat, data-heavy background.

## Shapes

The shape language is purposefully **Organic and Friendly** to counter-balance the rigors of restaurant management.

- **Cards & Modules:** Use `rounded-xl` (1.5rem / 24px) or `rounded-lg` (1rem / 16px) to create a soft, premium container feel.
- **Interactive Elements:** Buttons use a standard 8px radius, while **Status Chips** and **Search Bars** must be fully **Pill-shaped** (9999px) to distinguish them as secondary interactive/informational elements.
- **Inputs:** Maintain a soft 8px radius to ensure they feel modern but professional.

## Components

- **Buttons:** 
  - *Primary:* Terracotta background, white text. No gradient on standard buttons; gradients are reserved for "Copiloto AI" special triggers.
  - *Secondary:* White background, Terracotta border/text.
- **Input Fields:** Minimalist style with a 1px border. On focus, the border transitions to Terracotta with a subtle 2px glow.
- **Cards:** White containers. Every card that represents a "Category" (e.g., Labor, Sales) must have a 4px solid left-border accent in a semantic color.
- **Copiloto AI Insights:** These components use the Saffron (`#F59E0B`) accent and a very subtle Terracotta-to-Brown gradient background (`#B9532A` to `#9A3412`) to signify intelligence-driven content.
- **Data Tables:** High density (32px - 40px row height). Use Inter 14px for table content with alternating subtle row highlights in the off-white background color.
- **Pills/Chips:** Used for status (e.g., "Low Stock," "Clocked In"). Use high-contrast text on low-opacity backgrounds of the same hue.