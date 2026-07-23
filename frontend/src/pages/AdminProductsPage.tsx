import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import EditProductModal from "../components/EditProductModal";
import ProductGrid from "../components/ProductGrid";
import ProductToolbar from "../components/ProductToolbar";
import { createProduct, deleteProduct, fetchProducts, getErrorMessage } from "../services/api";
import type { Product } from "../types/Product";
import { ALL_CATEGORIES, type SortOption } from "../types/filters";
import { filterAndSortProducts, getUniqueCategories } from "../utils/productFilters";
import { parseProductForm } from "../utils/productForm";
import { useDebounce } from "../hooks/useDebounce";
import "./AdminPages.css";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
  const [sortOption, setSortOption] = useState<SortOption>("price-asc");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const categories = useMemo(() => getUniqueCategories(products), [products]);
  const filteredProducts = useMemo(
    () => filterAndSortProducts(products, debouncedSearch, categoryFilter, sortOption),
    [products, debouncedSearch, categoryFilter, sortOption]
  );

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await fetchProducts();
        if (isMounted) {
          setProducts(data);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load products.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      price: Number(formData.get("price") ?? 0),
      category: String(formData.get("category") ?? ""),
      imageUrl: String(formData.get("imageUrl") ?? ""),
      description: String(formData.get("description") ?? ""),
      stock: Number(formData.get("stock") ?? 10),
    };
    const parsed = parseProductForm({
      name: payload.name,
      price: String(payload.price),
      category: payload.category,
      imageUrl: payload.imageUrl,
      description: payload.description,
      stock: String(payload.stock),
    });
    if (!parsed.data) {
      setError(parsed.error);
      return;
    }
    try {
      await createProduct(parsed.data);
      setSuccessMessage("Product created successfully.");
      const refreshed = await fetchProducts();
      setProducts(refreshed);
      form.reset();
      setError(null);
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Failed to create product."));
    }
  }

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      await deleteProduct(id);
      setProducts((current) => current.filter((product) => product._id !== id));
      setSuccessMessage("Product deleted successfully.");
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Failed to delete product."));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleProductUpdated(product: Product) {
    setProducts((current) => current.map((item) => (item._id === product._id ? product : item)));
  }

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <p className="admin-eyebrow">Admin products</p>
          <h1>Inventory management</h1>
          <p className="admin-subtitle">Add, edit, and remove products from the catalog.</p>
        </div>
        <Link to="/admin" className="admin-link">Back to dashboard</Link>
      </section>

      <section className="admin-card admin-card--wide">
        <h2>Add product</h2>
        <form className="admin-form" onSubmit={handleCreateProduct}>
          <input name="name" placeholder="Product name" required />
          <input name="price" type="number" step="0.01" placeholder="Price" required />
          <input name="category" placeholder="Category" required />
          <input name="stock" type="number" min="0" placeholder="Stock" defaultValue="10" />
          <input name="imageUrl" placeholder="Image URL" />
          <textarea name="description" placeholder="Description" />
          <button type="submit">Create product</button>
        </form>
        {error && <p className="admin-error">{error}</p>}
        {successMessage && <p className="admin-success">{successMessage}</p>}
      </section>

      <section className="admin-card admin-card--wide">
        <h2>Manage products</h2>
        <ProductToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          category={categoryFilter}
          onCategoryChange={setCategoryFilter}
          sortOption={sortOption}
          onSortChange={setSortOption}
          categories={categories}
        />
        {loading ? <p>Loading products…</p> : <ProductGrid products={filteredProducts} onEdit={setEditingProduct} onDelete={handleDelete} deletingId={deletingId} showAdminActions />}
      </section>

      <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onProductUpdated={handleProductUpdated} onSuccess={setSuccessMessage} />
    </main>
  );
}
