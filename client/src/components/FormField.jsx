export default function FormField({ label, error, ...inputProps }) {
  return (
    <label className="block text-sm font-medium text-zinc-200">
      {label}
      <input
        {...inputProps}
        className="mt-2 block w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-3 text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputProps.name}-error` : undefined}
      />
      {error && (
        <span
          id={`${inputProps.name}-error`}
          className="mt-1.5 block text-xs text-rose-300"
        >
          {error.message}
        </span>
      )}
    </label>
  );
}
