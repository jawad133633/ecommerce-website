
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { demoProducts } from './Home';

const initialForm = {
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  category: '',
  stock: '0',
};

export default function ManageProducts() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('Everything');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [addingCatalogId, setAddingCatalogId] = useState('');
  const [catalogValues, setCatalogValues] = useState({});

  const token = localStorage.getItem('token');

  const loadProducts = async () => {
    try {
      const response = await api.get('/products/my-products', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(response.data.products || []);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      setError(err.response?.data?.message || 'Products load nahi ho sake.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    loadProducts();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const response = await api.post('/products', form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts((previous) => [response.data.product, ...previous]);
      setForm(initialForm);
      setMessage('Product successfully add ho gaya.');
    } catch (err) {
      setError(err.response?.data?.message || 'Product add nahi ho saka.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      'Kya aap waqai is product ko delete karna chahte hain?'
    );

    if (!confirmed) return;

    setError('');
    setMessage('');

    try {
      await api.delete(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts((previous) =>
        previous.filter((product) => product._id !== productId)
      );

      setMessage('Product delete ho gaya.');
    } catch (err) {
      setError(err.response?.data?.message || 'Product delete nahi ho saka.');
    }
  };

  const handleAddCatalogProduct = async (catalogProduct) => {
    const values = catalogValues[catalogProduct._id] || { price: catalogProduct.price, stock: '' };
    if (values.stock === '' || Number(values.stock) < 1) { setError('Store mein add karne se pehle stock ki quantity set karein.'); return; }
    setError(''); setMessage(''); setAddingCatalogId(catalogProduct._id);
    try {
      const response = await api.post('/products', {
        name: catalogProduct.name,
        description: '',
        price: Number(values.price),
        imageUrl: catalogProduct.imageUrl,
        category: catalogProduct.category,
        stock: Number(values.stock),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setProducts((previous) => [response.data.product, ...previous]);
      setMessage(`${catalogProduct.name} aapke store mein add ho gaya.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Product aapke store mein add nahi ho saka.');
    } finally { setAddingCatalogId(''); }
  };

  const availableCatalogProducts = demoProducts.filter((product) => {
    const categoryMatch = catalogCategory === 'Everything' || product.category === catalogCategory;
    const searchMatch = `${product.name} ${product.category}`.toLowerCase().includes(catalogSearch.toLowerCase());
    return categoryMatch && searchMatch && !products.some((existing) => existing.name.toLowerCase() === product.name.toLowerCase());
  });

  return (
    <main className="products-page min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Manage Products
            </h1>
            <p className="mt-2 text-gray-600">
              Apne store ke products add aur manage karein.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
          >
            Back to Dashboard
          </Link>
        </div>

        {message && (
          <div className="mb-4 rounded-lg bg-green-100 p-3 text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <section className="mb-10 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div><h2 className="text-xl font-semibold text-gray-900">Choose a product for your store</h2><p className="mt-1 text-sm text-gray-500">Pick any design. It will be copied into your store only.</p></div>
            <input aria-label="Search catalogue products" value={catalogSearch} onChange={(event) => setCatalogSearch(event.target.value)} placeholder="Find a product…" className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black" />
          </div>
          <div className="mb-5 flex flex-wrap gap-2">{['Everything', 'Clothing', 'Accessories', 'Home & living', 'Beauty', 'Lifestyle'].map((item) => <button type="button" key={item} onClick={() => setCatalogCategory(item)} className={`rounded-full border px-4 py-2 text-sm ${catalogCategory === item ? 'border-black bg-black text-white' : 'border-gray-300 bg-white text-gray-700'}`}>{item}</button>)}</div>
          {availableCatalogProducts.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{availableCatalogProducts.map((product) => { const values = catalogValues[product._id] || { price: product.price, stock: '' }; return <article className="overflow-hidden rounded-xl border border-gray-200" key={product._id}><img src={product.imageUrl} alt={product.name} loading="lazy" className="h-44 w-full object-cover" /><div className="p-3"><p className="text-xs text-gray-500">{product.category}</p><h3 className="mt-1 min-h-10 text-sm font-semibold text-gray-900">{product.name}</h3><div className="mt-3 grid grid-cols-2 gap-2"><label className="text-xs text-gray-600">Your price (Rs.)<input type="number" min="0" step="1" value={values.price} onChange={(event) => setCatalogValues((previous) => ({ ...previous, [product._id]: { ...values, price: event.target.value } }))} className="mt-1 w-full rounded-md border px-2 py-2" /></label><label className="text-xs text-gray-600">Stock<input type="number" min="1" step="1" value={values.stock} onChange={(event) => setCatalogValues((previous) => ({ ...previous, [product._id]: { ...values, stock: event.target.value } }))} className="mt-1 w-full rounded-md border px-2 py-2" placeholder="Set quantity" /></label></div><button type="button" disabled={addingCatalogId === product._id} onClick={() => handleAddCatalogProduct(product)} className="mt-3 w-full rounded-lg bg-black px-3 py-2.5 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-60">{addingCatalogId === product._id ? 'Adding…' : 'Add to my store'}</button></div></article>; })}</div> : <p className="rounded-lg bg-gray-50 p-5 text-center text-sm text-gray-600">Is category ke saare products aapke store mein add ho chuke hain.</p>}
        </section>

        <section className="mb-10 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-gray-900">
            Add New Product
          </h2>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Product name"
              required
              maxLength={120}
              className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Category (e.g. Clothing)"
              required
              className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="Price"
              min="0"
              step="0.01"
              required
              className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              placeholder="Available stock"
              min="0"
              step="1"
              required
              className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

            <input
              name="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="Product image URL (optional)"
              className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black sm:col-span-2"
            />

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Product description (optional)"
              maxLength={2000}
              rows={4}
              className="resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black sm:col-span-2"
            />

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
            >
              {saving ? 'Adding Product...' : 'Add Product'}
            </button>
          </form>
        </section>

        <section>
          <h2 className="mb-5 text-xl font-semibold text-gray-900">
            Your Products ({products.length})
          </h2>

          {loading ? (
            <p className="text-gray-600">Products load ho rahe hain...</p>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
              Abhi koi product nahi hai. Pehla product add karein.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product._id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-400">
                      No product image
                    </div>
                  )}

                  <div className="p-5">
                    <p className="text-sm text-gray-500">
                      {product.category}
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-gray-900">
                      {product.name}
                    </h3>

                    <p className="mt-2 font-bold text-gray-900">
                      PKR {Number(product.price).toLocaleString('en-PK')}
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      Stock: {product.stock}
                    </p>

                    {product.description && (
                      <p className="mt-3 line-clamp-3 text-sm text-gray-600">
                        {product.description}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDelete(product._id)}
                      className="mt-5 w-full rounded-lg border border-red-200 px-4 py-2 font-medium text-red-600 hover:bg-red-50"
                    >
                      Delete Product
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
