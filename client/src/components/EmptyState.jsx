import { Link } from 'react-router-dom';
export default function EmptyState({ title, text }) {
  return (
    <div className="rigora-grid overflow-hidden rounded-2xl border border-dashed border-white/15 p-8 text-center sm:p-12">
      <img
        src="/rigora-empty-state.png"
        alt="Open equipment case with PC hardware"
        className="relative z-10 mx-auto h-36 w-36 rounded-2xl object-cover shadow-2xl shadow-black/30 sm:h-44 sm:w-44"
      />
      <p className="relative z-10 mt-6 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
        Rigora inventory
      </p>
      <h2 className="relative z-10 mt-2 text-xl font-semibold">{title}</h2>
      <p className="relative z-10 mt-2 text-zinc-400">{text}</p>
      <Link to="/products" className="relative z-10 mt-5 inline-block text-cyan-300">
        Browse products
      </Link>
    </div>
  );
}
