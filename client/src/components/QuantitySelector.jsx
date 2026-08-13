export default function QuantitySelector({ value, onChange, max = 99 }) {
  return (
    <div className="rigora-control inline-flex items-center border border-white/10">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="rigora-quantity-action px-3 py-2"
      >
        −
      </button>
      <span className="min-w-8 text-center text-sm">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="rigora-quantity-action px-3 py-2"
      >
        +
      </button>
    </div>
  );
}
