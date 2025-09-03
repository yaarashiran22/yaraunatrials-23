import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 transform hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg",
        outline:
          "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent shadow-sm hover:shadow-md",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        accent: "bg-gradient-to-r from-accent via-pink to-coral text-accent-foreground hover:shadow-lg hover:shadow-accent/25 shadow-md",
        warm: "bg-gradient-to-r from-coral via-warning to-success text-white hover:shadow-lg hover:shadow-coral/25 shadow-md",
        teal: "bg-teal text-teal-foreground hover:bg-teal/90 shadow-md hover:shadow-lg hover:shadow-teal/25",
        violet: "bg-violet text-violet-foreground hover:bg-violet/90 shadow-md hover:shadow-lg hover:shadow-violet/25",
        coral: "bg-coral text-coral-foreground hover:bg-coral/90 shadow-md hover:shadow-lg hover:shadow-coral/25",
        pink: "bg-pink text-pink-foreground hover:bg-pink/90 shadow-md hover:shadow-lg hover:shadow-pink/25",
        gradient: "bg-gradient-to-r from-teal via-violet to-pink text-white hover:shadow-lg hover:shadow-violet/25 shadow-md",
      },
      size: {
        default: "h-12 px-6 py-3 min-w-[120px]",
        sm: "h-10 rounded-lg px-4 min-w-[100px]",
        lg: "h-14 rounded-lg px-8 min-w-[140px] text-base",
        icon: "h-12 w-12",
        touch: "h-14 w-full px-6 text-base",
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
