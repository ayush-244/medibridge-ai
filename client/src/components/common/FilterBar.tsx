import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

interface FilterBarProps {
  filters: FilterConfig[];
  className?: string;
}

export function FilterBar({ filters, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
        className,
      )}
    >
      {filters.map((filter) => (
        <div key={filter.id} className="flex min-w-0 flex-1 flex-col gap-1.5 sm:max-w-[200px]">
          <label
            htmlFor={filter.id}
            className="text-xs font-medium text-text-secondary"
          >
            {filter.label}
          </label>
          <select
            id={filter.id}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
