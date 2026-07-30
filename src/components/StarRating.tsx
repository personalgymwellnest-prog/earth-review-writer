"use client";

type StarRatingProps = {
  value: number;
  onChange: (next: number) => void;
};

export function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star}つ星`}
          onClick={() => onChange(star)}
          className="text-3xl leading-none transition"
          style={{ color: star <= value ? "var(--color-accent)" : "var(--color-line)" }}
        >
          ★
        </button>
      ))}
    </div>
  );
}
