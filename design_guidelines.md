# TinyLink Design Guidelines

## Design Approach

**Selected System:** Material Design + Linear-inspired minimalism for data-heavy productivity tools

**Rationale:** TinyLink is a utility-focused application prioritizing efficiency, clarity, and data visualization. The design should emphasize functionality over decorative elements while maintaining modern polish.

**Core Principles:**
- Information clarity above all else
- Generous whitespace for data breathing room
- Immediate visual feedback for all actions
- Scannable layouts with clear hierarchy

---

## Typography System

**Font Stack:** Inter (Google Fonts) for entire application

**Hierarchy:**
- Page Titles: text-3xl, font-semibold, tracking-tight
- Section Headers: text-xl, font-semibold
- Card Titles: text-lg, font-medium
- Body Text: text-base, font-normal
- Labels: text-sm, font-medium
- Metadata/Timestamps: text-sm, font-normal, opacity-70
- Table Headers: text-xs, font-semibold, uppercase, tracking-wide

---

## Layout System

**Spacing Scale:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 24

**Container Strategy:**
- Max width: max-w-7xl for all pages
- Horizontal padding: px-4 (mobile), px-6 (tablet), px-8 (desktop)
- Vertical rhythm: py-8 (sections), py-12 (page padding)

**Grid System:**
- Dashboard table: Single column, full width
- Stats cards: grid-cols-1 md:grid-cols-3 with gap-6
- Forms: max-w-2xl, single column layout

---

## Component Library

### Navigation Header
- Fixed top bar with subtle border-bottom
- Container: h-16, flex items-center, justify-between
- Logo: text-xl, font-bold
- Right side: Health status indicator (small badge)

### Dashboard Components

**Add Link Form Card:**
- Card with border, rounded-lg, p-6
- Two input fields stacked vertically with gap-4
- Long URL input: Full width
- Custom code input: w-full md:w-64 (optional field, clearly labeled)
- Submit button: Full width on mobile, auto on desktop
- Inline validation messages below inputs with text-sm

**Links Table:**
- Full-width responsive table with hover states on rows
- Alternating row treatment (subtle)
- Columns: Short Code (font-mono, font-medium) | Target URL (truncate with max-w-md, ellipsis) | Total Clicks (text-center, tabular-nums) | Last Clicked (text-sm, relative time) | Actions
- Actions column: flex gap-2 with Copy + Delete buttons
- Mobile: Stack into cards with defined labels
- Empty state: Centered message with icon, py-16

### Stats Page Layout

**Header Section:**
- Short code display: text-4xl, font-bold, font-mono
- Target URL: text-lg, truncate, clickable external link
- Back to dashboard link: top-left

**Metrics Grid:**
- 3-column grid (stack on mobile)
- Each metric card: p-6, rounded-lg, border
- Large number: text-4xl, font-bold, tabular-nums
- Label below: text-sm, uppercase, tracking-wide, opacity-70

### Buttons

**Primary Button (Create/Submit):**
- px-6, py-3, rounded-md, font-medium
- Disabled state: opacity-50, cursor-not-allowed

**Secondary Button (Copy):**
- px-4, py-2, rounded-md, border, font-medium
- Icon + text combination

**Danger Button (Delete):**
- px-4, py-2, rounded-md, text-sm

**Icon-only Buttons:**
- p-2, rounded-md, hover:bg interaction

### Form Inputs
- h-10, px-4, rounded-md, border, w-full
- Focus state: ring-2 offset treatment
- Error state: border with error color, shake animation
- Helper text: text-sm, mt-1

### Cards
- rounded-lg, border, shadow-sm treatment
- Padding: p-6 (content), p-4 (compact)

### Loading States
- Skeleton loaders for table rows: h-16, rounded, animated pulse
- Button loading: spinner icon + "Processing..." text
- Page loading: Centered spinner with backdrop

### Success/Error Messages
- Toast notifications: Fixed bottom-right, slide-in animation
- Inline form errors: Text with icon, fade-in
- 404 state: Centered with icon, clear message, link back

---

## Interaction Patterns

**Copy to Clipboard:**
- Click copies full shortened URL
- Button text changes: "Copy" → "Copied!" (2s)
- Subtle success animation

**Delete Confirmation:**
- Immediate action (no modal for speed)
- Show success toast notification
- Row fade-out animation before removal

**Form Validation:**
- Real-time for URL format (debounced)
- Immediate for duplicate code check
- Clear error messages: "Invalid URL format" | "Code already exists"

**Redirect Feedback:**
- Stats page shows "Redirecting..." state briefly before 302

---

## Responsive Behavior

**Breakpoints:**
- Mobile: < 768px - stack all elements, full-width buttons
- Tablet: 768px - 1024px - 2-column stats grid
- Desktop: > 1024px - full layout as designed

**Table Responsiveness:**
- Mobile: Transform to card layout with horizontal dividers
- Each card shows all data with clear labels
- Actions always visible and accessible

---

## State Management Visual Patterns

**Empty Dashboard:**
- Centered illustration/icon
- "No links yet" heading
- "Create your first short link" subtext
- Prominent Add Link CTA

**Loading:**
- Table: 3-5 skeleton rows
- Stats: Skeleton cards matching final layout
- Forms: Disabled with spinner on button

**Error States:**
- Red text with warning icon
- Specific error message
- Retry action where applicable

**Success:**
- Green toast notification
- Checkmark icon
- Auto-dismiss after 3s

---

## Health Check Page (/healthz)

- Minimal layout: centered card, max-w-md
- Display: Status badge, version number, uptime if available
- Simple JSON display with syntax highlighting (optional)

---

## Key UX Requirements

- All clicks provide immediate visual feedback
- Form submissions disable submit button during processing
- Short URLs always displayed in monospace font for clarity
- Click counts use tabular numbers for alignment
- Timestamps show relative time ("2 hours ago") with tooltip for absolute time
- Copy buttons provide clear success confirmation
- Delete actions are quick but safe (consider undo toast)