---
name: HireHub Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3e4947'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6e7977'
  outline-variant: '#bdc9c6'
  surface-tint: '#006a63'
  primary: '#005c55'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#a3faef'
  inverse-primary: '#80d5cb'
  secondary: '#3b665f'
  on-secondary: '#ffffff'
  secondary-container: '#bdece2'
  on-secondary-container: '#416c65'
  tertiary: '#0c5b56'
  on-tertiary: '#ffffff'
  tertiary-container: '#2f746f'
  on-tertiary-container: '#b3f7f0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf2e8'
  primary-fixed-dim: '#80d5cb'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#00504a'
  secondary-fixed: '#bdece2'
  secondary-fixed-dim: '#a2d0c6'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#224e47'
  tertiary-fixed: '#abefe8'
  tertiary-fixed-dim: '#8fd3cc'
  on-tertiary-fixed: '#00201e'
  on-tertiary-fixed-variant: '#00504b'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.025em
  headline-xl:
    fontFamily: Inter
    fontSize: 1.875rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1rem
  label-lg:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
  label-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
  label-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.01em
  overline:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system embodies an authoritative, calm, and highly dependable mainstream employment platform. Crafted for high-intent job seekers, enterprise hiring managers, and independent recruiters, the visual aesthetic prioritizes clarity, cognitive ease, and professional trust.

### Visual Style: Corporate / Modern

- **Clarity Over Novelty:** Structural layouts rely on precise vertical rhythm, disciplined alignment, and generous breathing room rather than experimental visual treatments.
- **Human Warmth & Authority:** A deep teal primary tone anchors the interface with executive presence, avoiding cold corporate blues while remaining universally approachable.
- **Restrained Realism:** Surfaces leverage crisp 1px borders paired with soft, low-contrast ambient shadows to establish physical structure without artificial gloss or visual noise.
- **Information Density Control:** High-volume recruitment tables, candidate pipelines, and applicant profiles maintain rigorous legibility through strict typographic scales and subdued contextual status badges.

## Colors

The color palette establishes an uncompromising light-mode ecosystem designed for all-day recruitment operations and clear candidate evaluations.

### Palette Roles & Balance

- **Primary (`#0f766e`):** Used strictly for high-priority interactive affordances—primary submission triggers, active navigation items, focused tab underlines, and key progress indicators. The deep variations (`#115e59` for hover, `#134e4a` for active states) preserve tactile feedback while ensuring contrast ratios consistently exceed WCAG AAA standards against white.
- **Secondary & Accent Tint (`#ccfbf1`, `#f0fdfa`):** Soft teal washes provide low-arousal emphasis for badge surfaces, interactive row selections, and subtle pill toggles.
- **Neutral Canvas Architecture:** 
  - Canvas page background: `#f8fafc` (slate-50) establishes subtle contrast against foreground cards.
  - Cards, panels, and modal containers: Pure `#ffffff` for maximum surface clarity.
  - Dividers and structural boundaries: Defined strictly with 1px hairline borders (`#e2e8f0` for interior dividers, `#cbd5e1` for component perimeter boundaries).
- **Typography Tones:**
  - Headings and vital numbers: `#0f172a` (slate-900).
  - Standard body prose and input contents: `#1e293b` (slate-800).
  - Secondary metadata, timestamps, and column labels: `#64748b` (slate-500).
- **Semantic Recruitment Badges:**
  - **Pending:** `#fef3c7` background with `#92400e` text and `#f59e0b` status dot.
  - **Shortlisted:** `#e0e7ff` background with `#3730a3` text.
  - **Hired:** `#dcfce7` background with `#166534` text.
  - **Rejected:** `#fee2e2` background with `#991b1b` text.

## Typography

Typography in this design system is driven by **Inter**, chosen for its neutral personality, tabular metric capabilities, and distinct legibility across small sizes.

### Application Rules

- **Headlines (`display-lg` through `headline-sm`):** Reserved for page headings, candidate names, job titles, and analytical dashboard metrics. Tracking is subtly tightened (down to `-0.025em`) to produce a confident, editorial look without compromising read order.
- **Body (`body-lg`, `body-md`, `body-sm`):** Applied to candidate cover letters, job role descriptions, and audit history logs. Standard line heights are tuned to 1.4–1.5x font size for sustained readability.
- **Labels & Overlines:** `label-md` and `label-lg` govern form inputs, table headers, and action buttons. `overline` uses full uppercase casing with `0.05em` letter tracking to label category clusters and applicant stage milestones.
- **Tabular Figures:** All numerical tables, salary ranges, candidate pipeline counts, and date timestamps must enable `font-feature-settings: "tnum"` to maintain strict columnar alignment across dynamic updates.

## Layout & Spacing

The layout is constructed on a disciplined 8pt base grid with a 4pt sub-grid for tight inline controls.

### Grid Architecture

- **Desktop (1200px+):** 12-column responsive fluid grid pinned to a maximum container width of `1280px` (or full width for high-density applicant tracking pipelines), using `1.5rem` (24px) gutters and `2rem` (32px) exterior margins.
- **Tablet (768px – 1199px):** 8-column layout with `1.5rem` gutters and `1.5rem` page margins. Left-hand global navigation collapses to an accessible icon rail or drawer.
- **Mobile (Below 768px):** 4-column layout utilizing `1rem` (16px) gutters and `1rem` page margins. Filter ribbons collapse into unified slide-over trays, and multi-column tables transition into card-based candidate lists.

### Spacing Usage Rules

- `space-xs` (4px): Inline badge spacing, icon-to-label gaps within badges.
- `space-sm` (8px): Input padding (vertical), button inner margins, grouped action item gaps.
- `space-md` (16px): Standard form element gap, card body internal padding for compact widgets, table row heights.
- `space-lg` (24px): Standard card padding, modal content perimeter, candidate profile section gaps.
- `space-xl` (32px): Dashboard widget separating gaps, pipeline column margins.
- `space-2xl` (48px): Major section divides within long-form talent pages and institutional job listings.

## Elevation & Depth

This design system avoids high-contrast shadows, stark neomorphic bevels, or blurred glassmorphism. Depth is achieved through restrained layering, using clean white containers over off-white backdrops, paired with soft, low-intensity ambient shadows.

### Elevation Hierarchy

- **Level 0 (Flat Canvas):** `#f8fafc` canvas background with zero elevation. Static dividers use a 1px solid `#e2e8f0` stroke.
- **Level 1 (Cards & Data Surfaces):**
  - **Shadow:** `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`
  - **Border:** 1px solid `#e2e8f0`
  - **Application:** Job card summaries, talent profile previews, filter sidebars, analytical KPI containers.
- **Level 2 (Interactive Hover & Elevated Panels):**
  - **Shadow:** `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`
  - **Border:** 1px solid `#cbd5e1`
  - **Application:** Card hover states, candidate pipeline cards dragged across stages, pinned sticky header elements.
- **Level 3 (Overlays, Flyouts & Menus):**
  - **Shadow:** `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)`
  - **Border:** 1px solid `#e2e8f0`
  - **Application:** Autocomplete dropdowns, recruiter profile menus, contextual stage change menus.
- **Level 4 (Modals & Drawers):**
  - **Shadow:** `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`
  - **Overlay Backdrop:** `rgba(15, 23, 42, 0.4)` (slate-900 at 40% opacity with no blur).
  - **Application:** Full candidate review drawers, job posting submission modals.

## Shapes

The design system maintains a balanced medium curvature throughout its interactive architecture. Elements deliver modern friendliness while holding a crisp, geometric framework suitable for enterprise hiring tools.

### Radius Distribution Rules

- **Base Radius (`0.5rem` / 8px):** Primary interactive controls including input fields, select triggers, interactive buttons, tabs, segment controls, and dropdown containers.
- **Container Radius (`rounded-lg` / `0.75rem` - `1rem` / 12px - 16px):** Primary content cards, candidate preview panels, dashboard metric tiles, and pipeline Kanban columns.
- **Modal Radius (`rounded-xl` / `1rem` / 16px):** Application dialogs and desktop drawer header containers.
- **Pill Radius (`9999px`):** Status indicator badges, skill tags, filter chips, and avatar containers.

## Components

### Buttons
- **Primary Button:** Background `#0f766e`, text `#ffffff`, border radius `8px` (`0.5rem`), font weight `600`, padding `0.625rem 1rem`. Hover: `#115e59`. Active: `#134e4a`. Focus: `0 0 0 3px rgba(15, 118, 110, 0.25)`.
- **Secondary Button:** Background `#ffffff`, text `#0f172a`, border `1px solid #cbd5e1`, border radius `8px`. Hover: `#f8fafc` with border `#94a3b8`.
- **Subtle / Ghost Button:** Background transparent, text `#0f766e`, border radius `8px`. Hover: `#f0fdfa` surface.

### Input Fields & Selects
- Background `#ffffff`, text `#0f172a`, border `1px solid #cbd5e1`, border radius `8px`, vertical padding `0.5rem`, horizontal padding `0.75rem`.
- Placeholder color: `#94a3b8`.
- Focus state: Border color `#0f766e` paired with an outer box-shadow ring `0 0 0 3px rgba(15, 118, 110, 0.15)`.
- Error state: Border color `#ef4444` paired with ring `0 0 0 3px rgba(239, 68, 68, 0.15)`.

### Cards & Container Panels
- Background `#ffffff`, border `1px solid #e2e8f0`, border radius `12px` (`0.75rem`), shadow Level 1.
- Padding: `1.5rem` for standard desktop views; `1rem` on mobile screens.
- Interactive job listing cards apply Level 2 shadow and border `#cbd5e1` on hover with a smooth `150ms ease` transition.

### Chips & Filter Tags
- **Skill / Neutral Chip:** Background `#f1f5f9`, text `#334155`, radius `9999px`, padding `0.25rem 0.75rem`, font size `0.75rem`, font weight `500`.
- **Active Filter Chip:** Background `#ccfbf1`, text `#0f766e`, border `1px solid #99f6e4`, radius `9999px`.

### Candidate Pipeline Status Badges
- Displayed as inline-flex items with radius `9999px`, padding `0.25rem 0.625rem`, font size `0.75rem`, font weight `600`.
- **Pending:** Background `#fef3c7`, text `#92400e`. Includes a leading 6px circular dot `#f59e0b`.
- **Shortlisted:** Background `#e0e7ff`, text `#3730a3`.
- **Hired:** Background `#dcfce7`, text `#166534`.
- **Rejected:** Background `#fee2e2`, text `#991b1b`.

### Checkboxes & Radio Controls
- Square checkbox (`radius: 4px`) and round radio (`radius: 50%`), dimension `16px × 16px`, border `1.5px solid #cbd5e1`, background `#ffffff`.
- Checked state: Background `#0f766e`, border color `#0f766e`, with pure white glyphs.

### Lists & Data Tables
- Header row: Background `#f8fafc`, text `#64748b`, uppercase `0.6875rem` (`overline`), border-bottom `1px solid #e2e8f0`, height `40px`.
- Table rows: Background `#ffffff`, border-bottom `1px solid #f1f5f9`, height `56px`. Hover: Background `#f8fafc`.