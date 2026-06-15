"use client";

import { useLocale } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type LangSwitcherProps = {
  className?: string;
  landing?: boolean;
};

const LOCALES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "pl", label: "Polski" },
  { code: "uk", label: "Українська" },
];

export const LangSwitcher = ({ className, landing }: LangSwitcherProps) => {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  const handleSelect = (code: string) => {
    setOpen(false);
    if (code !== locale) {
      router.push(pathname, { locale: code });
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Decide whether dropdown should open upwards based on available space
  useEffect(() => {
    if (!open || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedDropdownHeight = LOCALES.length * 44 + 8; // item height + padding
    // open upwards when there's not enough space below but enough above
    setOpenUp(spaceBelow < estimatedDropdownHeight && spaceAbove > spaceBelow);
  }, [open]);

  return (
    <div
      ref={ref}
      className={cn(
        landing ? "relative flex-shrink-0" : "relative mb-4 w-full",
        className,
      )}
    >
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        className={cn(
          "flex items-center justify-between text-sm transition focus:outline-none",
          landing
            ? "rounded-full border border-white/15 bg-white/5 px-4 py-2 text-white hover:border-white/25 hover:bg-white/10"
            : "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-700 shadow-sm hover:border-gray-300 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500",
        )}
      >
        <span className="flex items-center gap-2">
          <span className={cn("font-medium", landing ? "text-white" : "")}>
            {current.label}
          </span>
          <span className={cn(landing ? "text-gray-300" : "text-gray-400")}>
            ({current.code.toUpperCase()})
          </span>
        </span>
        {/* Chevron */}
        <svg
          className={cn(
            "ml-2 h-4 w-4 transition-transform duration-200",
            landing ? "text-white" : "text-gray-400",
            open && "rotate-180",
          )}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <ul
          role="listbox"
          aria-label="Language options"
          className={cn(
            "absolute z-50 w-full overflow-hidden rounded-xl py-1 shadow-lg",
            // open upwards if calculated, otherwise open below
            openUp ? "bottom-full mb-1.5" : "top-full mt-1.5",
            landing
              ? "border border-white/10 bg-[#0b1121]"
              : "border border-gray-200 bg-white",
          )}
        >
          {LOCALES.map((l) => {
            const isActive = l.code === locale;
            return (
              <li
                key={l.code}
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(l.code)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(l.code);
                  }
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-between px-3 py-2.5 text-sm transition-colors",
                  landing
                    ? isActive
                      ? "bg-white/5 text-white"
                      : "text-white/80 hover:bg-white/5"
                    : isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50",
                )}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-medium",
                      isActive && "font-semibold",
                      landing ? "text-white" : "",
                    )}
                  >
                    {l.label}
                  </span>
                  <span
                    className={cn(
                      landing ? "text-gray-300" : "text-gray-400",
                      isActive && (landing ? "text-white" : "text-blue-400"),
                    )}
                  >
                    ({l.code.toUpperCase()})
                  </span>
                </span>
                {/* Checkmark for active */}
                {isActive && (
                  <svg
                    className={cn(
                      "h-4 w-4",
                      landing ? "text-white" : "text-blue-600",
                    )}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
