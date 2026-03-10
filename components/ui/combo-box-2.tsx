"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Option = { value: string | undefined; label: string };

type BaseProps = {
  options: Option[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  contentClassname?: string;
  isLoading?: boolean;
  disabled?: boolean;
  showSearch?: boolean;
  allowEmpty?: boolean;
  customTrigger?: React.ReactNode;
};

type AsyncProps = {
  /** Controlled search input (async mode). */
  searchValue?: string;
  /** Fires on every keystroke (async mode). */
  onSearchChange?: (value: string) => void;
};

export const ComboBox = ({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No option found.",
  className,
  contentClassname,
  isLoading,
  disabled,
  showSearch = false,
  allowEmpty = false,
  customTrigger,
  /** async props */
  onSearchChange,
}: BaseProps & AsyncProps) => {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const itemRefs = React.useRef<(HTMLLIElement | null)[]>([]);

  const effectiveInputValue = inputValue;

  // Bypass local filtering in async mode (when onSearchChange is provided)
  const filteredOptions = React.useMemo(() => {
    if (!effectiveInputValue) return options;
    return options.filter((o) =>
      o.label.toLowerCase().includes(effectiveInputValue.toLowerCase()),
    );
  }, [options, effectiveInputValue]);

  const allOptions = allowEmpty
    ? [{ label: placeholder, value: "" }, ...filteredOptions]
    : filteredOptions;

  const selectedLabel = React.useMemo(() => {
    if (value === undefined || (value === "" && allowEmpty)) return placeholder;
    return options.find((o) => o.value === value)?.label || placeholder;
  }, [value, options, placeholder, allowEmpty]);

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const t = event.target as Node;
      if (
        open &&
        dropdownRef.current &&
        !dropdownRef.current.contains(t) &&
        !buttonRef.current?.contains(t)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Reset active index whenever we open or the query changes
  React.useEffect(() => {
    if (open) setActiveIndex(-1);
  }, [open, effectiveInputValue]);

  // Keep activeIndex in-bounds when options change
  React.useEffect(() => {
    if (activeIndex >= allOptions.length) setActiveIndex(allOptions.length - 1);
  }, [allOptions.length, activeIndex]);

  // Auto-scroll active item into view
  React.useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const selectAtIndex = (index: number) => {
    if (index < 0 || index >= allOptions.length) return;
    const selected = allOptions[index];
    onValueChange?.(selected.value ?? "");
    setOpen(false);
    if (!onSearchChange) setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % allOptions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? allOptions.length - 1 : prev - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      if (allOptions.length) setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      if (allOptions.length) setActiveIndex(allOptions.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      // If nothing is active but there's exactly one option, pick it
      if (activeIndex === -1 && allOptions.length === 1) {
        selectAtIndex(0);
      } else if (activeIndex >= 0) {
        selectAtIndex(activeIndex);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className={cn("relative inline-block w-[280px]", className)}>
      <Button
        ref={buttonRef}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((prev) => !prev);
          // focus input on open next tick
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={cn("w-full justify-between h-11", className)}
      >
        {customTrigger ? (
          customTrigger
        ) : isLoading ? (
          <span className="overflow-hidden text-ellipsis">Loading...</span>
        ) : (
          <span className="overflow-hidden text-ellipsis">{selectedLabel}</span>
        )}
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover shadow-md",
            contentClassname,
          )}
        >
          {showSearch && (
            <div className="w-full border-b items-center px-2 text-sm flex gap-2">
              <Search className="size-4 text-muted-foreground" />
              <input
                ref={inputRef}
                autoFocus
                type="text"
                placeholder={searchPlaceholder}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                className="flex-grow py-1 focus:outline-none"
              />
              {onSearchChange && filteredOptions.length <= 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  className="p-1 text-xs my-2"
                  onClick={() => onSearchChange(inputValue)}
                  disabled={isLoading}
                >
                  {inputValue && filteredOptions.length <= 0
                    ? "Load More"
                    : "Reload"}
                </Button>
              )}
            </div>
          )}

          <div
            className="max-h-48 overflow-auto text-sm"
            // When showSearch is false, capture keyboard on the list
            onKeyDown={!showSearch ? handleKeyDown : undefined}
            tabIndex={-1}
          >
            {isLoading ? (
              <div className="px-4 py-2 text-muted-foreground">Loading...</div>
            ) : allOptions.length === 0 ? (
              <div className="px-4 py-2 text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              <ul role="listbox" aria-activedescendant={activeIndex.toString()}>
                {allOptions.map((option, index) => (
                  <li
                    key={`${option.value}-${index}`}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    role="option"
                    aria-selected={value === option.value}
                    className={cn(
                      "flex cursor-pointer wrap-anywhere items-center justify-between px-4 py-2 hover:bg-accent",
                      index === activeIndex && "bg-accent",
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectAtIndex(index)}
                  >
                    {option.label}
                    {value === option.value && <Check className="h-4 w-4" />}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
