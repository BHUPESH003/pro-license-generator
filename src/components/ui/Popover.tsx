import * as React from "react";
function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

// Minimal popover implementation without external dependency
// Provides a controlled popover using native portal and positioning

type PopoverContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) throw new Error("Popover components must be used within <Popover>");
  return ctx;
}

const Popover: React.FC<React.PropsWithChildren<{ open?: boolean; onOpenChange?: (open: boolean) => void }>> = ({ open: controlledOpen, onOpenChange, children }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      if (onOpenChange) onOpenChange(next);
    },
    [isControlled, onOpenChange]
  );

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>{children}</PopoverContext.Provider>
  );
};

const PopoverTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(function PopoverTrigger(
  { onClick, ...props },
  ref
) {
  const { open, setOpen } = usePopoverContext();
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={(e) => {
        setOpen(!open);
        if (onClick) onClick(e);
      }}
      ref={ref}
      {...props}
    />
  );
});

type PopoverContentProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "center" | "end";
  sideOffset?: number;
};

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(function PopoverContent(
  { className, align = "center", sideOffset = 4, style, ...props },
  ref
) {
  const { open, setOpen } = usePopoverContext();
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useImperativeHandle(ref, () => contentRef.current as HTMLDivElement);

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!contentRef.current) return;
      if (!contentRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      role="dialog"
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        className
      )}
      style={{ marginTop: sideOffset, ...style }}
      {...props}
    />
  );
});

export { Popover, PopoverTrigger, PopoverContent };
