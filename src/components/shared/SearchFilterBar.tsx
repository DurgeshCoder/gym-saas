"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

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
    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
      {/* Search Input */}
      <div className="relative w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none text-sm dark:text-white placeholder:text-slate-400"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex items-center gap-2 flex-wrap">
        {showDateFilter && (
          <select
            value={dateFilterType}
            onChange={(e) => onDateFilterTypeChange?.(e.target.value as any)}
            className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-sm font-medium dark:text-white cursor-pointer hover:border-slate-300 dark:hover:border-slate-600"
          >
            <option value="all">All Time</option>
            <option value="this_month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
        )}

        {showDateFilter && dateFilterType === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate || ""}
              onChange={(e) => onStartDateChange?.(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-sm font-medium dark:text-white"
            />
            <span className="text-slate-400 font-medium">to</span>
            <input
              type="date"
              value={endDate || ""}
              onChange={(e) => onEndDateChange?.(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-sm font-medium dark:text-white"
            />
          </div>
        )}

        {filters.map((filter) => (
          <select
            key={filter.key}
            value={filterValues[filter.key] || ""}
            onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-sm font-medium dark:text-white cursor-pointer hover:border-slate-300 dark:hover:border-slate-600"
          >
            <option value="">{filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        {hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors font-medium"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
