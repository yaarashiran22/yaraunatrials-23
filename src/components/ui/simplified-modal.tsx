import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const SimplifiedModal = DialogPrimitive.Root

const SimplifiedModalTrigger = DialogPrimitive.Trigger

const SimplifiedModalPortal = DialogPrimitive.Portal

const SimplifiedModalClose = DialogPrimitive.Close

const SimplifiedModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
SimplifiedModalOverlay.displayName = DialogPrimitive.Overlay.displayName

const SimplifiedModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean
  }
>(({ className, children, showCloseButton = true, ...props }, ref) => (
  <SimplifiedModalPortal>
    <SimplifiedModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-content-normal p-content-loose md:w-full",
        "bg-background shadow-2xl duration-200",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        "rounded-3xl border border-border/20 max-h-[85vh] overflow-y-auto",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute right-4 top-4 rounded-full opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </SimplifiedModalPortal>
))
SimplifiedModalContent.displayName = DialogPrimitive.Content.displayName

const SimplifiedModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 px-content-loose pt-content-loose pb-content-normal border-b border-border/10",
      className
    )}
    {...props}
  />
)
SimplifiedModalHeader.displayName = "SimplifiedModalHeader"

const SimplifiedModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 px-content-loose pb-content-loose pt-content-normal border-t border-border/10",
      className
    )}
    {...props}
  />
)
SimplifiedModalFooter.displayName = "SimplifiedModalFooter"

const SimplifiedModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-tight tracking-tight text-foreground",
      className
    )}
    {...props}
  />
))
SimplifiedModalTitle.displayName = DialogPrimitive.Title.displayName

const SimplifiedModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-base text-muted-foreground leading-relaxed", className)}
    {...props}
  />
))
SimplifiedModalDescription.displayName = DialogPrimitive.Description.displayName

const SimplifiedModalBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "px-content-loose py-content-normal space-y-content-normal",
      className
    )}
    {...props}
  />
)
SimplifiedModalBody.displayName = "SimplifiedModalBody"

export {
  SimplifiedModal,
  SimplifiedModalPortal,
  SimplifiedModalOverlay,
  SimplifiedModalClose,
  SimplifiedModalTrigger,
  SimplifiedModalContent,
  SimplifiedModalHeader,
  SimplifiedModalFooter,
  SimplifiedModalTitle,
  SimplifiedModalDescription,
  SimplifiedModalBody,
}