import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-600 shadow-button-jacaranda hover:shadow-button-hover active:shadow-button-active transition-all duration-200",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-button hover:shadow-button-hover active:shadow-button-active",
        outline:
          "border-2 border-primary-300 bg-background/80 backdrop-blur-sm text-primary hover:bg-primary-100 hover:border-primary-400 shadow-button",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-600 shadow-button-mint hover:shadow-button-hover active:shadow-button-active",
        ghost: "hover:bg-primary-100 hover:text-primary-700 rounded-xl transition-all duration-200",
        link: "text-primary-500 underline-offset-4 hover:underline decoration-primary-300",
        app: "bg-gradient-to-br from-card via-card/95 to-card/90 border-2 border-neutral-200 text-card-foreground hover:border-neutral-300 hover:shadow-card shadow-button",
        // Una Brand Variants - Full Color Diversity
        jacaranda: "bg-primary-700 text-white shadow-button-jacaranda hover:shadow-glow hover:bg-primary-600 transition-all duration-300 active:scale-95",
        'jacaranda-light': "bg-primary-500 text-white shadow-button-jacaranda hover:shadow-glow hover:bg-primary-400 transition-all duration-300 active:scale-95",
        'jacaranda-subtle': "bg-primary-100 text-primary-700 hover:bg-primary-200 border border-primary-200 transition-all duration-300 active:scale-95",
        mint: "bg-secondary-500 text-white shadow-button-mint hover:shadow-mint hover:bg-secondary-600 transition-all duration-300 active:scale-95",
        'mint-dark': "bg-secondary-700 text-white shadow-button-mint hover:shadow-mint hover:bg-secondary-600 transition-all duration-300 active:scale-95",
        'mint-light': "bg-secondary-400 text-white shadow-button-mint hover:shadow-mint hover:bg-secondary-500 transition-all duration-300 active:scale-95",
        'mint-subtle': "bg-secondary-100 text-secondary-700 hover:bg-secondary-200 border border-secondary-200 transition-all duration-300 active:scale-95",
        coupon: "bg-accent text-accent-foreground shadow-button hover:shadow-button-hover hover:bg-accent-600 transition-all duration-300 active:scale-95",
        'coupon-light': "bg-accent-400 text-accent-foreground shadow-button hover:shadow-button-hover hover:bg-accent-500 transition-all duration-300 active:scale-95",
        success: "bg-success text-success-foreground shadow-button hover:shadow-button-hover hover:bg-success/90 transition-all duration-300 active:scale-95",
        warning: "bg-warning text-warning-foreground shadow-button hover:shadow-button-hover hover:bg-warning/90 transition-all duration-300 active:scale-95",
        plaza: "bg-gradient-plaza-dusk text-white shadow-glow hover:shadow-floating hover:scale-105 transition-all duration-300 active:scale-95",
        // Neutral variants for diversity
        'neutral-light': "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200 transition-all duration-300 active:scale-95",
        'neutral-medium': "bg-neutral-300 text-neutral-700 hover:bg-neutral-400 transition-all duration-300 active:scale-95",
        'neutral-dark': "bg-neutral-700 text-white hover:bg-neutral-600 transition-all duration-300 active:scale-95",
      },
      size: {
        xs: "h-8 px-3 py-1 text-xs min-w-[2rem]",
        sm: "h-10 px-4 py-2 text-sm min-w-[2.5rem]",
        default: "h-12 px-6 py-3 text-base min-w-[3rem] min-h-[var(--touch-sm)]",
        lg: "h-14 px-8 py-4 text-lg min-w-[3.5rem] min-h-[var(--touch-lg)]",
        xl: "h-16 px-10 py-5 text-xl min-w-[4rem] min-h-[var(--touch-xl)]",
        icon: "h-12 w-12 min-h-[var(--touch-sm)] min-w-[var(--touch-sm)]",
        "icon-sm": "h-10 w-10 min-h-[2.5rem] min-w-[2.5rem]",
        "icon-lg": "h-14 w-14 min-h-[var(--touch-lg)] min-w-[var(--touch-lg)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
