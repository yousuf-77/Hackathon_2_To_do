# specs/ui/theme.md

## Frontend Theme Specification – Cyberpunk/Neon Dark Theme

**Status:** Draft | **Priority:** Critical | **Dependencies:** @constitution.md Section 4.1

---

## Overview

Define the visual design system for the Hackathon II Phase II Todo web application. The theme implements a cyberpunk/neon aesthetic with dark mode as default, glassmorphism effects, and vibrant accent colors to create a futuristic, impressive UI for judges.

**Design Philosophy:**
- Dark-first: Cyberpunk theme is the default experience
- High contrast: Neon glows against deep black backgrounds
- Glassmorphism: Translucent cards with backdrop blur
- Futuristic: Gradients, glow effects, smooth animations
- Professional: Polished, not overwhelming or tacky

**Skills to Use:**
- `shadcn-ui-cyberpunk-theme-generator` – Generate theme CSS variables and Tailwind config

---

## 1. Color Palette

### 1.1 Base Colors (Dark Mode Default)

```css
/* Semantic CSS Variables (defined in app/globals.css) */
:root {
  /* Background & Surface */
  --background: 0 0% 4%;           /* #0a0a0a - Deep black */
  --foreground: 92 8% 93%;         /* #ededed - Off-white text */

  /* Card / Glassmorphism */
  --card: 0 0% 4%;
  --card-foreground: 92 8% 93%;
  --popover: 0 0% 4%;
  --popover-foreground: 92 8% 93%;

  /* Primary Actions */
  --primary: 189 100% 50%;          /* #00d4ff - Neon cyan */
  --primary-foreground: 0 0% 4%;

  /* Secondary */
  --secondary: 300 100% 50%;        /* #ff00ff - Neon pink */
  --secondary-foreground: 0 0% 4%;

  /* Muted / Disabled */
  --muted: 217 33% 17%;
  --muted-foreground: 215 20% 65%;

  /* Accent */
  --accent: 300 100% 50%;
  --accent-foreground: 0 0% 4%;

  /* UI Elements */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 98%;
  --border: 217 33% 17%;
  --input: 217 33% 17%;
  --ring: 189 100% 50%;

  /* Custom Neon Colors */
  --neon-blue: 189 100% 50%;        /* #00d4ff */
  --neon-pink: 300 100% 50%;        /* #ff00ff */
  --neon-green: 144 100% 50%;       /* #00ff88 */
  --neon-yellow: 48 100% 50%;       /* #ffcc00 */
  --neon-purple: 270 100% 60%;      /* #9d4edd */

  /* Glassmorphism */
  --glass-bg: rgba(10, 10, 10, 0.6);
  --glass-border: rgba(255, 255, 255, 0.1);
}
```

### 1.2 Light Mode (Optional)

```css
.light {
  --background: 0 0% 98%;
  --foreground: 222 47% 11%;
  --primary: 189 100% 40%;
  --primary-foreground: 0 0% 98%;
  /* ... other light mode overrides */
}
```

### 1.3 Priority Colors

```css
/* Task Priority System */
--priority-low: 189 100% 50%;       /* Blue - Neon Cyan */
--priority-medium: 48 100% 50%;    /* Yellow - Neon Yellow */
--priority-high: 300 100% 50%;     /* Pink - Neon Pink */

/* Status Colors */
--status-todo: 189 100% 50%;       /* Blue */
--status-in-progress: 48 100% 50%; /* Yellow */
--status-completed: 144 100% 50%;  /* Green */
```

---

## 2. Typography

### 2.1 Font Family

```css
/* app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### 2.2 Type Scale

```css
/* Tailwind Typography Extensions */
font-size:
  - xs: 0.75rem    /* 12px - captions, labels */
  - sm: 0.875rem   /* 14px - body text */
  - base: 1rem     /* 16px - default */
  - lg: 1.125rem   /* 18px - emphasis */
  - xl: 1.25rem    /* 20px - small headings */
  - 2xl: 1.5rem    /* 24px - section headings */
  - 3xl: 2rem      /* 32px - page titles */
  - 4xl: 2.5rem    /* 40px - hero titles */
```

---

## 3. Visual Effects

### 3.1 Neon Glow Effects

```css
/* Utility Classes (tailwind.config.js) */
.neon-glow-blue {
  box-shadow:
    0 0 10px rgba(0, 212, 255, 0.5),
    0 0 20px rgba(0, 212, 255, 0.3),
    0 0 40px rgba(0, 212, 255, 0.1);
}

.neon-glow-pink {
  box-shadow:
    0 0 10px rgba(255, 0, 255, 0.5),
    0 0 20px rgba(255, 0, 255, 0.3),
    0 0 40px rgba(255, 0, 255, 0.1);
}

.neon-glow-green {
  box-shadow:
    0 0 10px rgba(0, 255, 136, 0.5),
    0 0 20px rgba(0, 255, 136, 0.3);
}

.neon-text {
  text-shadow:
    0 0 10px currentColor,
    0 0 20px currentColor;
}
```

### 3.2 Glassmorphism

```css
/* Glass Card Effect */
.glass-card {
  background: rgba(10, 10, 10, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

/* Glass Dialog/Modal */
.glass-dialog {
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
```

### 3.3 Gradients

```css
/* Button Gradients */
.gradient-primary {
  background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
}

-gradient-secondary {
  background: linear-gradient(135deg, #ff00ff 0%, #ff00aa 100%);
}

.gradient-hero {
  background: linear-gradient(180deg, rgba(0, 212, 255, 0.1) 0%, transparent 100%);
}
```

---

## 4. Component Styling

### 4.1 Button Variants

```typescript
// components/ui/button.tsx (Shadcn/UI extension)
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground neon-glow-blue hover:scale-105",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground neon-glow-pink hover:scale-105",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline neon-text",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### 4.2 Card Styling

```typescript
// components/ui/card.tsx
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "glass-card rounded-lg border text-card-foreground shadow-lg",
        className
      )}
      {...props}
    />
  )
);
```

### 4.3 Input Styling

```typescript
// components/ui/input.tsx
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
```

---

## 5. Tailwind Configuration

### 5.1 tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // ... other Shadcn colors
        neon: {
          blue: "hsl(var(--neon-blue))",
          pink: "hsl(var(--neon-pink))",
          green: "hsl(var(--neon-green))",
          yellow: "hsl(var(--neon-yellow))",
          purple: "hsl(var(--neon-purple))",
        },
        priority: {
          low: "hsl(var(--priority-low))",
          medium: "hsl(var(--priority-medium))",
          high: "hsl(var(--priority-high))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 212, 255, 0.5)",
        "neon-pink": "0 0 20px rgba(255, 0, 255, 0.5)",
        "neon-green": "0 0 20px rgba(0, 255, 136, 0.5)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

---

## 6. Global Styles

### 6.1 app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* [Insert all CSS variables from section 1.1] */
  }

  .light {
    /* [Insert light mode overrides from section 1.2] */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer components {
  /* Neon Glow Utilities */
  .neon-glow {
    box-shadow:
      0 0 10px rgba(0, 212, 255, 0.5),
      0 0 20px rgba(0, 212, 255, 0.3),
      0 0 40px rgba(0, 212, 255, 0.1);
  }

  .neon-glow-pink {
    box-shadow:
      0 0 10px rgba(255, 0, 255, 0.5),
      0 0 20px rgba(255, 0, 255, 0.3);
  }

  /* Glassmorphism */
  .glass {
    @apply bg-white/5 backdrop-blur-lg border border-white/10;
  }

  .glass-card {
    @apply glass rounded-lg;
  }

  /* Text Effects */
  .neon-text {
    text-shadow:
      0 0 10px currentColor,
      0 0 20px currentColor;
  }

  /* Gradient Text */
  .gradient-text {
    @apply bg-gradient-to-r from-neon-blue to-neon-pink bg-clip-text text-transparent;
  }
}
```

---

## 7. Theme Switcher Component

### 7.1 Specification

**File:** `components/theme/theme-switcher.tsx`

**Purpose:** Toggle between dark (default) and light modes

**Behavior:**
- Uses `next-themes` ThemeProvider
- Shows sun/moon icon with smooth transition
- Persists preference in localStorage
- Respects system preference on first visit

**UI:**
- Button with icon (Sun/Moon)
- Small hover glow effect
- Positioned in navbar top-right

**Acceptance Criteria:**
- [ ] Dark mode is default on first visit
- [ ] Toggle switches between dark/light instantly
- [ ] Preference persists across sessions
- [ ] No flash of unstyled content (FOUC)
- [ ] Smooth transition animation (200ms)

---

## 8. Implementation Checklist

### 8.1 Setup

- [ ] Install dependencies: `next-themes`, `tailwindcss-animate`
- [ ] Configure `tailwind.config.js` with custom theme
- [ ] Create `app/globals.css` with CSS variables
- [ ] Add ThemeProvider to `app/layout.tsx`

### 8.2 Base Theme

- [ ] Define all CSS variables in `:root`
- [ ] Implement dark mode as default
- [ ] Add light mode overrides in `.light` class
- [ ] Test color contrast ratios (WCAG AA)

### 8.3 Visual Effects

- [ ] Create neon glow utility classes
- [ ] Implement glassmorphism cards
- [ ] Add gradient utilities
- [ ] Test animations and transitions

### 8.4 Components

- [ ] Extend Shadcn/UI Button variants
- [ ] Style Card with glassmorphism
- [ ] Style Input with neon focus ring
- [ ] Create Badge variants for priorities
- [ ] Build ThemeSwitcher component

### 8.5 Responsive Testing

- [ ] Test on mobile (<768px)
- [ ] Test on tablet (768-1024px)
- [ ] Test on desktop (>1024px)
- [ ] Verify touch targets are minimum 44x44px

---

## 9. Accessibility

### 9.1 Color Contrast

All text must meet WCAG 2.1 Level AA:
- Normal text: minimum 4.5:1 contrast ratio
- Large text (18pt+): minimum 3:1 contrast ratio
- UI components: minimum 3:1 contrast ratio

**Validation:**
- Use Chrome DevTools Lighthouse audit
- Test with axe DevTools
- Verify all neon glows don't reduce contrast

### 9.2 Focus Indicators

- All interactive elements must have visible focus state
- Focus ring uses `--ring` color (neon cyan)
- Focus indicator is at least 2px thick
- Never remove outline without replacement

### 9.3 Motion Preferences

- Respect `prefers-reduced-motion` setting
- Disable animations for users who prefer reduced motion
- Provide static alternatives for animated content

---

## 10. Cross-References

**Related Specifications:**
- @specs/ui/components.md – Component implementations using this theme
- @specs/ui/pages.md – Page layouts with theme integration
- @specs/features/authentication-frontend.md – Login/signup UI styling

**Skills to Use:**
- `shadcn-ui-cyberpunk-theme-generator` – Generate initial theme CSS

**Implementation Order:**
1. Set up base theme (colors, typography)
2. Configure Tailwind with custom theme
3. Create global styles and utilities
4. Style base Shadcn/UI components
5. Build custom components (TaskCard, TaskList)
6. Implement ThemeSwitcher
7. Test accessibility and responsiveness

---

**End of specs/ui/theme.md**

**Version:** 1.0 | **Last Updated:** 2025-02-08 | **Status:** Draft
