import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, onSubmit }) {
  return (
    <form
      onSubmit={onSubmit}
      className="rigora-control flex overflow-hidden border border-white/10 bg-[hsl(var(--rigora-surface))] focus-within:border-cyan-300/50"
    >
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Search products"
        placeholder="Search hardware"
        className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-zinc-500"
      />
      <button aria-label="Search" className="px-4 text-cyan-300">
        <Search size={18} />
      </button>
    </form>
  );
}
