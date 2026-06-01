"use client";

import { ActiveFilter } from "@/types";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  active: ActiveFilter;
  onChange: (filter: ActiveFilter) => void;
  counts: {
    all: number;
    pinterest: number;
    arena: number;
    instagram: number;
  };
}

const IG_GRADIENT = "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)";

const filters: { id: ActiveFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "instagram", label: "Instagram" },
  { id: "pinterest", label: "Pinterest" },
  { id: "arena", label: "Are.na" },
];

export function FilterBar({ active, onChange, counts }: FilterBarProps) {
  return (
    <div className="flex items-center gap-1 bg-[#0e0e0e]/80 border border-white/10 rounded-xl px-1.5 py-1.5 backdrop-blur-md">
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-light tracking-wide transition-all duration-150",
            active === f.id
              ? "bg-white/10 text-white"
              : "text-white/40 hover:text-white/70 hover:bg-white/5"
          )}
        >
          {f.id === "instagram" && (
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 inline-block"
              style={{ background: IG_GRADIENT }}
            />
          )}
          {f.id === "pinterest" && (
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block flex-shrink-0" />
          )}
          {f.id === "arena" && (
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400 inline-block flex-shrink-0" />
          )}
          {f.label}
          <span
            className={cn(
              "font-mono text-[10px]",
              active === f.id ? "text-white/50" : "text-white/20"
            )}
          >
            {counts[f.id]}
          </span>
        </button>
      ))}
    </div>
  );
}
