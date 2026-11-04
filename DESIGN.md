# tokscope — design system

Binding for all UI work in `frontend/`. When code and this file disagree, this file wins. If it's wrong, fix it in the same commit as the code.

Visual reference: a light, rounded analytics dashboard. Neutral canvas, a white app frame, an icon rail, pill controls, one black hero card, soft gray cards, rounded pill bars with one neon-green highlight, a cell heatmap and a cream table.

## 1. Principles

1. **Numbers first.** The largest thing on screen is a number the user cares about. Chrome stays quiet.
2. **One accent.** Brand green marks only _the_ thing that matters most in a view: the peak bar, the top heat level, the live dot. Never decoration, never text.
3. **Depth from surfaces, not shadows.** Layers are canvas → frame → card → inner. No drop shadows.
4. **Round and calm.** Big radii, generous spacing, few borders.
5. **Nothing is decorative without meaning.** Every icon is a button or a status. Every button does something real. No dead links.

## 2. Tokens

All tokens are CSS variables in `src/app/globals.css`, exposed to Tailwind with `@theme inline`. Light values sit on `:root`, dark values on `.dark`, and both share the same names. Tailwind's default color palette is removed (`--color-*: initial`). If a token is missing, add it here first, then in CSS.

### 2.1 Color

shadcn names are kept so its components work unmodified. Contrast ratios are measured; text needs ≥ 4.5:1, UI and graphics ≥ 3:1.

| Token                                                                      | Light                             | Dark                              | Use                                                                   |
| -------------------------------------------------------------------------- | --------------------------------- | --------------------------------- | --------------------------------------------------------------------- |
| `canvas`                                                                   | `#ECECEC`                         | `#0E0E0E`                         | Page behind the app frame                                             |
| `background`                                                               | `#FFFFFF`                         | `#141414`                         | App frame                                                             |
| `foreground`                                                               | `#111111`                         | `#F2F2F2`                         | Primary text (18.9 / 16.5:1)                                          |
| `card` / `card-foreground`                                                 | `#F2F2F2` / `#111111`             | `#1C1C1C` / `#F2F2F2`             | Default cards, pills (16.9 / 15.2:1)                                  |
| `muted` / `muted-foreground`                                               | `#F2F2F2` / `#666666`             | `#1C1C1C` / `#A3A3A3`             | Secondary text (5.1 / 6.8:1 on card)                                  |
| `popover` / `popover-foreground`                                           | `#FFFFFF` / `#111111`             | `#1C1C1C` / `#F2F2F2`             | Palette, menus, tooltips                                              |
| `primary` / `primary-foreground`                                           | `#0D0D0D` / `#FFFFFF`             | `#F2F2F2` / `#0D0D0D`             | Solid pill buttons, active rail item                                  |
| `secondary` / `secondary-foreground`                                       | `#F2F2F2` / `#111111`             | `#1C1C1C` / `#F2F2F2`             | Soft pill buttons                                                     |
| `accent` / `accent-foreground`                                             | `#E8E8E8` / `#111111`             | `#262626` / `#F2F2F2`             | Hover surface (shadcn meaning, _not_ the brand)                       |
| `surface-inverse` / `surface-inverse-foreground` / `surface-inverse-muted` | `#0D0D0D` / `#FFFFFF` / `#A6A6A6` | `#F2F2F2` / `#0D0D0D` / `#555555` | Hero KPI card (19.4:1, muted 8.0:1)                                   |
| `surface-warm`                                                             | `#FAF6E9`                         | `#23211A`                         | By-model table section (muted text 5.3 / 6.4:1)                       |
| `brand` / `brand-foreground`                                               | `#5CE65C` / `#0D0D0D`             | `#5CE65C` / `#0D0D0D`             | Peak bar, top heat level, live dot (ink on brand 12.0:1)              |
| `chart-bar`                                                                | `#DADADA`                         | `#333333`                         | Bar and heat-cell fill                                                |
| `chart-edge`                                                               | `#8A8A8A`                         | `#6B6B6B`                         | 1px inset edge on bars and cells (3.08 / 3.2:1 vs card, meets 1.4.11) |
| `heat-1` … `heat-3`                                                        | `#DADADA` · `#A6A6A6` · `#0D0D0D` | `#333333` · `#6B6B6B` · `#F2F2F2` | Heatmap levels 1–3 (level 0 = `card`, level 4 = `brand`)              |
| `border` / `input`                                                         | `#E3E3E3`                         | `#2A2A2A`                         | Hairlines only (table rows). Never the only cue for a control.        |
| `ring`                                                                     | `#111111`                         | `#F2F2F2`                         | Focus ring (18.9 / 16.5:1)                                            |
| `destructive`                                                              | `#C62828`                         | `#FF6B6B`                         | Errors (5.6 / 6.1:1)                                                  |
| `overlay`                                                                  | `#0D0D0D` at 50%                  | `#000000` at 60%                  | Dialog backdrop (replaces shadcn's `bg-black/50`)                     |

Rules:

- Brand green is **never text** and never the only signal. It is always paired with ink (an edge, a pill or a label).
- Graphics (bars, cells) carry a `chart-edge` inset edge so their shape reaches 3:1 against the card, and their value is also available as text.

### 2.2 Typography

- **Family:** `Outfit` via `next/font/google`, self-hosted, `display: swap`, weights **300, 400, 500, 600** only, exposed as `--font-sans`. Numbers use `tabular-nums`; if Outfit lacks `tnum`, use `Geist Mono` for table numbers only (`--font-mono`).
- **Scale:** defined as `--text-*` with paired line-height, tracking and weight. Tailwind's default sizes (`text-xs` … `text-9xl`) are **not used** outside `shared/ui/shadcn/`.

| Token          | Size / line-height                | Tracking | Weight | Use                                    |
| -------------- | --------------------------------- | -------- | ------ | -------------------------------------- |
| `text-display` | 3.5rem / 1.05 (2.5rem below `md`) | −0.03em  | 400    | The one `h1`                           |
| `text-kpi`     | 3rem / 1                          | −0.02em  | 400    | KPI values                             |
| `text-section` | 1.75rem / 2.25rem                 | −0.02em  | 400    | Dashboard section `h2` (Today, Trends) |
| `text-title`   | 1.125rem / 1.5rem                 | −0.01em  | 500    | Card and widget titles (`h3`)          |
| `text-body`    | 0.9375rem / 1.375rem              | 0        | 400    | Default text, table cells              |
| `text-label`   | 0.8125rem / 1.125rem              | 0        | 500    | Pills, buttons, table headers          |
| `text-caption` | 0.75rem / 1rem                    | 0.01em   | 400    | Axis labels, helper text, legends      |

- **Text rules:** sentence case everywhere, no all-caps labels. Use `text-wrap: balance` on headings and keep body text at most 65ch.

### 2.3 Radius, spacing, layering

- **Radius:**
  - `rounded-pill` (9999px): buttons, pills, bars, inputs.
  - `rounded-card` (1.75rem): cards, sections.
  - `rounded-frame` (2rem): app frame.
  - `rounded-inner` (1rem): nested blocks.
  - `rounded-cell` (0.75rem): heat cells.
  - shadcn's `rounded-sm|md|lg|xl` stay derived from `--radius: 1rem` and are used only inside `shared/ui/shadcn/`.
- **Spacing:** Tailwind's 4px `--spacing` grid. Card padding is `p-6`, the grid gap `gap-4`, section spacing `gap-4` (`md:gap-5`), and frame padding `p-4` (`lg:p-8`).
- **Shadows:** none. `shadow-*` utilities are not used. The only exception is popovers, which get one token: `shadow-popover`.
- **z-index tokens:** `z-base` 0, `z-sticky` 10, `z-overlay` 40, `z-modal` 50, `z-toast` 60. No other z values.

### 2.4 Motion

| Token             | Value                                             |
| ----------------- | ------------------------------------------------- |
| `--duration-fast` | 150ms (hover, press)                              |
| `--duration-base` | 250ms (state changes, pill slide)                 |
| `--duration-slow` | 400ms (entry, bar grow)                           |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)`                   |
| Spring (motion)   | `{ type: 'spring', stiffness: 380, damping: 32 }` |

## 3. Layout

```
canvas (min-h-dvh, p-4 lg:p-8)
└─ app frame (bg-background, rounded-frame, max-w-frame = --container-frame: 90rem, centered)
   ├─ nav.app-rail (72px, md+)        └─ below md: rail items move into the top bar
   └─ div (main column, p-6 lg:p-8)
      ├─ header.top-bar      palette trigger (search pill) ··· status pill
      ├─ main#content
      │  ├─ headline row     h1 "Your Claude usage"   ··· sync · connect
      │  ├─ section#today    h2 "Today" + date (UTC); always first on load
      │  │  ├─ KPI row       [cost: inverse] [total tokens] [busiest hour]
      │  │  └─ grid          tokens per hour (lg:col-span-5) · activity by hour (lg:col-span-7)
      │  └─ section#trends   h2 "Trends" ··· range pill (7d/30d/90d, default 30d) · export
      │     ├─ KPI row       [cost: inverse] [total tokens] [daily average]
      │     ├─ grid          tokens-per-day (lg:col-span-5) · activity (lg:col-span-7)
      │     └─ by-model table (surface-warm, full width)
```

- **Grid:** 12 columns from `lg`, a single column below. Never `100vh`; use `min-h-dvh`.
- **Breakpoints:** Tailwind defaults `sm` 640, `md` 768 (rail appears) and `lg` 1024 (multi-column grid).
- **Card alignment:** the title row is always the first row of a card: title on the left, controls (↗ icon button, filter pill) on the right, all controls 40px tall so they line up across cards.

## 4. Components

Every recurring class combination lives **once**, as a `cva` variant in `shared/ui` or in its widget's `ui/` folder. Copy-pasted class strings are a bug.

| Component                                                | Spec                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pill button** (`shared/ui/shadcn/button` variants)     | `solid` = primary bg; `soft` = card bg + accent hover; `ghost` = transparent + accent hover; `icon` = 40px circle. Height 40px (`sm` 32px, still ≥ 24px target), `rounded-pill`, `text-label`. Icon 16px, 8px gap. Press: `active:scale-98` (built-in Tailwind v4 utility, no arbitrary value).                                                                                                                                                                                                                                         |
| **Icon arrow button** (↗ on cards)                       | `icon` variant, 36px, bg `background` on default cards and `surface-inverse-foreground` on the inverse card. Always has an `aria-label` ("Show cost by model").                                                                                                                                                                                                                                                                                                                                                                         |
| **App rail**                                             | `nav aria-label="Primary"`, 72px wide, items 44px circles stacked with `gap-2`. Logo on top, actions (palette, shortcuts, theme) at the bottom. The active item is `primary` bg with `aria-current="page"`, and every item has a tooltip with its label and shortcut.                                                                                                                                                                                                                                                                   |
| **Top bar**                                              | `header`. Left: the search pill (a `button` that opens the palette, with a magnifier icon, the text "Search or run a command" and a `Kbd` ⌘K hint). Right: the status pill.                                                                                                                                                                                                                                                                                                                                                             |
| **Status pill**                                          | `card` bg, a dot and text. The dot is `brand` (synced < 5 min) or `chart-edge` (stale or disconnected). Fetch errors are handled by `error.tsx`, not the pill. The text is relative ("Synced 2 min ago" / "Disconnected · data until Nov 3" / "Not connected"). `role="status"`, `aria-live="polite"`.                                                                                                                                                                                                                                  |
| **Range pill**                                           | A link group (`nav aria-label="Date range"`) with three `Link`s (7d · 30d · 90d). The active one has `aria-current="page"`, and a `primary` indicator slides beneath it (motion `layoutId`).                                                                                                                                                                                                                                                                                                                                            |
| **KPI card** (`kpiCard` cva: `tone: inverse \| default`) | An `article` with an `h2` (`text-title`), the value `p` (`text-kpi tabular-nums`), and a caption line ("Across 3 models"). `rounded-card p-6`; min-height keeps the 3 cards equal.                                                                                                                                                                                                                                                                                                                                                      |
| **Tokens per day**                                       | A `section` holding a `figure`, then an `ol` of bars. Bars are `rounded-pill`, `chart-bar` fill with a `chart-edge` 1px inset ring, and height = value / max. The peak bar is `brand` with an ink ring and an ink value pill above it. On hover, the pill moves to the hovered bar (CSS `:hover` / `:has()`, no JS). Each `li` contains visually hidden text "Nov 3: 9.7M tokens". Axis labels in `text-caption`: weekday for 7d, every 5th day for 30d, every 15th for 90d. Bars aren't focusable; the list is read by screen readers. |
| **Activity heatmap**                                     | A `section` holding a `table` with a visually hidden `caption`, `th scope="row"` (model) and `th scope="col"` (period). Cells are `rounded-cell` with a `chart-edge` inset ring and `data-level="0..4"` styled via `data-[level=n]:` variants, and contain hidden text with the exact value. Legend: "Less ▢▢▢▢▢ More". It scrolls horizontally below `md` (`data-lenis-prevent`).                                                                                                                                                      |
| **By-model table**                                       | `surface-warm` section titled by its `h2` (`aria-labelledby`), containing a `table` with `th scope="col"` headers. Numbers are right-aligned `tabular-nums`. The share column shows a pill bar (`chart-bar` track, `primary` fill) plus a %. Unknown cost renders `—` with the hidden text "price unknown".                                                                                                                                                                                                                             |
| **Command palette**                                      | shadcn `CommandDialog`. Groups: Actions (Sync now, Connect/Disconnect, Export CSV), View (7 / 30 / 90 days), Preferences (Theme, Shortcuts). Each row shows its `Kbd` shortcut. Lazy-loaded.                                                                                                                                                                                                                                                                                                                                            |
| **Shortcuts dialog**                                     | shadcn `Dialog` with a two-column `dl` of keys and actions, plus a switch "Single-key shortcuts" (persisted).                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Toast**                                                | `sonner`, bottom-right, `z-toast`. Used for sync, connect and export results. Error toasts persist until dismissed.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **Skeleton**                                             | Same shape and size as the real widget, `card` bg with a gentle opacity pulse (`motion-safe` only).                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **Empty state**                                          | Inside the KPI area: "No usage yet". One sentence explains that Connect reads `~/.claude/projects` read-only, followed by the Connect button. No illustration.                                                                                                                                                                                                                                                                                                                                                                          |
| **Error state**                                          | `error.tsx`: what failed, why it might have happened, and a Retry button. Never a stack trace.                                                                                                                                                                                                                                                                                                                                                                                                                                          |

## 5. Semantic UI convention

- **Landmarks:** a skip link "Skip to content" → `#content`, then `nav` (rail), `header` (top bar) and `main#content`. Exactly **one `h1`**. Each card or section has an `h2`, and `section` uses `aria-labelledby` pointing to its `h2`.
- **Right element for the job:**
  - `button` performs an action and `a`/`Link` navigates. Never a `div` with `onClick`.
  - `table` holds tabular data, including the heatmap. `ol`/`ul` holds sequences, including the bars. `dl` holds key–value pairs (the shortcut list).
  - `figure` + `figcaption` wrap charts. `time dateTime=…` marks dates.
- **Naming by role:** `KpiCard`, `StatusPill`, `TokensPerDay`. Never names that describe the look (`BlackCard`, `GreenBar`).
- **State lives in attributes**, styled with variants:
  - `aria-current`, `aria-pressed`, `aria-expanded`, `data-state`, `data-level`, `data-tone`.
  - Style them with `aria-[current=page]:bg-primary` or `data-[level=4]:bg-brand`.
  - **No ternaries building class strings**; use `cva` variants or data attributes.
- **Icons:** `lucide-react`, 16px (20px in the rail), stroke 1.75 everywhere. Decorative icons get `aria-hidden`. Icon-only buttons need an `aria-label`.

## 6. Tailwind rules (token-only)

1. Only tokens from §2 exist. The default palette is removed, and default font sizes and shadows are lint-restricted.
2. **No arbitrary values** (`p-[13px]`, `text-[#5ce65c]`, `w-[372px]`) outside `shared/ui/shadcn/`. If you need a new value, add a token here and in CSS.
3. Merge classes only with `cn()` (`@/shared/lib/cn`). A combination used twice becomes a `cva` variant. No copy-paste.
4. No `@apply`, except in `@layer base` in `globals.css`. No inline `style`, except CSS custom properties that carry data (`style={{ '--value': 0.42 }}` for bar heights).
5. Class order is set by `prettier-plugin-tailwindcss`. Unknown, duplicate and conflicting classes are lint errors (`eslint-plugin-better-tailwindcss`).
6. The dark variant comes only from `.dark` tokens. Never write `dark:` utilities in components, because the tokens already switch.

## 7. Accessibility (WCAG 2.2 AA)

- [ ] **Contrast:** values per §2.1. Text ≥ 4.5:1; UI parts, focus rings and chart shapes ≥ 3:1.
- [ ] **Focus:** `focus-visible:` 2px `ring` with a 2px offset on every focusable element. Focused elements are never hidden under sticky UI (2.4.11).
- [ ] **Keyboard:** everything works by keyboard; the tab order follows the visual order; Esc closes overlays; focus returns to the trigger when an overlay closes.
- [ ] **Targets:** ≥ 24×24px (2.5.8); our controls are 32–44px.
- [ ] **Color:** never the only carrier of meaning (1.4.1). Bars and cells have text values, the status dot has text, and errors have text and an icon.
- [ ] **Shortcuts:** single-key shortcuts can be turned off (2.1.4), are ignored inside inputs and editable fields, and are documented in the shortcuts dialog.
- [ ] **Motion:** with `prefers-reduced-motion: reduce`, there is no Lenis, no count-up, no stagger, and no bar growth. The final state is shown instantly.
- [ ] **Live regions:** status pill (`polite`), toasts (sonner's built-in), and Server Action error text (`role="alert"`).
- [ ] **Language and title:** `<html lang="en">` and a meaningful `<title>`.
- [ ] **Automated checks:** `vitest-axe` reports zero violations on the view, rail and palette. Lighthouse accessibility = 100.

## 8. Keyboard shortcuts

| Keys        | Action                              | Single-key?    |
| ----------- | ----------------------------------- | -------------- |
| ⌘K / Ctrl+K | Open command palette                | no (always on) |
| `/`         | Open command palette                | yes            |
| `s`         | Sync now                            | yes            |
| `1` `2` `3` | 7 / 30 / 90 days                    | yes            |
| `e`         | Export CSV                          | yes            |
| `t`         | Cycle theme (system → light → dark) | yes            |
| `?`         | Shortcuts dialog                    | yes            |
| Esc         | Close overlay                       | —              |

Connect and Disconnect have no shortcut; they are available only from the palette or the button. Hints are rendered with shadcn `Kbd`, showing ⌘ on macOS and Ctrl elsewhere.

## 9. Cursors

| Cursor        | Where                                                               |
| ------------- | ------------------------------------------------------------------- |
| `pointer`     | Buttons, links, rail items, range pills, palette rows               |
| `not-allowed` | Disabled controls (plus 50% opacity and `aria-disabled`)            |
| `progress`    | `html` while a sync or connect is pending (`data-busy` on `<html>`) |
| `help`        | `Kbd` hints and abbreviations with tooltips                         |
| `default`     | Cards, bars, cells, text                                            |

No custom cursor follower.

## 10. Motion rules

- **CSS first:** bar growth (`scaleY` from the bottom), heatmap fade and skeleton pulse use `motion-safe:` keyframes. Animate only `transform` and `opacity`.
- **`motion` only where CSS can't:**
  - the range-pill `layoutId` slide;
  - KPI count-up on first paint (≤ 600ms);
  - staggered section entry (40ms steps, y 8px → 0, opacity 0 → 1, spring token).
- **Setup:** `LazyMotion strict` with `domMax` features loaded asynchronously (needed for `layoutId`), `m.*` components only (`import * as m from 'motion/react-m'`), and `MotionConfig reducedMotion="user"`. The count-up imports `animate` dynamically. Entry animations run only after hydration, so server HTML is always visible without JS.
- **Lenis:** root smooth scroll with `lerp: 0.1`, used for the ↗ jumps (`lenis.scrollTo('#by-model', { offset: -24 })`). It is not mounted for reduced motion. Inner scroll areas get `data-lenis-prevent`.
- **Durations:** UI never waits on an animation. Data appears at once and animation only decorates its arrival.

## 11. Content and voice

- Sentence case, plain words, active voice, no exclamation marks, no "Oops".
- Errors name what failed and what to do next: "Backend unreachable. Check that the backend container is running, then retry."
- Use real units: "9.7M tokens", "$118.26", "2 min ago". Unknown values show "—", never "0" or "N/A".
- Copy names: "Your Claude usage", "Estimated cost", "Total tokens", "Today", "Tokens per day", "Activity", "By model".

## 12. Files and naming (frontend)

- **kebab-case** for every file and folder under `src/` (`kpi-card.tsx` exports `KpiCard`; `use-hotkeys.ts` exports `useHotkeys`). Enforced by `eslint-plugin-check-file`.
- Tests sit next to their code: `kpi-card.test.tsx`.
- FSD layers follow CLAUDE.md. shadcn-generated primitives live in `src/shared/ui/shadcn/` and are edited only to map them onto our tokens.

## 13. Do / don't

| Do                                 | Don't                                          |
| ---------------------------------- | ---------------------------------------------- |
| One green thing per view           | Green text, green borders, multiple greens     |
| Surfaces for depth                 | Drop shadows, gradients, glassmorphism         |
| `cva` variant for a repeated style | Copy-pasted class strings, ternary class names |
| Tokens (`bg-card`, `text-label`)   | `bg-gray-100`, `text-sm`, `p-[13px]`           |
| `table` / `ol` for data            | `div` grids for data                           |
| Text alternative for every chart   | Color as the only signal                       |
| `min-h-dvh`                        | `h-screen` / `100vh`                           |
