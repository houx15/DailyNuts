# TDD Plan: Phase 3 Polish

## Work Items

### WI-1: Scraper Resilience
- **Description**: Improve web scraper reliability with retries, delays, and anti-detection
- **Acceptance criteria**:
  - [ ] Retry failed requests up to 3 times with exponential backoff
  - [ ] Add random delays between requests (1-3s)
  - [ ] Rotate User-Agent headers
  - [ ] Respect robots.txt
  - [ ] Graceful handling of CAPTCHA/cloudflare blocks
  - [ ] Timeout handling for slow responses
- **Required tests**:
  - Retry on connection error — assertion level: Level 1
  - Exponential backoff timing — assertion level: Level 1
  - User-Agent rotation — assertion level: Level 1
  - Skip on robots.txt disallow — assertion level: Level 1

### WI-2: Mobile UI Optimization
- **Description**: Enhance responsive design for mobile devices
- **Acceptance criteria**:
  - [ ] Touch-friendly tap targets (min 44px)
  - [ ] Simplified mobile navigation
  - [ ] Horizontal scroll for date picker on small screens
  - [ ] Optimized font sizes for mobile readability
  - [ ] Collapsible sections on mobile
  - [ ] Bottom sheet for drawer on mobile (instead of side panel)
- **Required tests**:
  - Component renders at 375px width — assertion level: Level 1
  - Touch targets meet minimum size — assertion level: Level 1
  - Drawer uses bottom sheet on mobile — assertion level: Level 1

### WI-3: Daily Brief Quality Tuning
- **Description**: Improve LLM prompt engineering for better briefs
- **Acceptance criteria**:
  - [ ] A/B test prompt variations
  - [ ] Better theme categorization in prompts
  - [ ] Top picks identification in prompt
  - [ ] Consistent tone and structure
  - [ ] Fallback for empty/low-content days
- **Required tests**:
  - Prompt includes all items — assertion level: Level 1
  - Fallback brief generated for empty input — assertion level: Level 1
  - Top picks extracted from LLM response — assertion level: Level 1

### WI-4: Cost Monitoring
- **Description**: Track and report LLM API usage costs
- **Acceptance criteria**:
  - [ ] Log token usage per request
  - [ ] Estimate daily cost
  - [ ] Alert on high usage
  - [ ] Cost summary in brief metadata
  - [ ] Configurable cost limits
- **Required tests**:
  - Token counting accuracy — assertion level: Level 1
  - Cost calculation — assertion level: Level 1
  - Alert triggered over threshold — assertion level: Level 1

### WI-5: Archive Page Enhancement
- **Description**: Improve archive with calendar view and search
- **Acceptance criteria**:
  - [ ] Calendar heatmap showing content density
  - [ ] Search across historical headlines
  - [ ] Monthly grouping
  - [ ] Pagination for large archives
- **Required tests**:
  - Calendar renders with content indicators — assertion level: Level 1
  - Search filters dates — assertion level: Level 1
  - Pagination limits results — assertion level: Level 1

## Deferred / Out of Scope
- Email/Telegram/WeChat delivery
- Full-text search across content
- User bookmarks/read status
- Dynamic interest profiles
