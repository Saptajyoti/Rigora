export default function QuantitySelector({ value, onChange, max = 99 }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-white/10">
      <button
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="px-3 py-2"
      >
        −
      </button>
      <span className="min-w-8 text-center text-sm">{value}</span>
      <button
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="px-3 py-2"
      >
        +
      </button>
    </div>
  );
}
