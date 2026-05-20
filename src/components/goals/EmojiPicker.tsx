"use client";

const GOAL_EMOJIS = [
  "🎯", "📚", "💪", "🏃", "🧘", "💻", "🎨", "🎵", "✍️", "🧠",
  "🌱", "💰", "🍎", "😴", "🗣️", "🚀", "⭐", "🔥", "🏆", "❤️",
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Goal emoji
      </span>
      <div className="flex flex-wrap gap-2">
        {GOAL_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl transition ${
              value === emoji
                ? "bg-indigo-100 ring-2 ring-indigo-500 dark:bg-indigo-900"
                : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
