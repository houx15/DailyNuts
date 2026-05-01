# TDD Plan: DailyNuts AI Learning Aggregator

## Work Items

### WI-1: Data Loading Utilities
- **Description**: Create utility functions to read and parse JSON content files at build time
- **Acceptance criteria**:
  - [ ] Can read items for a specific date
  - [ ] Can read briefs for a specific date
  - [ ] Can list all available dates
  - [ ] Can read source metadata
  - [ ] Handles missing files gracefully
  - [ ] Returns properly typed data structures
- **Required tests**:
  - Read items JSON and return typed array — assertion level: Level 1 (output verification)
  - Read brief JSON and return typed object — assertion level: Level 1
  - List available dates in reverse chronological order — assertion level: Level 1
  - Handle missing date gracefully — assertion level: Level 1 (throws error)
  - Handle invalid JSON gracefully — assertion level: Level 1 (throws error)

### WI-2: Layout and Navigation Components
- **Description**: Create base layout, masthead, language toggle, and sub-bar components
- **Acceptance criteria**:
  - [ ] Masthead displays title and navigation
  - [ ] Language toggle switches between ZH/EN
  - [ ] Sub-bar shows issue number and item count
  - [ ] Navigation links work correctly
  - [ ] Language preference persists in localStorage
- **Required tests**:
  - Masthead renders title and nav links — assertion level: Level 1 (DOM output)
  - Language toggle renders both buttons — assertion level: Level 1
  - Language toggle calls handler on click — assertion level: Level 1 (state change)
  - Sub-bar displays correct issue number — assertion level: Level 1
  - Sub-bar displays correct item count — assertion level: Level 1

### WI-3: Date Picker Component
- **Description**: Create interactive date picker with calendar view
- **Acceptance criteria**:
  - [ ] Displays current selected date
  - [ ] Opens calendar popover on click
  - [ ] Shows available dates with indicators
  - [ ] Allows month navigation
  - [ ] Selects date and closes on click
  - [ ] Has "back to today" button
- **Required tests**:
  - Renders trigger with formatted date — assertion level: Level 1
  - Opens popover on click — assertion level: Level 1 (DOM visibility)
  - Shows calendar grid with correct days — assertion level: Level 1
  - Marks available dates with indicator — assertion level: Level 1
  - Calls onPick when date selected — assertion level: Level 1
  - Closes popover after selection — assertion level: Level 1

### WI-4: Hero / Daily Brief Component
- **Description**: Create hero section displaying daily brief
- **Acceptance criteria**:
  - [ ] Displays headline with editorial styling
  - [ ] Shows lede paragraph
  - [ ] Renders themed sections
  - [ ] Handles missing sections gracefully
  - [ ] Responsive layout
- **Required tests**:
  - Renders headline in correct language — assertion level: Level 1
  - Renders lede paragraph — assertion level: Level 1
  - Renders themed sections — assertion level: Level 1
  - Shows fallback when no sections — assertion level: Level 1
  - Displays correct item count — assertion level: Level 1

### WI-5: Item Card and Item List Components
- **Description**: Create item display components with source badges and summaries
- **Acceptance criteria**:
  - [ ] Displays source monogram circle with brand color
  - [ ] Shows title in selected language
  - [ ] Shows summary in selected language
  - [ ] Displays categories as tags
  - [ ] Shows publication metadata
  - [ ] Groups items by theme
- **Required tests**:
  - ItemRow renders all item data — assertion level: Level 1
  - ItemRow shows correct language content — assertion level: Level 1
  - MonoCircle renders with correct color and text — assertion level: Level 1
  - ItemsSection groups by theme — assertion level: Level 1
  - ItemsSection filters empty themes — assertion level: Level 1

### WI-6: Detail Drawer Component
- **Description**: Create slide-out drawer for item details
- **Acceptance criteria**:
  - [ ] Opens when item is selected
  - [ ] Closes on scrim click or Escape key
  - [ ] Displays full item details
  - [ ] Shows source information
  - [ ] Has link to original article
  - [ ] Prevents body scroll when open
- **Required tests**:
  - Drawer opens when item provided — assertion level: Level 1 (DOM visibility)
  - Drawer closes on close button click — assertion level: Level 1
  - Displays item title in correct language — assertion level: Level 1
  - Shows source monogram and name — assertion level: Level 1
  - Renders metadata grid correctly — assertion level: Level 1

### WI-7: Archive Page
- **Description**: Create archive page with date listing
- **Acceptance criteria**:
  - [ ] Lists all available dates
  - [ ] Shows headline for each date
  - [ ] Shows item count for each date
  - [ ] Allows date filtering
  - [ ] Clicking date navigates to that issue
- **Required tests**:
  - Renders list of dates — assertion level: Level 1
  - Shows correct headline for each date — assertion level: Level 1
  - Shows correct item count — assertion level: Level 1
  - Calls onOpenDate when row clicked — assertion level: Level 1
  - Filter by date works correctly — assertion level: Level 1

### WI-8: Main Page Integration
- **Description**: Integrate all components into main page with routing
- **Acceptance criteria**:
  - [ ] Loads data at build time
  - [ ] Renders with default to latest date
  - [ ] Handles language switching
  - [ ] Handles date navigation
  - [ ] Handles route changes (today/archive)
  - [ ] Static generation works correctly
- **Required tests**:
  - Page renders with data — assertion level: Level 1
  - Language switch updates content — assertion level: Level 1
  - Date picker changes displayed content — assertion level: Level 1
  - Archive route shows archive page — assertion level: Level 1

### WI-9: Design System and Styling
- **Description**: Apply design system from prototype (fonts, colors, spacing)
- **Acceptance criteria**:
  - [ ] CSS custom properties match design
  - [ ] Typography matches editorial style
  - [ ] Color scheme matches warm paper aesthetic
  - [ ] Responsive breakpoints work
  - [ ] Animations and transitions smooth
- **Required tests**:
  - CSS variables are defined — assertion level: Level 1
  - Fonts load correctly — assertion level: Level 1 (visual)
  - Responsive layout at mobile breakpoint — assertion level: Level 1

## Risks & Assumptions
- Next.js App Router SSG will work with filesystem reads at build time
- Tailwind CSS v4 configuration is compatible with design requirements
- React 19 is stable enough for production use

## Deferred / Out of Scope
- Actual data ingestion pipeline (Python scripts)
- GitHub Actions workflow
- LLM API integration
- Real-time data fetching
- User authentication
- Backend server
