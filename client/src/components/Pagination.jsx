export default function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.pages < 2) return null;
  return (
    <nav
      aria-label="Product pages"
      className="mt-8 flex items-center justify-center gap-3"
    >
      <button
        disabled={pagination.page === 1}
        onClick={() => onChange(pagination.page - 1)}
        className="rounded-lg border border-white/10 px-3 py-2 text-sm disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-sm text-zinc-400">
        Page {pagination.page} of {pagination.pages}
      </span>
      <button
        disabled={pagination.page === pagination.pages}
        onClick={() => onChange(pagination.page + 1)}
        className="rounded-lg border border-white/10 px-3 py-2 text-sm disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}
