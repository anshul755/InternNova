import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { IoChevronDown, IoSearch } from "react-icons/io5";

export default function SearchableSelect({
  label,
  value,
  onChange,
  options,           // [{ value, label, sublabel? }]
  placeholder = "Search...",
  searchPlaceholder,
  emptyMessage = "No results found.",
  className = "",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [triggerRect, setTriggerRect] = useState(null);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => String(o.value) === String(value));
    return found?.label || "";
  }, [options, value]);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((o) =>
      o.label.toLowerCase().includes(q) ||
      (o.sublabel && o.sublabel.toLowerCase().includes(q))
    );
  }, [options, search]);

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightIndex(0);
  }, [filtered.length]);

  // Close on outside click (checks both trigger container AND portal dropdown)
  useEffect(() => {
    function handleClick(e) {
      const insideTrigger = containerRef.current?.contains(e.target);
      const insideDropdown = dropdownRef.current?.contains(e.target);
      if (!insideTrigger && !insideDropdown) {
        setOpen(false);
        setSearch("");
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-searchable-option]');
    const el = items[highlightIndex];
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [highlightIndex, open]);

  function selectOption(optValue) {
    onChange(optValue);
    setOpen(false);
    setSearch("");
  }

  function openDropdown() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setTriggerRect({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function handleKeyDown(e) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filtered[highlightIndex]) {
          selectOption(filtered[highlightIndex].value);
        }
        break;
      case "Escape":
        setOpen(false);
        setSearch("");
        inputRef.current?.blur();
        break;
    }
  }

  // Update position on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    function updateRect() {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setTriggerRect({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      }
    }
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [open]);

  const dropdownStyle = triggerRect
    ? { position: "fixed", top: triggerRect.top, left: triggerRect.left, width: triggerRect.width, zIndex: 9999 }
    : { display: "none" };

  const dropdownContent = open && triggerRect && (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="glass-panel border border-white/60 py-2 overflow-hidden"
    >
      <div className="flex items-center gap-2.5 px-3 py-2.5 mx-1 border-b border-white/40 bg-white/10 rounded-lg">
        <IoSearch className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={searchPlaceholder || `Search ${label?.toLowerCase() || "jobs"}...`}
          className="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
        />
      </div>

      <div ref={listRef} className="max-h-56 overflow-y-auto overflow-x-hidden py-1">
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
            {emptyMessage}
          </div>
        ) : (
          filtered.map((opt, i) => (
            <button
              key={opt.value}
              type="button"
              data-searchable-option
              onClick={() => selectOption(opt.value)}
              onMouseEnter={() => setHighlightIndex(i)}
              className={`w-full text-left px-3 py-2.5 mx-1 my-0.5 rounded-lg text-sm transition-all duration-300 flex items-center justify-between ${
                String(value) === String(opt.value)
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-white shadow-[0_0_16px_rgba(159,232,112,0.15)]"
                  : i === highlightIndex
                  ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 shadow-[0_0_16px_rgba(159,232,112,0.25)]"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 hover:shadow-[0_0_16px_rgba(159,232,112,0.25)]"
              }`}
            >
              <div className="min-w-0 flex-1 pr-2">
                <div className="font-medium truncate">
                  {opt.label}
                </div>
                {opt.sublabel && (
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                    {opt.sublabel}
                  </div>
                )}
              </div>
              {String(value) === String(opt.value) && (
                <span className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0 shadow-[0_0_8px_rgba(159,232,112,0.5)]" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="text-xs font-medium text-slate-500 block mb-2">
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openDropdown())}
        className={`glass-select__trigger w-full text-left ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className={selectedLabel ? "text-slate-900 dark:text-white" : "text-slate-400"}>
          {selectedLabel || placeholder}
        </span>
        <IoChevronDown
          className={`ml-auto h-4 w-4 text-slate-400 transition-transform flex-shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown rendered via portal to escape parent stacking contexts */}
      {createPortal(dropdownContent, document.body)}
    </div>
  );
}
