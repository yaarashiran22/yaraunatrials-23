import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-button hover:shadow-button-hover active:shadow-button-active",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-button hover:shadow-button-hover active:shadow-button-active",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-button",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-button hover:shadow-button-hover active:shadow-button-active",
        ghost: "hover:bg-accent hover:text-accent-foreground rounded-xl",
        link: "text-primary underline-offset-4 hover:underline",
        app: "bg-gradient-to-b from-white to-gray-50 border border-gray-200 text-gray-900 hover:from-gray-50 hover:to-gray-100 shadow-button hover:shadow-button-hover active:shadow-button-active",
        primary: "bg-gradient-to-b from-primary to-primary-glow text-primary-foreground shadow-button-instagram hover:shadow-button-hover active:shadow-button-active",
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
