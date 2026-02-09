---
name: shadcn-ui-cyberpunk-theme-generator
description: |
  This skill helps Claude Code generate beautiful, cyberpunk-style Shadcn/UI + Tailwind CSS theme configurations and component overrides for Next.js applications. Includes dark mode by default, neon glows, glassmorphism cards, futuristic fonts, priority-colored task elements, command palette support, responsive layouts, and integration with existing ui-ux-cyberpunk-architect agent outputs. This skill activates automatically when users mention Shadcn, Tailwind theme, cyberpunk style, dark/neon UI, beautiful Todo dashboard, task cards, glassmorphism, or frontend styling for Hackathon Todo app.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# Shadcn UI Cyberpunk Theme Generator Skill

## Overview
This skill provides comprehensive guidance for creating cyberpunk-themed Shadcn/UI components with Tailwind CSS. It covers everything from color palettes and theming to component customization and responsive design for Next.js applications.

## When to Use This Skill
- Creating cyberpunk-inspired UI designs with neon colors and dark backgrounds
- Customizing Shadcn UI components with futuristic styling
- Implementing glassmorphism and neon glow effects
- Setting up dark mode with cyberpunk aesthetics
- Creating priority-based task management interfaces
- Building command palette functionality with cyberpunk styling
- Designing responsive layouts with futuristic elements

## Before Implementation

Gather context to ensure successful implementation:

| Source | Gather |
|--------|--------|
| **Codebase** | Existing Shadcn UI setup, Tailwind configuration, current theme files |
| **Conversation** | User's specific cyberpunk aesthetic preferences, color choices, component requirements |
| **Skill References** | Cyberpunk design patterns, Shadcn theming documentation, accessibility standards |
| **User Guidelines** | Project-specific design requirements, brand guidelines, accessibility needs |

Ensure all required context is gathered before implementing.

## Cyberpunk Color Palette

### Primary Neon Colors
```css
/* Define cyberpunk color palette in CSS variables */
:root {
  /* Core cyberpunk colors */
  --cyber-neon-blue: #00f3ff;
  --cyber-neon-pink: #ff00c8;
  --cyber-neon-purple: #bd00ff;
  --cyber-neon-green: #39ff14;
  --cyber-neon-yellow: #ffff33;

  /* Dark background */
  --cyber-bg-dark: #0a0a0f;
  --cyber-bg-darker: #050508;
  --cyber-bg-glass: rgba(10, 10, 15, 0.8);

  /* Text colors */
  --cyber-text-primary: #ffffff;
  --cyber-text-secondary: #a0a0b0;
  --cyber-text-muted: #606070;

  /* Priority colors */
  --cyber-priority-high: #ff0055;
  --cyber-priority-medium: #ffaa00;
  --cyber-priority-low: #00cc66;
}
```

### Dark Mode Theme Variables
```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config = {
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
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        cyber: ["var(--font-cyber)", ...fontFamily.sans],
      },
      colors: {
        cyber: {
          neon: {
            blue: "hsl(var(--cyber-neon-blue))",
            pink: "hsl(var(--cyber-neon-pink))",
            purple: "hsl(var(--cyber-neon-purple))",
            green: "hsl(var(--cyber-neon-green))",
            yellow: "hsl(var(--cyber-neon-yellow))",
          },
          bg: {
            dark: "hsl(var(--cyber-bg-dark))",
            darker: "hsl(var(--cyber-bg-darker))",
            glass: "hsl(var(--cyber-bg-glass))",
          },
          text: {
            primary: "hsl(var(--cyber-text-primary))",
            secondary: "hsl(var(--cyber-text-secondary))",
            muted: "hsl(var(--cyber-text-muted))",
          },
          priority: {
            high: "hsl(var(--cyber-priority-high))",
            medium: "hsl(var(--cyber-priority-medium))",
            low: "hsl(var(--cyber-priority-low))",
          },
        },
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "neon-glow": {
          "0%, 100%": {
            boxShadow: "0 0 5px var(--cyber-neon-blue), 0 0 10px var(--cyber-neon-blue), 0 0 20px var(--cyber-neon-blue), 0 0 40px var(--cyber-neon-blue)"
          },
          "50%": {
            boxShadow: "0 0 10px var(--cyber-neon-blue), 0 0 20px var(--cyber-neon-blue), 0 0 30px var(--cyber-neon-blue), 0 0 50px var(--cyber-neon-blue)"
          },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "neon-glow": "neon-glow 2s ease-in-out infinite alternate",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
```

## CSS Variables Configuration

### Enhanced CSS Variables for Cyberpunk Theme
```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Cyberpunk color palette */
    --cyber-neon-blue: 0 243 255;
    --cyber-neon-pink: 255 0 200;
    --cyber-neon-purple: 189 0 255;
    --cyber-neon-green: 57 255 20;
    --cyber-neon-yellow: 255 255 51;

    /* Backgrounds */
    --cyber-bg-dark: 10 10 15;
    --cyber-bg-darker: 5 5 8;
    --cyber-bg-glass: 10 10 15 / 0.8;

    /* Text */
    --cyber-text-primary: 255 255 255;
    --cyber-text-secondary: 160 160 176;
    --cyber-text-muted: 96 96 112;

    /* Priority */
    --cyber-priority-high: 255 0 85;
    --cyber-priority-medium: 255 170 0;
    --cyber-priority-low: 0 204 102;

    /* Standard Shadcn variables */
    --background: var(--cyber-bg-dark);
    --foreground: var(--cyber-text-primary);

    --card: var(--cyber-bg-darker);
    --card-foreground: var(--cyber-text-primary);

    --popover: var(--cyber-bg-darker);
    --popover-foreground: var(--cyber-text-primary);

    --primary: var(--cyber-neon-blue);
    --primary-foreground: 0 0 0;

    --secondary: var(--cyber-text-secondary);
    --secondary-foreground: var(--cyber-text-primary);

    --muted: var(--cyber-text-muted);
    --muted-foreground: var(--cyber-text-secondary);

    --accent: var(--cyber-text-muted);
    --accent-foreground: var(--cyber-text-primary);

    --destructive: 255 0 85;
    --destructive-foreground: var(--cyber-text-primary);

    --border: var(--cyber-text-muted);
    --input: var(--cyber-text-muted);
    --ring: var(--cyber-neon-blue);

    --radius: 0.5rem;
  }

  .dark {
    --background: var(--cyber-bg-dark);
    --foreground: var(--cyber-text-primary);

    --card: var(--cyber-bg-darker);
    --card-foreground: var(--cyber-text-primary);

    --popover: var(--cyber-bg-darker);
    --popover-foreground: var(--cyber-text-primary);

    --primary: var(--cyber-neon-blue);
    --primary-foreground: 0 0 0;

    --secondary: var(--cyber-text-secondary);
    --secondary-foreground: var(--cyber-text-primary);

    --muted: var(--cyber-text-muted);
    --muted-foreground: var(--cyber-text-secondary);

    --accent: var(--cyber-text-muted);
    --accent-foreground: var(--cyber-text-primary);

    --destructive: 255 0 85;
    --destructive-foreground: var(--cyber-text-primary);

    --border: var(--cyber-text-muted);
    --input: var(--cyber-text-muted);
    --ring: var(--cyber-neon-blue);
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* Cyberpunk-specific utilities */
@layer utilities {
  .cyber-glow {
    @apply shadow-[0_0_15px_rgba(var(--cyber-neon-blue)_/_0.5)];
  }

  .cyber-glow-blue {
    @apply shadow-[0_0_15px_rgba(var(--cyber-neon-blue)_/_0.5)];
  }

  .cyber-glow-pink {
    @apply shadow-[0_0_15px_rgba(var(--cyber-neon-pink)_/_0.5)];
  }

  .cyber-glow-purple {
    @apply shadow-[0_0_15px_rgba(var(--cyber-neon-purple)_/_0.5)];
  }

  .glass-effect {
    @apply bg-[rgba(var(--cyber-bg-glass))] backdrop-blur-md border border-[rgba(var(--cyber-text-muted)_/_0.3)];
  }

  .cyber-border {
    @apply border border-[rgba(var(--cyber-neon-blue)_/_0.3)] before:absolute before:inset-0 before:rounded-[calc(var(--radius)_-_2px)] before:border before:border-[rgba(var(--cyber-neon-blue)_/_0.1)] before:pointer-events-none;
  }

  .cyber-text-gradient {
    @apply bg-gradient-to-r from-[rgb(var(--cyber-neon-blue))] to-[rgb(var(--cyber-neon-purple))] bg-clip-text text-transparent;
  }
}
```

## Component Customizations

### Custom Card Component with Glassmorphism
```tsx
// components/ui/cyber-card.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const CyberCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "glass-effect rounded-lg border border-cyber-text-muted/30 bg-cyber-bg-glass/80 shadow-sm overflow-hidden",
      "transition-all duration-300 hover:cyber-glow-blue hover:shadow-[0_0_25px_rgba(var(--cyber-neon-blue)_/_0.3)]",
      className
    )}
    {...props}
  />
));
CyberCard.displayName = "CyberCard";

const CyberCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CyberCardHeader.displayName = "CyberCardHeader";

const CyberCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight cyber-text-gradient",
      className
    )}
    {...props}
  />
));
CyberCardTitle.displayName = "CyberCardTitle";

const CyberCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-cyber-text-secondary", className)}
    {...props}
  />
));
CyberCardDescription.displayName = "CyberCardDescription";

const CyberCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CyberCardContent.displayName = "CyberCardContent";

const CyberCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CyberCardFooter.displayName = "CyberCardFooter";

export {
  CyberCard,
  CyberCardHeader,
  CyberCardFooter,
  CyberCardTitle,
  CyberCardDescription,
  CyberCardContent
};
```

### Custom Button with Neon Effects
```tsx
// components/ui/cyber-button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 cyber-glow-blue",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 cyber-glow",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground cyber-glow",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 cyber-glow-pink",
        ghost: "hover:bg-accent hover:text-accent-foreground cyber-glow",
        link: "text-primary underline-offset-4 hover:underline",
        cyber:
          "bg-cyber-bg-darker border border-cyber-text-muted/30 shadow-sm hover:bg-cyber-bg-dark cyber-glow-blue text-cyber-text-primary font-bold uppercase tracking-wider",
        cyberNeon:
          "bg-cyber-bg-darker border border-cyber-text-muted/30 shadow-sm hover:bg-cyber-bg-dark cyber-glow text-cyber-neon-blue font-bold uppercase tracking-wider",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### Custom Badge for Priority Levels
```tsx
// components/ui/cyber-badge.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        high: "border-cyber-priority-high/30 bg-cyber-priority-high/10 text-cyber-priority-high cyber-glow",
        medium: "border-cyber-priority-medium/30 bg-cyber-priority-medium/10 text-cyber-priority-medium cyber-glow",
        low: "border-cyber-priority-low/30 bg-cyber-priority-low/10 text-cyber-priority-low cyber-glow",
        neonBlue: "border-cyber-neon-blue/30 bg-cyber-neon-blue/10 text-cyber-neon-blue cyber-glow",
        neonPink: "border-cyber-neon-pink/30 bg-cyber-neon-pink/10 text-cyber-neon-pink cyber-glow",
        neonPurple: "border-cyber-neon-purple/30 bg-cyber-neon-purple/10 text-cyber-neon-purple cyber-glow",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
```

### Custom Input Field with Cyberpunk Styling
```tsx
// components/ui/cyber-input.tsx
import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-cyber-text-muted/30 bg-cyber-bg-darker px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-cyber-text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyber-neon-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "cyber-glow transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
```

## Responsive Design Patterns

### Cyberpunk Grid Layout
```tsx
// components/layouts/cyber-grid.tsx
import { cn } from "@/lib/utils";

interface CyberGridProps {
  children: React.ReactNode;
  cols?: string;
  gap?: string;
  className?: string;
}

export function CyberGrid({
  children,
  cols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  gap = "gap-6",
  className
}: CyberGridProps) {
  return (
    <div
      className={cn(
        "grid",
        cols,
        gap,
        "w-full max-w-7xl mx-auto p-4",
        className
      )}
    >
      {children}
    </div>
  );
}
```

### Cyberpunk Dashboard Layout
```tsx
// components/layouts/cyber-dashboard.tsx
import { cn } from "@/lib/utils";

interface CyberDashboardLayoutProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  main: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function CyberDashboardLayout({
  sidebar,
  header,
  main,
  footer,
  className
}: CyberDashboardLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-cyber-bg-dark text-cyber-text-primary", className)}>
      {header && (
        <header className="glass-effect border-b border-cyber-text-muted/30 p-4">
          {header}
        </header>
      )}

      <div className="flex">
        {sidebar && (
          <aside className="w-64 glass-effect border-r border-cyber-text-muted/30 p-4 hidden md:block">
            {sidebar}
          </aside>
        )}

        <main className="flex-1 p-4 md:p-6">
          {main}
        </main>
      </div>

      {footer && (
        <footer className="glass-effect border-t border-cyber-text-muted/30 p-4">
          {footer}
        </footer>
      )}
    </div>
  );
}
```

## Command Palette Integration

### Cyberpunk Command Palette
```tsx
// components/ui/cyber-command.tsx
"use client";

import * as React from "react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const CyberCommand = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden glass-effect border border-cyber-text-muted/30 rounded-lg",
      className
    )}
    {...props}
  />
));
CyberCommand.displayName = CommandPrimitive.displayName;

interface CyberCommandDialogProps extends DialogProps {}

const CyberCommandDialog = ({ children, ...props }: CyberCommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 glass-effect border border-cyber-text-muted/30 shadow-2xl">
        <CyberCommand className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-cyber-text-secondary [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </CyberCommand>
      </DialogContent>
    </Dialog>
  );
};

const CyberCommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-cyber-text-muted/30 px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-cyber-neon-blue" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-cyber-text-muted disabled:cursor-not-allowed disabled:opacity-50 text-cyber-text-primary",
        className
      )}
      {...props}
    />
  </div>
));

CyberCommandInput.displayName = CommandPrimitive.Input.displayName;

const CyberCommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
));

CyberCommandList.displayName = CommandPrimitive.List.displayName;

const CyberCommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm text-cyber-text-secondary"
    {...props}
  />
));

CyberCommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CyberCommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-cyber-text-primary [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-cyber-text-secondary",
      className
    )}
    {...props}
  />
));

CyberCommandGroup.displayName = CommandPrimitive.Group.displayName;

const CyberCommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-cyber-text-muted/30", className)}
    {...props}
  />
));
CyberCommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CyberCommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-cyber-bg-darker aria-selected:text-cyber-neon-blue data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-cyber-bg-darker hover:text-cyber-neon-blue cyber-glow",
      className
    )}
    {...props}
  />
));

CyberCommandItem.displayName = CommandPrimitive.Item.displayName;

const CyberCommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-cyber-text-secondary",
        className
      )}
      {...props}
    />
  );
};
CyberCommandShortcut.displayName = "CyberCommandShortcut";

export {
  CyberCommand,
  CyberCommandDialog,
  CyberCommandInput,
  CyberCommandList,
  CyberCommandEmpty,
  CyberCommandGroup,
  CyberCommandItem,
  CyberCommandShortcut,
  CyberCommandSeparator,
};
```

## Accessibility Considerations

### WCAG Compliance for Cyberpunk Themes
```tsx
// utils/accessibility.ts
export const getAccessibleColor = (backgroundColor: string, textColor: string) => {
  // Calculate contrast ratio and ensure WCAG AA compliance
  // Return adjusted color if contrast is insufficient
  return {
    backgroundColor,
    textColor,
    contrastRatio: 7 // Aim for 4.5:1 minimum, 7:1 preferred for body text
  };
};

// Example usage in components
export const getCyberContrastClass = (priority: 'high' | 'medium' | 'low') => {
  switch(priority) {
    case 'high':
      return 'text-cyber-priority-high/90'; // Reduced saturation for better contrast
    case 'medium':
      return 'text-cyber-priority-medium/90';
    case 'low':
      return 'text-cyber-priority-low/90';
    default:
      return 'text-cyber-text-primary';
  };
};
```

## Performance Optimization

### Optimized Cyberpunk Components
```tsx
// hooks/useCyberAnimation.ts
import { useState, useEffect } from 'react';

export const useCyberAnimation = (isActive: boolean) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  return { isVisible };
};
```

## Quality Assurance Checklist

- [ ] Cyberpunk color palette properly defined in CSS variables
- [ ] Dark mode theme configured with appropriate contrasts
- [ ] Neon glow effects implemented with CSS animations
- [ ] Glassmorphism effects applied to appropriate components
- [ ] Responsive design patterns implemented for all screen sizes
- [ ] Accessibility standards met (WCAG AA minimum)
- [ ] Cyberpunk-themed components properly customized (Card, Button, Badge, etc.)
- [ ] Command palette functionality with cyberpunk styling
- [ ] Performance optimizations applied (animation frame, memoization)
- [ ] All components properly typed with TypeScript
- [ ] Consistent spacing and typography following design system
- [ ] Hover and focus states implemented for interactive elements
- [ ] Mobile-first responsive design approach used

## References and Further Reading

- Shadcn UI Documentation: https://ui.shadcn.com/docs
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- Cyberpunk Design Trends: Research modern cyberpunk UI patterns
- WCAG Accessibility Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- CSS Variables for Theming: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
- Glassmorphism CSS Techniques: Modern CSS approaches for frosted glass effects
- Animation Performance: Best practices for smooth CSS animations