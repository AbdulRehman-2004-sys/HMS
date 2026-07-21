# Design Guidelines - LALA Medical Complex HMS

This document establishes the UI design language for the Hospital Management System (HMS). The design is optimized for healthcare professionals, emphasizing utility, clarity, and visual simplicity over flashiness.

## 1. Design Philosophy
- **High Utility / Low Cognitive Load:** Staff are often working under pressure. Visual hierarchies must be unambiguous.
- **Sterile & Clinical Aesthetic:** Use a cool-toned, clinical color palette (slate, teal, blue) that communicates precision and hygiene.
- **Accessibility (A11y):** Enforce readable text contrasts, focus rings on keyboard inputs, and support simple navigation.

## 2. Color Palette
Colors are driven by Tailwind CSS tokens. Avoid hardcoded hex values.

| Name | Tailwind Token | HSL Value | Description / Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | `bg-teal-600` | `172.4 66% 50%` | Navigation headers, call-to-actions, highlight states |
| **Secondary** | `bg-slate-700` | `215.4 16.3% 46.9%` | Sidebar, subtext, inactive states |
| **Background**| `bg-slate-50` | `210 20% 98%` | Global application canvas background |
| **Card / Surface**| `bg-white` | `0 0% 100%` | Card backdrops, table data rows |
| **Border** | `border-slate-200`| `214.3 31.8% 91.4%` | Layout lines, input frames, boundaries |
| **Destructive**| `bg-red-600` | `346.8 77.2% 49.8%` | Error banners, allergy indicators, cancellations |
| **Success** | `bg-emerald-600` | `142.1 76.2% 36.3%`| Complete bills, resolved logs, positive outcomes |

## 3. Typography
- **Primary Font:** Inter, Outfit, or standard sans-serif system fonts (`Segoe UI`, `SF Pro Display`).
- **Heading 1 (`<h1>`):** `text-2xl font-semibold tracking-tight text-slate-900`
- **Heading 2 (`<h2>`):** `text-xl font-medium text-slate-800`
- **Body Text:** `text-sm text-slate-600 leading-relaxed`
- **Labels / Small Text:** `text-xs font-medium text-slate-500`

## 4. Layout & Spacing
Spacing uses standard Tailwind sizing increments (`space-y-4`, `p-6`):
- **Page Container Padding:** `p-6` on desktop, `p-4` on tablet/mobile.
- **Grid Gap:** `gap-6` for principal layouts, `gap-4` for form layouts.
- **Form Row Spacing:** `space-y-4` between rows, `gap-4` between adjacent inputs.

## 5. UI Components Guidelines

### Buttons
- **Primary:** Rounded buttons (`rounded-md`), flat background (`bg-teal-600`), bold white text, hover state (`hover:bg-teal-700`), transition duration `duration-200`.
- **Secondary:** Transparent background, thin border (`border border-slate-200`), dark text, hover state (`hover:bg-slate-50`).
- **Destructive:** Bright red background (`bg-red-600`), white text.

### Inputs & Forms
- **Structure:** Always group label and input in a `flex flex-col gap-1.5` container.
- **Visuals:** Thin slate borders, transition to primary teal border on focus (`focus:border-teal-500 focus:ring-1 focus:ring-teal-500`).
- **Required fields:** Highlighted with a red asterisk `*` in the label.

### Tables
- **Grid Layout:** Minimal style with no vertical grid lines. Use horizontal borders only.
- **Header:** Slate background (`bg-slate-100/80`), bold gray headers (`text-slate-500 uppercase tracking-wider text-xs`).
- **Rows:** White backgrounds, hover shading effect (`hover:bg-slate-50/80`).

### Cards
- **Aesthetic:** Minimal border (`border-slate-200`), rounded corners (`rounded-lg`), subtle drop shadow (`shadow-sm`).
- **Header:** Slate divider separating title from core body data.

## 6. Dashboard & Sidebar Styles
- **Sidebar:** Dark navy/slate background (`bg-slate-900`). White/gray active/inactive icons. Collapsible on mobile/tablets.
- **Header:** Sticky top header (`sticky top-0 bg-white/80 backdrop-blur-md`), containing user profile menu, notification icons, and page title.

## 7. Responsive Rules
- **Desktop (>= 1024px):** Show full sidebar navigation, multi-column tables, side-by-side forms.
- **Tablet (768px - 1023px):** Collapsed sidebar navigation, responsive stacked forms.
- **Mobile (< 768px):** Drawer navigation, fully stacked lists instead of large tables, full-width buttons.

## 8. Printing Styles (CSS `@media print`)
Healthcare workflows rely heavily on paper records. Every document page must render cleanly on A4 paper:
- **Hide UI Shell:** Hide sidebar, main navigation, top header, filters, and action buttons (`@media print { .no-print { display: none; } }`).
- **Pure White Background:** Force white background color and black text to preserve ink.
- **No Page Breaks inside tables/receipts:** Force page-break prevention (`page-break-inside: avoid`).
