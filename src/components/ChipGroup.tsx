"use client";

type ChipGroupProps = {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  mode?: "single" | "multi";
};

export function ChipGroup({ options, selected, onChange, mode = "multi" }: ChipGroupProps) {
  function toggle(option: string) {
    if (mode === "single") {
      onChange([option]);
      return;
    }
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            aria-pressed={active}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              active
                ? "border-accent bg-accent text-paper"
                : "border-line bg-paper-alt text-ink-soft hover:border-accent-soft hover:text-ink"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
