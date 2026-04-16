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
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start sm:items-center justify-between">
      {/* Search Input */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-10"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center w-full sm:w-auto gap-3 flex-wrap">
        {showDateFilter && (
          <Select
            value={dateFilterType}
            onValueChange={(val) => onDateFilterTypeChange?.(val as any)}
          >
            <SelectTrigger className="w-full md:w-auto">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        )}

        {showDateFilter && dateFilterType === "custom" && (
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
            <Input
              type="date"
              value={startDate || ""}
              onChange={(e) => onStartDateChange?.(e.target.value)}
              className="w-full md:w-auto"
            />
            <span className="text-muted-foreground font-medium text-center md:text-left">to</span>
            <Input
              type="date"
              value={endDate || ""}
              onChange={(e) => onEndDateChange?.(e.target.value)}
              className="w-full md:w-auto"
            />
          </div>
        )}

        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={filterValues[filter.key] || "all"}
            onValueChange={(val) => onFilterChange?.(filter.key, (val === "all" || val === null) ? "" : val)}
          >
            <SelectTrigger className="w-full md:w-auto">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{filter.label}</SelectItem>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {hasActiveFilters && onClearFilters && (
          <Button
            variant="destructive" onClick={onClearFilters}
            className="flex items-center justify-center gap-1.5 w-full md:w-auto mt-2 md:mt-0"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
