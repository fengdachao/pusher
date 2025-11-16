# Data Model: UI Enhancement

**Feature**: UI Enhancement with Background and Rounded Elements  
**Branch**: `001-ui-enhancement`  
**Date**: November 13, 2025

## Overview

This document defines the structural entities and relationships for the UI enhancement feature. Since this is a purely presentational feature with no backend data persistence, the "data model" consists of styling entities, theme structures, and component contracts that define the visual system.

## Styling Entities

### 1. Theme Configuration

The central theme object that defines all design tokens and styling constants.

**Entity**: `ThemeConfig`

**Purpose**: Centralized configuration for all styling tokens used throughout the application.

**Structure**:

```typescript
interface ThemeConfig {
  colors: ColorPalette;
  borderRadius: BorderRadiusScale;
  shadows: ShadowScale;
  spacing: SpacingScale;
  transitions: TransitionConfig;
  backgrounds: BackgroundConfig;
  typography: TypographyConfig;
}
```

**Attributes**:

| Attribute | Type | Description | Constraints |
|-----------|------|-------------|-------------|
| colors | ColorPalette | Complete color palette for the application | Required, must meet WCAG AA contrast ratios |
| borderRadius | BorderRadiusScale | Scale of border radius values | Required, 4 values (sm, md, lg, xl) |
| shadows | ShadowScale | Scale of box-shadow values | Required, 4 values (sm, md, lg, focus) |
| spacing | SpacingScale | Scale of spacing values | Required, 5 values (xs, sm, md, lg, xl) |
| transitions | TransitionConfig | Animation timing configurations | Required |
| backgrounds | BackgroundConfig | Background styling configuration | Required |
| typography | TypographyConfig | Font and text styling | Optional (future extension) |

**Validation Rules**:
- All color values must be valid hex or rgba CSS colors
- Border radius values must be valid CSS length units (px, rem)
- Shadow values must be valid CSS box-shadow syntax
- Transition values must be valid CSS transition syntax

**Relationships**:
- Used by: All styled components
- Provided by: ThemeProvider at App level
- Accessed via: styled-components theme prop

---

### 2. Color Palette

**Entity**: `ColorPalette`

**Purpose**: Defines all color tokens organized by semantic purpose.

**Structure**:

```typescript
interface ColorPalette {
  background: BackgroundColors;
  text: TextColors;
  brand: BrandColors;
  border: BorderColors;
  gradient: GradientColors;
}

interface BackgroundColors {
  primary: string;      // Main page background (#f8f9fa)
  card: string;         // Card background (#ffffff)
  hover: string;        // Hover state background (#f8f9ff)
}

interface TextColors {
  primary: string;      // Main text color (#333333)
  secondary: string;    // Secondary text color (#666666)
  muted: string;        // Muted/disabled text (#999999)
}

interface BrandColors {
  primary: string;      // Primary brand color (#007bff)
  primaryHover: string; // Primary hover state (#0056b3)
  danger: string;       // Error/delete color (#dc3545)
}

interface BorderColors {
  light: string;        // Light borders (#e9ecef)
  default: string;      // Default borders (#dddddd)
  focus: string;        // Focus indicator (#005fcc)
}

interface GradientColors {
  start: string;        // Gradient start color (#f5f7fa)
  end: string;          // Gradient end color (#e9ecef)
}
```

**Validation Rules**:
- All combinations of text on background must meet WCAG AA (4.5:1 ratio)
- Brand colors must have sufficient contrast with white text (3:1 minimum)
- Focus colors must have 3:1 contrast with adjacent colors

**Usage Context**:
- Text colors used for all typography
- Background colors for surfaces and containers
- Brand colors for interactive elements (buttons, links)
- Border colors for dividers and element boundaries
- Gradient colors for background gradient construction

---

### 3. Border Radius Scale

**Entity**: `BorderRadiusScale`

**Purpose**: Standardized border radius values for consistent rounding across components.

**Structure**:

```typescript
interface BorderRadiusScale {
  sm: string;  // Small elements (4px)
  md: string;  // Medium elements (8px)
  lg: string;  // Large elements (12px)
  xl: string;  // Extra large elements (16px)
}
```

**Value Specification**:

| Scale | Value | Usage | Examples |
|-------|-------|-------|----------|
| sm | 4px | Small UI elements | Tags, badges, chips |
| md | 8px | Standard interactive elements | Buttons, inputs, small cards |
| lg | 12px | Content containers | Article cards, subscription cards, panels |
| xl | 16px | Elevated surfaces | Modals, dialogs, overlays |

**Relationships**:
- Applied to: All components with borders or backgrounds
- Consistency rule: Components of same semantic type use same radius
- Special case: Focus outlines inherit component's border radius

---

### 4. Shadow Scale

**Entity**: `ShadowScale`

**Purpose**: Elevation system using box shadows to create visual hierarchy.

**Structure**:

```typescript
interface ShadowScale {
  sm: string;    // Minimal elevation
  md: string;    // Standard elevation
  lg: string;    // High elevation
  focus: string; // Focus indicator shadow
}
```

**Value Specification**:

| Scale | Value | Usage | Z-index Equivalent |
|-------|-------|-------|--------------------|
| sm | `0 1px 3px rgba(0,0,0,0.1)` | Slight lift | z-index: 1 |
| md | `0 2px 8px rgba(0,0,0,0.1)` | Default cards | z-index: 10 |
| lg | `0 4px 16px rgba(0,0,0,0.15)` | Hover states, modals | z-index: 100 |
| focus | `0 0 0 3px rgba(0,95,204,0.3)` | Focus ring | Outline layer |

**Validation Rules**:
- Shadow opacity should not exceed 0.2 to avoid harsh edges
- Focus shadow must be visible on all background colors
- Multiple shadows can be combined (e.g., `md` + `focus`)

**Usage Pattern**:
```typescript
const Card = styled.div`
  box-shadow: ${props => props.theme.shadows.md};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.lg};
  }
  
  &:focus {
    box-shadow: ${props => props.theme.shadows.md}, 
                ${props => props.theme.shadows.focus};
  }
`;
```

---

### 5. Spacing Scale

**Entity**: `SpacingScale`

**Purpose**: Standardized spacing values for padding, margins, and gaps.

**Structure**:

```typescript
interface SpacingScale {
  xs: string;  // 4px
  sm: string;  // 8px
  md: string;  // 12px
  lg: string;  // 20px
  xl: string;  // 32px
}
```

**Value Specification**:

| Scale | Value | Usage | Examples |
|-------|-------|-------|----------|
| xs | 4px | Minimal spacing | Icon gaps, tight padding |
| sm | 8px | Small spacing | Button padding, list item gaps |
| md | 12px | Standard spacing | Input padding, card gaps |
| lg | 20px | Large spacing | Section padding, container margins |
| xl | 32px | Extra large spacing | Page padding, major section breaks |

**Relationships**:
- Based on 4px grid system
- Each value is multiple of 4 for consistency
- Can be combined: `padding: ${spacing.md} ${spacing.lg}`

---

### 6. Background Configuration

**Entity**: `BackgroundConfig`

**Purpose**: Defines background styling including gradients and optional images.

**Structure**:

```typescript
interface BackgroundConfig {
  gradient: string;
  image: BackgroundImageConfig;
}

interface BackgroundImageConfig {
  url: string;           // WebP image path
  fallback: string;      // JPEG fallback path
  opacity: number;       // 0-1, default 0.25
  blendMode: string;     // CSS blend mode, default 'overlay'
  attachment: BackgroundAttachment;
}

interface BackgroundAttachment {
  desktop: 'fixed' | 'scroll';  // Default 'fixed'
  mobile: 'fixed' | 'scroll';   // Default 'scroll' (performance)
}
```

**Attributes**:

| Attribute | Type | Description | Default | Constraints |
|-----------|------|-------------|---------|-------------|
| gradient | string | CSS gradient definition | `linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)` | Valid CSS gradient |
| image.url | string | Path to WebP background | `/assets/images/background.webp` | Must be < 150KB |
| image.fallback | string | Path to JPEG fallback | `/assets/images/background.jpg` | Must be < 200KB |
| image.opacity | number | Image layer opacity | 0.25 | 0-1 range |
| image.blendMode | string | CSS blend mode | `overlay` | Valid CSS blend mode |
| image.attachment.desktop | string | Desktop scroll behavior | `fixed` | `fixed` or `scroll` |
| image.attachment.mobile | string | Mobile scroll behavior | `scroll` | `fixed` or `scroll` |

**Validation Rules**:
- Image URLs must be valid paths
- Opacity must be between 0 and 1
- Images must be optimized and compressed
- Gradient must be valid CSS gradient syntax

**Usage Pattern**:
```typescript
const PageBackground = styled.div`
  background: 
    ${props => props.theme.backgrounds.gradient},
    url(${props => props.theme.backgrounds.image.url});
  background-size: cover;
  background-attachment: ${props => 
    isMobile ? 'scroll' : props.theme.backgrounds.image.attachment.desktop
  };
  background-blend-mode: ${props => props.theme.backgrounds.image.blendMode};
  
  /* Fallback for browsers without WebP support */
  @supports not (background-image: url('image.webp')) {
    background-image: url(${props => props.theme.backgrounds.image.fallback});
  }
`;
```

---

### 7. Transition Configuration

**Entity**: `TransitionConfig`

**Purpose**: Standardized transition timings for consistent animations.

**Structure**:

```typescript
interface TransitionConfig {
  fast: string;    // 0.15s ease-in-out
  medium: string;  // 0.2s ease-in-out
  slow: string;    // 0.3s ease-in-out
}
```

**Value Specification**:

| Speed | Duration | Easing | Usage |
|-------|----------|--------|-------|
| fast | 0.15s | ease-in-out | Micro-interactions (button press) |
| medium | 0.2s | ease-in-out | Standard transitions (hover, focus) |
| slow | 0.3s | ease-in-out | Page transitions, modals |

**Validation Rules**:
- All transitions should use ease-in-out for smooth feel
- Duration should not exceed 0.5s (feels sluggish)
- Critical interactions should prefer fast/medium

**Usage Pattern**:
```typescript
const Button = styled.button`
  transition: ${props => props.theme.transitions.medium};
  
  &:hover {
    /* Uses medium transition for smooth hover */
  }
`;
```

---

## Component Styling Contracts

### Component Classification

All components are classified into categories that determine their styling:

| Category | Border Radius | Shadow | Padding | Examples |
|----------|---------------|--------|---------|----------|
| **Form Inputs** | md (8px) | none (border only) | md (12px) | Input, Select, Textarea |
| **Buttons** | md (8px) | sm (default), md (hover) | sm-md (8-12px) | Button, IconButton |
| **Cards** | lg (12px) | md (default), lg (hover) | lg (20px) | ArticleCard, SubscriptionCard |
| **Panels** | lg (12px) | md | lg (20px) | SettingsPanel, SectionContainer |
| **Modals** | xl (16px) | lg | xl (32px) | Modal, Dialog, Overlay |
| **Tags** | sm (4px) | none | xs (4px) | Tag, Badge, Chip |
| **Navigation** | md (8px) | none | md (12px) | NavItem, MenuItem |

### Styling Inheritance Rules

1. **Child components inherit parent's border radius context**
   - Exception: Explicit overrides for visual hierarchy

2. **Focus states add to base shadow**
   - Pattern: `box-shadow: ${base}, ${focus}`

3. **Hover states increase shadow elevation**
   - Pattern: Current shadow → Next shadow level

4. **Mobile adjustments**
   - Reduce padding by 25% on screens < 768px
   - Increase touch targets to minimum 44x44px

---

## State-Based Styling

### Interactive State Matrix

| Component Type | Default | Hover | Active | Focus | Disabled |
|----------------|---------|-------|--------|-------|----------|
| **Button** | bg: brand.primary, shadow: sm | bg: brand.primaryHover, shadow: md | scale: 0.98 | outline + shadow: focus | opacity: 0.6, cursor: not-allowed |
| **Input** | border: border.default | border: brand.primary | - | border: focus, shadow: focus | bg: background.primary, opacity: 0.6 |
| **Card** | shadow: md | shadow: lg, transform: translateY(-2px) | - | outline + shadow: focus | - |
| **Nav Item** | bg: transparent | bg: background.hover | bg: background.hover | outline + bg: background.hover | - |

### Responsive Breakpoints

| Breakpoint | Width | Adjustments |
|------------|-------|-------------|
| **Mobile** | < 768px | Reduce padding 25%, disable fixed backgrounds |
| **Tablet** | 768px - 1024px | Standard padding, standard backgrounds |
| **Desktop** | > 1024px | Standard padding, fixed backgrounds enabled |

---

## File Organization

### Theme Files Structure

```
frontend/src/theme/
├── index.ts              # Barrel export for all theme files
├── tokens.ts             # Color, spacing, shadow, border radius scales
├── backgrounds.ts        # Background configurations
├── globalStyles.ts       # GlobalStyle component
└── types.ts              # TypeScript type definitions
```

### Component Integration Pattern

```typescript
// Component file
import styled from 'styled-components';

const StyledComponent = styled.div`
  /* Access theme via props.theme */
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background.card};
  box-shadow: ${props => props.theme.shadows.md};
  transition: ${props => props.theme.transitions.medium};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;
```

---

## Migration Strategy

### Phase 1: Add Theme System (No Breaking Changes)

1. Create theme files with all tokens
2. Add ThemeProvider to App.tsx
3. Theme available but not required
4. Existing components continue working

### Phase 2: Migrate Components Gradually

1. Start with least critical components
2. Replace hardcoded values with theme tokens
3. Test each component after migration
4. Continue until all components migrated

### Phase 3: Deprecate Hardcoded Values

1. Add linting rules to warn on hardcoded colors/spacing
2. Code review checklist includes theme usage
3. Eventually remove fallbacks

---

## Validation & Testing

### Theme Contract Tests

```typescript
describe('ThemeConfig', () => {
  test('all border radius values are valid CSS', () => {
    Object.values(theme.borderRadius).forEach(value => {
      expect(value).toMatch(/^\d+px$/);
    });
  });
  
  test('all colors meet WCAG AA contrast ratios', () => {
    const ratio = getContrastRatio(
      theme.colors.text.primary,
      theme.colors.background.card
    );
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
  
  test('background images exist and are optimized', () => {
    expect(fs.existsSync(theme.backgrounds.image.url)).toBe(true);
    const fileSize = fs.statSync(theme.backgrounds.image.url).size;
    expect(fileSize).toBeLessThan(150 * 1024); // 150KB
  });
});
```

### Visual Regression Tests

- Screenshot testing with Playwright
- Compare before/after for each component
- Test at multiple viewport sizes
- Test in different browser engines

---

## Performance Considerations

### CSS Bundle Size

**Current Estimate**: +15KB gzipped
- Theme tokens: ~2KB
- GlobalStyle enhancements: ~3KB
- Component style updates: ~10KB

**Budget**: 50KB maximum increase

### Runtime Performance

**No Runtime Cost**:
- All values compile to static CSS
- No JavaScript theme switching (yet)
- No CSS-in-JS performance overhead
- Styled-components already handles optimization

### Image Loading

**Background Image Performance**:
- WebP: ~120KB (estimated)
- JPEG fallback: ~180KB (estimated)
- Lazy loaded via CSS
- Does not block initial render

---

## Accessibility Mapping

### WCAG 2.1 Requirements to Theme Entities

| Requirement | Theme Entity | Validation |
|-------------|--------------|------------|
| Color contrast 4.5:1 | ColorPalette | Automated testing with contrast checker |
| Focus indicators | ShadowScale.focus, BorderColors.focus | Manual keyboard navigation testing |
| Text spacing | SpacingScale | Zoom to 200% testing |
| Touch targets 44x44px | SpacingScale (mobile) | Mobile device testing |
| Color-blind safe | ColorPalette | Simulation testing (Chromatic) |

---

## Future Extensions

### Potential Additions (Out of Current Scope)

1. **Dark Mode**
   - Add `darkColors` to ColorPalette
   - Theme switching logic
   - User preference persistence

2. **Custom Themes**
   - User-selectable color schemes
   - Theme builder interface
   - Theme persistence in user settings

3. **Animation Configurations**
   - Keyframe definitions
   - Animation duration scales
   - Reduced motion support

4. **Typography Scale**
   - Font size scale
   - Line height scale
   - Font weight definitions

---

## Summary

This data model defines a comprehensive, type-safe styling system that:

1. **Centralizes** all design decisions in theme tokens
2. **Enforces** consistency through component contracts
3. **Enables** easy maintenance and updates
4. **Supports** accessibility requirements
5. **Maintains** performance budgets
6. **Provides** clear migration path

All entities are designed to integrate seamlessly with the existing styled-components architecture while enabling future enhancements without breaking changes.

