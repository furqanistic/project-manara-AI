# Readability QA Checklist (WCAG AA)

## Scope
- Onboarding modal: `/` (when onboarding is shown)
- Dashboard: `/projects`
- Project creation flow: project creation input + `ProjectSelectionModal`
- Mood board flow: `/moodboard`
- Floor plan flow: `/floorplans`

## Viewports
- Desktop: `1440x900`
- Mobile: `390x844` (or nearest equivalent)

## Theme Coverage
- Light mode: pass required
- Dark mode: pass required

## WCAG Targets
- Normal text contrast ratio: `>= 4.5:1`
- Large text contrast ratio: `>= 3:1`
- No black text on dark background elements
- Primary and secondary buttons must be visually distinguishable from each other and from surrounding surfaces

## Evidence Naming
- Use screenshots with this format:
- `readability-{screen}-{theme}-{viewport}-{state}.png`
- Example: `readability-projects-dark-mobile-empty-state.png`

## Screen Checklist

### 1) Onboarding Modal
- [ ] Step headers/body helper text readable in light mode
- [ ] Step headers/body helper text readable in dark mode
- [ ] Selected and unselected option cards are readable in both themes
- [ ] Back and Continue/Finish buttons are clearly distinguishable in both themes
- [ ] No black text appears on dark surfaces
- Evidence:
- [ ] Desktop light
- [ ] Desktop dark
- [ ] Mobile light
- [ ] Mobile dark

### 2) Projects Dashboard (`/projects`)
- [ ] Header/title/description text readable in light mode
- [ ] Header/title/description text readable in dark mode
- [ ] Project cards and metadata text readable in both themes
- [ ] Create project input text/placeholder/focus state readable
- [ ] Primary action (`Create`) and secondary surfaces/buttons are distinguishable
- [ ] No black text appears on dark surfaces
- Evidence:
- [ ] Desktop light
- [ ] Desktop dark
- [ ] Mobile light
- [ ] Mobile dark

### 3) Project Creation Flow (`ProjectSelectionModal` + inline create)
- [ ] Modal title/description and list rows readable in both themes
- [ ] Create / Back / Go to Projects buttons clearly distinct and readable
- [ ] Input content and placeholder readable in both themes
- [ ] No black text appears on dark surfaces
- Evidence:
- [ ] Desktop light
- [ ] Desktop dark
- [ ] Mobile light
- [ ] Mobile dark

### 4) Mood Board (`/moodboard`)
- [ ] Step headers, helper text, cards, and metadata readable in both themes
- [ ] Result view side panel labels/body text readable in both themes
- [ ] Action buttons (`Refine`, `New Variant`, `Download`) are distinguishable
- [ ] Modal controls (edit/image modal actions) remain readable
- [ ] No black text appears on dark surfaces
- Evidence:
- [ ] Desktop light
- [ ] Desktop dark
- [ ] Mobile light
- [ ] Mobile dark

### 5) Floor Plan (`/floorplans`)
- [ ] Config labels, option cards, and chat/system text readable in both themes
- [ ] Empty state + helper text readable in both themes
- [ ] Mobile floating actions are readable and distinguishable from backdrop
- [ ] History panel text/actions/cards readable in both themes
- [ ] No black text appears on dark surfaces
- Evidence:
- [ ] Desktop light
- [ ] Desktop dark
- [ ] Mobile light
- [ ] Mobile dark

## Button State Verification (All Screen Flows)
- [ ] Primary button default / hover / disabled are readable and distinct
- [ ] Secondary button default / hover / disabled are readable and distinct
- [ ] Focus ring is visible on keyboard navigation in both themes

## Signoff
- QA Owner: `__________________`
- Date: `__________________`
- Result: [ ] PASS  [ ] FAIL
- Notes:
