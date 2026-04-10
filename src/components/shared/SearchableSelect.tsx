"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  sublabel?: string;
  photo?: string | null;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  emptyText = "No results found.",
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    (opt.sublabel && opt.sublabel.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setSearch("");
        }}
        className="w-full flex items-center justify-between px-3 py-2 border border-input bg-background hover:bg-accent/50 rounded-md text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="truncate">
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.photo && (
                <img src={selectedOption.photo} alt={selectedOption.label} className="w-5 h-5 rounded-full object-cover shrink-0" />
              )}
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-muted-foreground opacity-50 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-popover text-popover-foreground rounded-md border border-border shadow-md outline-none animate-in fade-in-0 zoom-in-95">
          <div className="flex items-center px-3 py-2 border-b border-border text-sm">
            <Search className="w-4 h-4 mr-2 text-muted-foreground shrink-0 opacity-50" />
            <input
              type="text"
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="max-h-[220px] overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer",
                    value === opt.value ? "bg-accent/50 text-accent-foreground" : "text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.photo ? (
                      <img src={opt.photo} alt={opt.label} className="w-6 h-6 rounded-full object-cover shrink-0" />
                    ) : opt.sublabel ? (
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                        {opt.label.charAt(0)}
                      </div>
                    ) : null}
                    <div className="flex flex-col items-start truncate text-left">
                      <span className="truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[10px] text-muted-foreground truncate">{opt.sublabel}</span>
                      )}
                    </div>
                  </div>
                  {value === opt.value && <Check className="w-4 h-4 text-primary shrink-0 ml-2" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
