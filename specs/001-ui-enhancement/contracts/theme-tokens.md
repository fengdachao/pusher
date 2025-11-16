# Theme Tokens Contract

**Feature**: UI Enhancement with Background and Rounded Elements  
**Branch**: `001-ui-enhancement`  
**Date**: November 13, 2025  
**Version**: 1.0.0

## Purpose

This contract defines the formal interface for the theme token system used throughout the frontend application. It serves as the single source of truth for all design decisions and ensures consistency across components.

## Contract Overview

The theme system provides a centralized, type-safe configuration for all visual styling. Components access these tokens via styled-components' ThemeProvider, ensuring consistent application of design decisions.

## Type Definitions

### Main Theme Interface

```typescript
interface Theme {
  colors: ColorPalette;
  borderRadius: BorderRadiusScale;
  shadows: ShadowScale;
  spacing: SpacingScale;
  transitions: TransitionConfig;
  backgrounds: BackgroundConfig;
}
```

## Token Contracts

### 1. Color Palette Contract

**Contract**: `ColorPalette`

**Purpose**: Semantic color tokens organized by usage context

**Interface**:

```typescript
interface ColorPalette {
  background: {
    primary: string;      // Main page background color
    card: string;         // Card/panel background color
    hover: string;        // Hover state background color
  };
  text: {
    primary: string;      // Primary text color
    secondary: string;    // Secondary/helper text color
    muted: string;        // Disabled/muted text color
  };
  brand: {
    primary: string;      // Primary brand color (buttons, links)
    primaryHover: string; // Primary brand hover state
    danger: string;       // Destructive actions (delete, error)
  };
  border: {
    light: string;        // Light dividers
    default: string;      // Standard borders
    focus: string;        // Focus indicators
  };
  gradient: {
    start: string;        // Gradient start color
    end: string;          // Gradient end color
  };
}
```

**Concrete Values** (v1.0.0):

```typescript
export const colors: ColorPalette = {
  background: {
    primary: '#f8f9fa',
    card: '#ffffff',
    hover: '#f8f9ff',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
    muted: '#999999',
  },
  brand: {
    primary: '#007bff',
    primaryHover: '#0056b3',
    danger: '#dc3545',
  },
  border: {
    light: '#e9ecef',
    default: '#dddddd',
    focus: '#005fcc',
  },
  gradient: {
    start: '#f5f7fa',
    end: '#e9ecef',
  },
} as const;
```

**Validation Rules**:
- All values MUST be valid CSS color values (hex, rgb, rgba)
- Text colors on card background MUST meet WCAG AA contrast (4.5:1)
- Brand colors with white text MUST meet WCAG AA contrast (4.5:1)
- Focus color MUST have 3:1 contrast with all background colors

**Versioning**: Breaking changes require major version bump

---

### 2. Border Radius Scale Contract

**Contract**: `BorderRadiusScale`

**Purpose**: Standardized rounding values for consistent component styling

**Interface**:

```typescript
interface BorderRadiusScale {
  sm: string;  // Small elements
  md: string;  // Medium elements
  lg: string;  // Large elements
  xl: string;  // Extra large elements
}
```

**Concrete Values** (v1.0.0):

```typescript
export const borderRadius: BorderRadiusScale = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
} as const;
```

**Usage Guidelines**:

| Token | Usage | Component Examples |
|-------|-------|-------------------|
| `sm` | Small UI elements | Tag, Badge, Chip |
| `md` | Standard interactive elements | Button, Input, Select |
| `lg` | Content containers | Card, Panel, Section |
| `xl` | Elevated surfaces | Modal, Dialog, Popover |

**Validation Rules**:
- All values MUST be valid CSS length units (px, rem, em)
- Values MUST maintain relative size order (sm < md < lg < xl)
- Values SHOULD be multiples of 4 for grid consistency

**Versioning**: Minor version bump for new tokens, major for removals

---

### 3. Shadow Scale Contract

**Contract**: `ShadowScale`

**Purpose**: Elevation system via box shadows

**Interface**:

```typescript
interface ShadowScale {
  sm: string;    // Minimal elevation
  md: string;    // Standard elevation
  lg: string;    // High elevation
  focus: string; // Focus indicator ring
}
```

**Concrete Values** (v1.0.0):

```typescript
export const shadows: ShadowScale = {
  sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
  md: '0 2px 8px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 16px rgba(0, 0, 0, 0.15)',
  focus: '0 0 0 3px rgba(0, 95, 204, 0.3)',
} as const;
```

**Usage Guidelines**:

| Token | Z-Axis | Use Case |
|-------|--------|----------|
| `sm` | 1-2px | Subtle lift on interactive elements |
| `md` | 2-8px | Default cards and panels |
| `lg` | 4-16px | Hover states, modals, overlays |
| `focus` | 0px | Focus ring (outline replacement) |

**Combination Pattern**:

```typescript
// Focus state adds to existing shadow
box-shadow: ${shadows.md}, ${shadows.focus};
```

**Validation Rules**:
- All values MUST be valid CSS box-shadow syntax
- Shadow blur radius should not exceed 20px (performance)
- Shadow opacity should not exceed 0.2 (visual clarity)
- Focus shadow MUST be visible on all background colors

**Versioning**: Minor version bump for new shadows

---

### 4. Spacing Scale Contract

**Contract**: `SpacingScale`

**Purpose**: Standardized spacing for padding, margins, and gaps

**Interface**:

```typescript
interface SpacingScale {
  xs: string;  // Extra small spacing
  sm: string;  // Small spacing
  md: string;  // Medium spacing
  lg: string;  // Large spacing
  xl: string;  // Extra large spacing
}
```

**Concrete Values** (v1.0.0):

```typescript
export const spacing: SpacingScale = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '20px',
  xl: '32px',
} as const;
```

**Usage Guidelines**:

| Token | Usage |
|-------|-------|
| `xs` | Icon gaps, tight inline spacing |
| `sm` | Button padding, list gaps |
| `md` | Input padding, card internal spacing |
| `lg` | Section padding, container margins |
| `xl` | Page margins, major section breaks |

**Validation Rules**:
- All values MUST be valid CSS length units
- Values SHOULD be multiples of 4 (4px grid system)
- Values MUST maintain relative size order

**Responsive Adjustments**:
```typescript
// Mobile: reduce by 25%
@media (max-width: 768px) {
  padding: calc(${spacing.lg} * 0.75);
}
```

**Versioning**: Minor version bump for new tokens

---

### 5. Transition Configuration Contract

**Contract**: `TransitionConfig`

**Purpose**: Animation timing for consistent motion

**Interface**:

```typescript
interface TransitionConfig {
  fast: string;   // Quick interactions
  medium: string; // Standard transitions
  slow: string;   // Page transitions
}
```

**Concrete Values** (v1.0.0):

```typescript
export const transitions: TransitionConfig = {
  fast: 'all 0.15s ease-in-out',
  medium: 'all 0.2s ease-in-out',
  slow: 'all 0.3s ease-in-out',
} as const;
```

**Usage Guidelines**:

| Token | Duration | Use Case |
|-------|----------|----------|
| `fast` | 150ms | Button press, micro-interactions |
| `medium` | 200ms | Hover states, focus changes |
| `slow` | 300ms | Modal open/close, page transitions |

**Best Practices**:
- Use `medium` as default for most interactions
- Use `fast` for frequent interactions (button clicks)
- Use `slow` for larger UI changes (modals, drawers)
- Never exceed 500ms (feels sluggish)

**Validation Rules**:
- All values MUST be valid CSS transition syntax
- Duration should not exceed 0.5s
- SHOULD use ease-in-out for smooth feel

**Versioning**: Minor version bump for new tokens

---

### 6. Background Configuration Contract

**Contract**: `BackgroundConfig`

**Purpose**: Page background styling including gradients and images

**Interface**:

```typescript
interface BackgroundConfig {
  gradient: string;
  image: BackgroundImageConfig;
}

interface BackgroundImageConfig {
  url: string;
  fallback: string;
  opacity: number;
  blendMode: CSSBlendMode;
  attachment: BackgroundAttachment;
}

interface BackgroundAttachment {
  desktop: 'fixed' | 'scroll';
  mobile: 'fixed' | 'scroll';
}

type CSSBlendMode = 
  | 'normal' 
  | 'multiply' 
  | 'screen' 
  | 'overlay' 
  | 'darken' 
  | 'lighten';
```

**Concrete Values** (v1.0.0):

```typescript
export const backgrounds: BackgroundConfig = {
  gradient: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
  image: {
    url: '/assets/images/background.webp',
    fallback: '/assets/images/background.jpg',
    opacity: 0.25,
    blendMode: 'overlay',
    attachment: {
      desktop: 'fixed',
      mobile: 'scroll',
    },
  },
} as const;
```

**Usage Pattern**:

```typescript
background: 
  ${backgrounds.gradient},
  url(${backgrounds.image.url});
background-size: cover;
background-attachment: ${backgrounds.image.attachment.desktop};
background-blend-mode: ${backgrounds.image.blendMode};

@media (max-width: 768px) {
  background-attachment: ${backgrounds.image.attachment.mobile};
}
```

**Validation Rules**:
- Gradient MUST be valid CSS gradient syntax
- Image URL MUST exist and be accessible
- WebP image MUST be < 150KB
- JPEG fallback MUST be < 200KB
- Opacity MUST be between 0 and 1
- Blend mode MUST be valid CSS blend mode

**Performance Requirements**:
- Images MUST be optimized (WebP preferred)
- Fixed attachment MUST be disabled on mobile (performance)
- Images MUST NOT block initial page render

**Versioning**: Minor version bump for configuration changes

---

## Theme Provider Contract

### Implementation

```typescript
import { ThemeProvider } from 'styled-components';
import { theme } from './theme/tokens';

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* Your app */}
    </ThemeProvider>
  );
}
```

### Component Access

```typescript
import styled from 'styled-components';

const Button = styled.button`
  /* Access theme via props.theme */
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.brand.primary};
  transition: ${props => props.theme.transitions.medium};
  
  &:hover {
    background: ${props => props.theme.colors.brand.primaryHover};
  }
  
  &:focus {
    outline: 3px solid ${props => props.theme.colors.border.focus};
    box-shadow: ${props => props.theme.shadows.focus};
  }
`;
```

## TypeScript Support

### Theme Type Augmentation

```typescript
// styled.d.ts
import 'styled-components';
import { Theme } from './theme/tokens';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
```

This enables:
- Autocomplete for theme properties
- Type checking for theme values
- Compile-time validation

## Testing Contract

### Unit Tests

```typescript
import { colors, borderRadius, shadows, spacing, transitions } from './theme/tokens';

describe('Theme Tokens', () => {
  describe('Colors', () => {
    test('all colors are valid hex values', () => {
      const allColors = Object.values(colors).flatMap(Object.values);
      allColors.forEach(color => {
        expect(color).toMatch(/^#[0-9a-f]{3,8}$/i);
      });
    });
    
    test('text on card background meets WCAG AA', () => {
      const ratio = getContrastRatio(colors.text.primary, colors.background.card);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
  
  describe('Border Radius', () => {
    test('all values are valid pixel values', () => {
      Object.values(borderRadius).forEach(value => {
        expect(value).toMatch(/^\d+px$/);
      });
    });
    
    test('maintains size order', () => {
      const values = Object.values(borderRadius).map(v => parseInt(v));
      expect(values).toEqual([...values].sort((a, b) => a - b));
    });
  });
  
  describe('Spacing', () => {
    test('all values are multiples of 4', () => {
      Object.values(spacing).forEach(value => {
        const pixels = parseInt(value);
        expect(pixels % 4).toBe(0);
      });
    });
  });
});
```

### Visual Regression Tests

```typescript
import { test, expect } from '@playwright/test';

test('buttons have correct border radius', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('button').first();
  
  const borderRadius = await button.evaluate(el => 
    window.getComputedStyle(el).borderRadius
  );
  
  expect(borderRadius).toBe('8px');
});

test('cards have correct shadow', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('[data-testid="article-card"]').first();
  
  const boxShadow = await card.evaluate(el => 
    window.getComputedStyle(el).boxShadow
  );
  
  expect(boxShadow).toContain('0px 2px 8px');
});
```

## Migration Contract

### Phase 1: Non-Breaking Addition

Theme tokens are available but not required. Existing hardcoded values continue to work.

```typescript
// Old (still works)
const Button = styled.button`
  border-radius: 8px;
  padding: 12px;
`;

// New (preferred)
const Button = styled.button`
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
`;
```

### Phase 2: Gradual Migration

Components are migrated one at a time. Mixed usage is acceptable during transition.

### Phase 3: Enforcement

Linting rules warn about hardcoded values:

```javascript
// .eslintrc.js
rules: {
  'no-magic-numbers': ['warn', {
    ignore: [0, 1, -1],
    ignoreArrayIndexes: true,
  }],
}
```

## Versioning Policy

**Version Format**: MAJOR.MINOR.PATCH

**MAJOR** (breaking changes):
- Removing theme tokens
- Changing token names
- Changing token structure

**MINOR** (backwards compatible):
- Adding new tokens
- Changing token values (if maintains constraints)
- Adding new theme sections

**PATCH** (bug fixes):
- Fixing incorrect values
- Correcting typos
- Documentation updates

**Current Version**: 1.0.0

## Deprecation Policy

1. **Announce**: Deprecation notice in changelog
2. **Warning Period**: Minimum 2 weeks with console warnings
3. **Migration Guide**: Provide before/after examples
4. **Remove**: Only in next major version

Example deprecation:

```typescript
export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  
  // @deprecated Use 'md' instead. Will be removed in v2.0.0
  medium: '8px',
} as const;
```

## Compatibility

**Minimum Requirements**:
- styled-components: 5.0.0+
- TypeScript: 4.0.0+ (for type safety)
- React: 16.8.0+ (hooks support)

**Browser Support**:
- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile Safari: iOS 14+

## Contract Guarantees

This contract guarantees:

1. ✅ **Type Safety**: All tokens are strongly typed
2. ✅ **Validation**: Values are validated at build time
3. ✅ **Accessibility**: Colors meet WCAG AA standards
4. ✅ **Performance**: No runtime overhead
5. ✅ **Backwards Compatibility**: Changes follow semver
6. ✅ **Documentation**: All tokens documented with examples
7. ✅ **Testing**: Comprehensive test coverage

## Contract Violations

The following are considered contract violations:

❌ Adding colors that don't meet contrast requirements  
❌ Removing tokens without major version bump  
❌ Changing token structure without migration path  
❌ Adding tokens without tests  
❌ Breaking TypeScript types

## Changelog

### v1.0.0 (2025-11-13)
- Initial theme token system
- Complete color palette
- Border radius scale (4 values)
- Shadow scale (4 values)
- Spacing scale (5 values)
- Transition configuration (3 values)
- Background configuration with gradient and image support

## References

- [Styled Components Theming](https://styled-components.com/docs/advanced#theming)
- [WCAG 2.1 Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Design Tokens W3C Standard](https://www.w3.org/community/design-tokens/)
- [Material Design Shape System](https://m3.material.io/styles/shape/overview)

---

**Contract Status**: ✅ FINAL  
**Last Updated**: November 13, 2025  
**Next Review**: N/A (will review if breaking changes needed)

