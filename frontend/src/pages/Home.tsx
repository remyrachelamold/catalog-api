import { useCallback, useEffect, useMemo, useState } from "react";
import AlertMessage from "../components/AlertMessage";
import CreateProductForm from "../components/CreateProductForm";
import EditProductModal from "../components/EditProductModal";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductGrid from "../components/ProductGrid";
import ProductToolbar from "../components/ProductToolbar";
import { useDebounce } from "../hooks/useDebounce";
import {
  deleteProduct,
  fetchProducts,
  getErrorMessage,
} from "../services/api";
import type { Product } from "../types/Product";
import { ALL_CATEGORIES, type SortOption } from "../types/filters";
import {
  filterAndSortProducts,
  getUniqueCategories,
} from "../utils/productFilters";
import "./Home.css";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES);
  const [sortOption, setSortOption] = useState<SortOption>("price-asc");

  const debouncedSearch = useDebounce(searchQuery, 300);

  const categories = useMemo(
    () => getUniqueCategories(products),
    [products]
  );

  const filteredProducts = useMemo(
    () =>
      filterAndSortProducts(
        products,
        debouncedSearch,
        categoryFilter,
        sortOption
      ),
    [products, debouncedSearch, categoryFilter, sortOption]
  );

  const loadProducts = useCallback(async () => {
    const data = await fetchProducts();
    setProducts(data);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initializeProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProducts();
        if (isMounted) {
          setProducts(data);
        }
      } catch {
        if (isMounted) {
          setError("Unable to load products. Please make sure the API is running.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [successMessage]);

  async function handleProductCreated() {
    await loadProducts();
  }

  function handleSuccess(message: string) {
    setSuccessMessage(message);
    setActionError(null);
  }

  function handleProductUpdated(updatedProduct: Product) {
    setProducts((current) =>
      current.map((product) =>
        product._id === updatedProduct._id ? updatedProduct : product
      )
    );
  }

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      setActionError(null);
      await deleteProduct(id);
      setProducts((current) => current.filter((product) => product._id !== id));
      handleSuccess("Product deleted successfully.");
    } catch (deleteError) {
      setActionError(getErrorMessage(deleteError, "Failed to delete product."));
    } finally {
      setDeletingId(null);
    }
  }

  const hasProducts = products.length > 0;
  const hasFilteredResults = filteredProducts.length > 0;

  return (
    <main className="home">
      <section className="home__hero">
        <div className="home__hero-content">
          <p className="home__eyebrow">New season collection</p>
          <h1 className="home__title">Discover products you&apos;ll love</h1>
          <p className="home__subtitle">
            Browse, create, edit, and manage your catalog in one place.
          </p>
        </div>
      </section>

      <section id="products" className="home__products">
        {successMessage && (
          <AlertMessage
            type="success"
            message={successMessage}
            onDismiss={() => setSuccessMessage(null)}
          />
        )}

        {actionError && (
          <AlertMessage
            type="error"
            message={actionError}
            onDismiss={() => setActionError(null)}
          />
        )}

        <CreateProductForm
          onProductCreated={handleProductCreated}
          onSuccess={handleSuccess}
        />

        <div className="home__section-header">
          <div>
            <h2 className="home__section-title">Featured Products</h2>
            <p className="home__section-text">
              Handpicked items from your live catalog API.
            </p>
          </div>
          {!loading && !error && hasProducts && (
            <span className="home__count">
              {filteredProducts.length} of {products.length} items
            </span>
          )}
        </div>

        {!loading && !error && hasProducts && (
          <ProductToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            category={categoryFilter}
            onCategoryChange={setCategoryFilter}
            sortOption={sortOption}
            onSortChange={setSortOption}
            categories={categories}
          />
        )}

        {loading && <LoadingSpinner />}

        {!loading && error && (
          <div className="home__state home__state--error" role="alert">
            <h3>Something went wrong</h3>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && !hasProducts && (
          <div className="home__state home__state--empty">
            <h3>No products found</h3>
            <p>Use the form above to add your first product.</p>
          </div>
        )}

        {!loading && !error && hasProducts && !hasFilteredResults && (
          <div className="home__state home__state--empty">
            <h3>No matching products found</h3>
            <p>Try adjusting your search or category filter.</p>
          </div>
        )}

        {!loading && !error && hasFilteredResults && (
          <ProductGrid
            products={filteredProducts}
            onEdit={setEditingProduct}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}
      </section>

      <EditProductModal
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onProductUpdated={handleProductUpdated}
        onSuccess={handleSuccess}
      />
    </main>
  );
}
