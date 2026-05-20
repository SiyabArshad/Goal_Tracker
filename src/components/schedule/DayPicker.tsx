"use client";

import { DAYS_OF_WEEK } from "@/lib/utils/time";

interface DayPickerProps {
  value: number;
  onChange: (dayOfWeek: number) => void;
}

export function DayPicker({ value, onChange }: DayPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Day</span>
      <div className="flex flex-wrap gap-2">
        {DAYS_OF_WEEK.map((day, index) => (
          <button
            key={day}
            type="button"
            onClick={() => onChange(index)}
            aria-pressed={value === index}
            className={`min-w-[3rem] rounded-lg px-3 py-2 text-sm font-medium transition ${
              value === index
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>
    </div>
  );
}
