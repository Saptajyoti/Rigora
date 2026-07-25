import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import SiteHeader from '../components/SiteHeader';
import { api } from '../lib/api';
import { money } from '../lib/catalog';

function ResourcePanel({ title, endpoint, resources, refresh, fields }) {
  const { register, handleSubmit, reset } = useForm();
  const [error, setError] = useState('');
  const submit = async (values) => {
    try {
      await api.post(endpoint, values);
      reset();
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || `Unable to save ${title.toLowerCase()}.`);
    }
  };
  const remove = async (id) => {
    if (!window.confirm(`Delete this ${title.slice(0, -1).toLowerCase()}?`)) return;
    try {
      await api.delete(`${endpoint}/${id}`);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete item.');
    }
  };
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <form onSubmit={handleSubmit(submit)} className="mt-4 flex flex-wrap gap-3">
        {fields.map((field) => (
          <input
            key={field.name}
            {...register(field.name, { required: field.required })}
            placeholder={field.label}
            type={field.type || 'text'}
            className="min-w-32 flex-1 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm"
          />
        ))}
        <button className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-zinc-950">
          Add
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      <ul className="mt-5 divide-y divide-white/10">
        {resources.map((item) => (
          <li
            key={item._id}
            className="flex items-center justify-between gap-3 py-3 text-sm"
          >
            <span>{item.name}</span>
            <button onClick={() => remove(item._id)} className="text-rose-300">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function AdminDashboard() {
  const [state, setState] = useState({
    products: [],
    categories: [],
    brands: [],
    loading: true,
  });
  const [message, setMessage] = useState('');
  const product = useForm();
  const refresh = () =>
    Promise.all([
      api.get('/products', { params: { limit: 100 } }),
      api.get('/categories'),
      api.get('/brands'),
    ]).then(([products, categories, brands]) =>
      setState({
        products: products.data.products,
        categories: categories.data.items,
        brands: brands.data.items,
        loading: false,
      }),
    );
  useEffect(() => {
    refresh().catch(() => setState((current) => ({ ...current, loading: false })));
  }, []);
  const addProduct = async (values) => {
    setMessage('');
    const form = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'images')
        Array.from(value).forEach((file) => form.append('images', file));
      else if (value !== '') form.append(key, value);
    });
    try {
      await api.post('/products', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      product.reset();
      setMessage('Product created.');
      refresh();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to create product.');
    }
  };
  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    refresh();
  };
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10">
        <p className="text-xs uppercase tracking-[.25em] text-cyan-300">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold">Catalog management</h1>
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[.035] p-5">
          <h2 className="text-lg font-semibold">Add product</h2>
          <form
            className="mt-5 grid gap-3 md:grid-cols-2"
            onSubmit={product.handleSubmit(addProduct)}
          >
            <input
              {...product.register('name', { required: true })}
              placeholder="Product name"
              className="input"
            />
            <input
              {...product.register('sku', { required: true })}
              placeholder="SKU"
              className="input"
            />
            <textarea
              {...product.register('description', { required: true })}
              placeholder="Description"
              className="input md:col-span-2"
            />
            <select
              {...product.register('category', { required: true })}
              className="input"
            >
              <option value="">Category</option>
              {state.categories.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
            <select {...product.register('brand', { required: true })} className="input">
              <option value="">Brand</option>
              {state.brands.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
            <input
              {...product.register('price', { required: true })}
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              className="input"
            />
            <input
              {...product.register('stock', { required: true })}
              type="number"
              min="0"
              placeholder="Stock"
              className="input"
            />
            <input
              {...product.register('images')}
              type="file"
              accept="image/*"
              multiple
              className="input md:col-span-2"
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...product.register('featured')} /> Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...product.register('newArrival')} /> New arrival
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...product.register('bestSeller')} /> Best seller
            </label>
            <button className="rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-zinc-950">
              Create product
            </button>
          </form>
          {message && <p className="mt-3 text-sm text-cyan-300">{message}</p>}
        </section>
        <div className="mt-7 grid gap-7 lg:grid-cols-2">
          <ResourcePanel
            title="Categories"
            endpoint="/categories"
            resources={state.categories}
            refresh={refresh}
            fields={[
              { name: 'name', label: 'Category name', required: true },
              { name: 'description', label: 'Description' },
            ]}
          />
          <ResourcePanel
            title="Brands"
            endpoint="/brands"
            resources={state.brands}
            refresh={refresh}
            fields={[
              { name: 'name', label: 'Brand name', required: true },
              { name: 'website', label: 'Website URL', type: 'url' },
            ]}
          />
        </div>
        <section className="mt-7 rounded-2xl border border-white/10 bg-white/[.035] p-5">
          <h2 className="text-lg font-semibold">Products</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-zinc-500">
                <tr>
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Stock</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {state.products.map((item) => (
                  <tr key={item._id} className="border-t border-white/10">
                    <td className="py-3">{item.name}</td>
                    <td>{money(item.price)}</td>
                    <td>{item.stock}</td>
                    <td className="text-right">
                      <button
                        onClick={() => deleteProduct(item._id)}
                        className="text-rose-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!state.loading && !state.products.length && (
            <p className="pt-4 text-sm text-zinc-500">No products yet.</p>
          )}
        </section>
      </main>
    </>
  );
}
