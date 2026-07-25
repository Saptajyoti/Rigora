import { Link } from 'react-router-dom';
export default function EmptyState({ title, text }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-zinc-400">{text}</p>
      <Link to="/products" className="mt-5 inline-block text-cyan-300">
        Browse products
      </Link>
    </div>
  );
}
