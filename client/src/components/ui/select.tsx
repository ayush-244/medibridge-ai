import * as React from "react";
import { cn } from "@/lib/utils";

type SelectContextValue = {
  disabled?: boolean;
  open: boolean;
  selectedLabel?: string;
  value?: string;
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
  registerItem: (value: string, label: string) => void;
};

const SelectContext = React.createContext<SelectContextValue | null>(null);

function useSelectContext(component: string) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error(`${component} must be used within Select`);
  }
  return context;
}

type NativeSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  onValueChange?: never;
};

type ComposedSelectProps = {
  children: React.ReactNode;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  onValueChange: (value: string) => void;
  value?: string;
};

export type SelectProps = NativeSelectProps | ComposedSelectProps;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
  if ("onValueChange" in props && props.onValueChange) {
    const {
      children,
      className,
      defaultValue,
      disabled,
      onValueChange,
      value,
    } = props;
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [itemLabels, setItemLabels] = React.useState<Record<string, string>>(
      {},
    );
    const selectedValue = value ?? internalValue;

    const registerItem = React.useCallback((itemValue: string, label: string) => {
      setItemLabels((prev) => {
        if (prev[itemValue] === label) return prev;
        return { ...prev, [itemValue]: label };
      });
    }, []);

    const handleValueChange = React.useCallback(
      (nextValue: string) => {
        setInternalValue(nextValue);
        onValueChange(nextValue);
        setOpen(false);
      },
      [onValueChange],
    );

    const contextValue = React.useMemo<SelectContextValue>(
      () => ({
        disabled,
        open,
        selectedLabel: selectedValue ? itemLabels[selectedValue] : undefined,
        value: selectedValue,
        onOpenChange: setOpen,
        onValueChange: handleValueChange,
        registerItem,
      }),
      [
        disabled,
        handleValueChange,
        itemLabels,
        open,
        registerItem,
        selectedValue,
      ],
    );

    return (
      <SelectContext.Provider value={contextValue}>
        <div className={cn("relative", className)}>{children}</div>
      </SelectContext.Provider>
    );
  }

  const { className, children, ...nativeProps } = props;

  return (
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...nativeProps}
      >
        {children}
      </select>
  );
});
Select.displayName = "Select";

export type SelectTriggerProps =
  React.ButtonHTMLAttributes<HTMLButtonElement>;

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const context = useSelectContext("SelectTrigger");

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-border bg-white px-3 py-2 text-left text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        disabled={context.disabled || props.disabled}
        aria-expanded={context.open}
        {...props}
        onClick={(event) => {
          props.onClick?.(event);
          if (!event.defaultPrevented) {
            context.onOpenChange(!context.open);
          }
        }}
      >
        {children}
        <span aria-hidden="true" className="ml-2 text-text-secondary">
          v
        </span>
      </button>
    );
  },
);
SelectTrigger.displayName = "SelectTrigger";

export interface SelectValueProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string;
}

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className, placeholder, ...props }, ref) => {
    const context = useSelectContext("SelectValue");
    const label = context.selectedLabel || context.value || placeholder;

    return (
      <span
        ref={ref}
        className={cn(
          "truncate",
          !context.value && "text-text-secondary",
          className,
        )}
        {...props}
      >
        {label}
      </span>
    );
  },
);
SelectValue.displayName = "SelectValue";

export interface SelectContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const context = useSelectContext("SelectContent");

    if (!context.open) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-white p-1 text-sm shadow-lg",
          className,
        )}
        role="listbox"
        {...props}
      >
        {children}
      </div>
    );
  },
);
SelectContent.displayName = "SelectContent";

export interface SelectItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  textValue?: string;
}

const SelectItem = React.forwardRef<HTMLButtonElement, SelectItemProps>(
  ({ className, children, textValue, value, ...props }, ref) => {
    const context = useSelectContext("SelectItem");
    const label =
      textValue ??
      (typeof children === "string" ? children : String(value));

    React.useEffect(() => {
      context.registerItem(value, label);
    }, [context, label, value]);

    const selected = context.value === value;

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-left text-text-primary outline-none hover:bg-surface focus:bg-surface",
          selected && "bg-surface font-medium",
          className,
        )}
        role="option"
        aria-selected={selected}
        {...props}
        onClick={(event) => {
          props.onClick?.(event);
          if (!event.defaultPrevented) {
            context.onValueChange(value);
          }
        }}
      >
        {children}
      </button>
    );
  },
);
SelectItem.displayName = "SelectItem";

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
