---
name: Terminal Horizon
colors:
  surface: '#121318'
  surface-dim: '#121318'
  surface-bright: '#38393f'
  surface-container-lowest: '#0d0e13'
  surface-container-low: '#1a1b21'
  surface-container: '#1e1f25'
  surface-container-high: '#292a2f'
  surface-container-highest: '#34343a'
  on-surface: '#e3e1e9'
  on-surface-variant: '#c8c5d3'
  inverse-surface: '#e3e1e9'
  inverse-on-surface: '#2f3036'
  outline: '#918f9c'
  outline-variant: '#474651'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#272377'
  primary-container: '#312e81'
  on-primary-container: '#9c9af4'
  inverse-primary: '#5654a8'
  secondary: '#c0c1ff'
  on-secondary: '#1000a9'
  secondary-container: '#3131c0'
  on-secondary-container: '#b0b2ff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00432c'
  on-tertiary-container: '#14ba82'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#100563'
  on-primary-fixed-variant: '#3e3c8f'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#121318'
  on-background: '#e3e1e9'
  surface-variant: '#34343a'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 3.5rem
    fontWeight: '700'
    lineHeight: 3.75rem
    letterSpacing: -0.04em
  display-sm:
    fontFamily: Space Grotesk
    fontSize: 2.5rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
    letterSpacing: 0em
  body-md:
    fontFamily: Geist
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: Space Grotesk
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 0.75rem
    letterSpacing: 0.08em
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system approaches recruitment pipelines and technical learning paths as a high-density, professional command center. Designed for technical professionals, hiring managers, and students within technical disciplines, the interface prioritizes immediate comprehension, structured metrics, and focused productivity over decorative embellishment.

The visual style blends utilitarian minimalism with an experimental technical aesthetic:
- **Zero-radius structural geometry:** Clean, sharp rectangular perimeters convey precision and technical rigor.
- **Data-dense spatial discipline:** Information is framed through structured divisions, monospaced tabular data displays, and high-visibility status telemetry.
- **Instrument-grade clarity:** High-contrast indicators and disciplined contrast steps turn application flows and course progression into an objective, frictionless workflow.

## Colors

The palette establishes an immersive, low-strain dark environment constructed from layered obsidian and slate tones, accented by authoritative deep indigo and high-visibility status indicators.

### Surface Hierarchy
- **Canvas Base (`#090A0F`):** Deepest background tone, framing high-contrast content panes.
- **Surface Elevation 1 (`#11131F`):** Standard container background for listing cards, course units, and side navigation.
- **Surface Elevation 2 (`#1B1E30`):** Interactive cards, hover states, and input field backgrounds.
- **Surface Elevated Overlay (`#252942`):** Popovers, active filter toggles, and modal panes.

### Accent & Brand Tones
- **Primary Deep Indigo (`#312E81`):** Structural highlights, active selection indicators, and primary containers.
- **Secondary Indigo Light (`#6366F1`):** High-visibility action triggers, link states, and interactive focus indicators.
- **Tertiary Emerald (`#10B981`):** Course completion meters, verified skill authentications, and positive indicators.

### Status Indicators
Status indicators utilize full-contrast, solid backgrounds with high-contrast foreground labels to guarantee instant status recognition across application tracking boards:
- **Pending:** `#F59E0B` amber background with `#1A1001` text.
- **Shortlisted:** `#6366F1` bright indigo background with `#FFFFFF` text.
- **Hired:** `#10B981` emerald background with `#022C1E` text.
- **Rejected:** `#EF4444` crimson background with `#FFFFFF` text.
- **Under Review:** `#38BDF8` sky blue background with `#082F49` text.

## Typography

Typography establishes an analytical atmosphere by pairing the geometric, architectural qualities of **Space Grotesk** with the neutral, low-friction legibility of **Geist**.

- **Space Grotesk (Headlines & Labels):** Provides an assertive, technical aesthetic for job roles, course modules, salary brackets, and application metadata. Uppercase styling is reserved strictly for `label-sm` badges and telemetry tags.
- **Geist (Body & Documentation):** Delivers clean optical balance for lengthy job descriptions, applicant resumes, and structured lesson transcripts. Tabular numeral properties are activated globally to ensure aligned numerical comparisons across candidates and course metrics.

## Layout & Spacing

The layout is built upon an edge-to-edge modular grid that scales seamlessly between candidate dashboard consoles and mobile views.

- **Desktop (1200px+):** 12-column layout with fixed 320px contextual sidebars for filters, course navigation trees, or candidate match parameters.
- **Tablet (768px - 1199px):** 8-column layout. Sidebars collapse into sliding overlays or top-anchored horizontal trays.
- **Mobile (< 768px):** 4-column layout with edge-aligned structural boundaries. Gutters condense to `gutter-mobile` (`0.75rem`) to maximize content width for technical descriptions and code snippets.
- **Vertical Rhythm:** Content elements operate on a strict 4px/8px incremental rhythm, keeping inputs, filter pills, and table records uniformly aligned.

## Elevation & Depth

In line with the technical workbench aesthetic, depth is rendered through flat tonal layering and hairline structural borders rather than blur-based drop shadows.

- **Surface Layering:** Elements step forward through lightness tiering (`#090A0F` base -> `#11131F` card -> `#1B1E30` elevated panel) rather than elevation diffusion.
- **Border Definition:** Interfaces use crisp, 1px solid borders (`#2D3250`) to delineate structural sections, table cells, and module boundaries.
- **Active State Highlighting:** Selected or hovered containers replace dark border lines with a direct `1px solid #6366F1` glow or high-contrast border, maintaining absolute spatial geometry without layout shifts.

## Shapes

All shapes throughout this design system employ a strict `0px` border radius:
- Cards, form inputs, interactive pills, and modal panels feature sharp 90-degree corners.
- Avatar placeholders, progress bars, and high-visibility status badges adhere strictly to rectangular geometry.
- Progress visualization bars utilize solid, flat rectangular segments to reinforce an engineering-grade layout.

## Components

### Buttons
- **Primary:** Background `#6366F1`, text `#FFFFFF`, 0px radius, 1px solid `#6366F1`. Hover switches to `#4F46E5`.
- **Secondary / Outline:** Background `#11131F`, text `#FFFFFF`, 1px solid `#2D3250`. Hover triggers border `#6366F1` and background `#1B1E30`.
- **Destructive:** Background `#1A0B0E`, text `#EF4444`, 1px solid `#EF4444`.

### Application Status Badges
- **Form:** 0px radius, padding `space-xs` horizontal and vertical, `label-sm` font, uppercase.
- **Pending:** Solid `#F59E0B` with `#000000` text.
- **Shortlisted:** Solid `#6366F1` with `#FFFFFF` text.
- **Hired:** Solid `#10B981` with `#01261A` text.
- **Rejected:** Solid `#EF4444` with `#FFFFFF` text.

### Form Inputs & Selectors
- **Fields:** Background `#11131F`, 1px solid `#2D3250`, text `#FFFFFF`, placeholder `#64748B`.
- **Focus:** 1px solid `#6366F1` with an interior 1px offset ring in `#312E81`.
- **Checkboxes & Radios:** Sharp square perimeters (`0px` radius). Unchecked state has a 1px solid `#2D3250` border; checked state fills with `#6366F1` and features an interior solid square marker.

### Cards (Job Postings & LMS Courses)
- **Container:** Background `#11131F`, 1px solid `#2D3250`, 0px radius. Padding set to `space-md` or `space-lg`.
- **Interactive State:** Hover transitions the border directly to `#6366F1` with an interior background shift to `#151828`.
- **Header Structure:** Includes an upper metadata row for job post timestamp/course duration, title in `Space Grotesk`, followed by skill tags and status indicators.

### Course Progress Meters
- Segmented rectangular track with a `#1B1E30` background container.
- Filled progress value displayed in solid `#10B981` (or `#6366F1` for in-progress modules) with sharp rectangular boundaries.