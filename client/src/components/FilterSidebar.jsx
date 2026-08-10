export default function FilterSidebar({ categories, brands, filters, onChange }) {
  const select = (event) =>
    onChange({ ...filters, [event.target.name]: event.target.value, page: 1 });
  return (
    <aside className="rigora-glass space-y-5 rounded-xl p-5">
      <div>
        <label className="mb-2 block text-sm font-medium">Category</label>
        <select
          name="category"
          value={filters.category}
          onChange={select}
          className="rigora-control w-full border border-white/10 bg-zinc-900 p-2.5 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Brand</label>
        <select
          name="brand"
          value={filters.brand}
          onChange={select}
          className="rigora-control w-full border border-white/10 bg-zinc-900 p-2.5 text-sm"
        >
          <option value="">All brands</option>
          {brands.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Sort by</label>
        <select
          name="sort"
          value={filters.sort}
          onChange={select}
          className="rigora-control w-full border border-white/10 bg-zinc-900 p-2.5 text-sm"
        >
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name">Name</option>
        </select>
      </div>
      <button
        onClick={() =>
          onChange({ category: '', brand: '', sort: 'newest', search: '', page: 1 })
        }
        className="text-sm text-cyan-300 hover:text-cyan-200"
      >
        Clear filters
      </button>
    </aside>
  );
}
