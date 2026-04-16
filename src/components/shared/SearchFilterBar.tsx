"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface SearchFilterBarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onClearFilters?: () => void;
  showDateFilter?: boolean;
  dateFilterType?: "all" | "this_month" | "custom";
  onDateFilterTypeChange?: (type: "all" | "this_month" | "custom") => void;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
}

export function SearchFilterBar({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  showDateFilter = false,
  dateFilterType = "all",
  onDateFilterTypeChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: SearchFilterBarProps) {
  const hasActiveFilters =
    Object.values(filterValues).some((v) => v !== "" && v !== "all") ||
    (showDateFilter && (dateFilterType !== "all" || startDate || endDate));

  return (
    <div className="flex flex-col gap-4 w-full bg-background/50 border border-border/60 p-4 rounded-2xl shadow-sm backdrop-blur-md mb-6">
      <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-end justify-between w-full">
        {/* Search Input */}
        <div className="flex flex-col gap-1.5 w-full xl:max-w-md flex-shrink-0">
          <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider opacity-80">Search</label>
          <div className="relative group w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
            <Input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-10 md:pl-10 bg-background shadow-sm border-border/60 focus-visible:ring-primary/20 h-11 transition-all rounded-xl w-full"
            />
          </div>
        </div>

        {/* Filter Dropdowns Area */}
        <div className="flex flex-wrap items-end gap-3 w-full xl:w-auto">
          {showDateFilter && (
            <div className="flex flex-col gap-1.5 w-full sm:w-auto">
              <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider opacity-80">Date Period</label>
              <Select
                value={dateFilterType}
                onValueChange={(val) => onDateFilterTypeChange?.(val as any)}
              >
                <SelectTrigger className="h-11 border-border/60 bg-background hover:bg-muted/30 transition-colors shadow-sm rounded-xl font-medium w-full sm:w-[140px]">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {filters.map((filter) => (
            <div key={filter.key} className="flex flex-col gap-1.5 w-full sm:w-auto">
              <label className="text-xs font-bold text-muted-foreground ml-1 uppercase tracking-wider opacity-80">
                {filter.label.replace(/^All\s+/i, '')}
              </label>
              <Select
                value={filterValues[filter.key] || "all"}
                onValueChange={(val) => onFilterChange?.(filter.key, (val === "all" || val === null) ? "" : val)}
              >
                <SelectTrigger className="h-11 border-border/60 bg-background hover:bg-muted/30 transition-colors shadow-sm rounded-xl font-medium w-full sm:w-fit min-w-[140px]">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="font-semibold">{filter.label}</SelectItem>
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {hasActiveFilters && onClearFilters && (
            <Button
              variant="ghost"
              onClick={onClearFilters}
              className="h-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-xl px-4 flex items-center justify-center gap-2 border border-transparent hover:border-destructive/20 w-full sm:w-auto ml-auto xl:ml-0"
            >
              <X className="w-4 h-4" />
              <span className="text-sm font-medium">Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Custom Date Filter Row */}
      {showDateFilter && dateFilterType === "custom" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3 mt-1 border-t border-border/50 animate-in slide-in-from-top-2 fade-in-50 duration-300">
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">Date Range:</span>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-background border border-border/60 rounded-xl p-1 px-3 shadow-sm h-11 w-full sm:w-auto focus-within:ring-2 ring-primary/20 transition-shadow">
              <Input
                type="date"
                value={startDate || ""}
                onChange={(e) => onStartDateChange?.(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0 h-8 p-0 bg-transparent w-full sm:w-[130px] text-sm font-medium"
              />
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase opacity-70">To</span>
            <div className="flex items-center gap-2 bg-background border border-border/60 rounded-xl p-1 px-3 shadow-sm h-11 w-full sm:w-auto focus-within:ring-2 ring-primary/20 transition-shadow">
              <Input
                type="date"
                value={endDate || ""}
                onChange={(e) => onEndDateChange?.(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0 h-8 p-0 bg-transparent w-full sm:w-[130px] text-sm font-medium"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
