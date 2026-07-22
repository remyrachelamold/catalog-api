import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductGrid from "../components/ProductGrid";
import ProductImage from "../components/ProductImage";
import { useCart } from "../hooks/useCart";
import { fetchProductById, fetchProducts, getErrorMessage } from "../services/api";
import type { Product } from "../types/Product";
import { formatPrice } from "../utils/formatPrice";
import { getRelatedProducts } from "../utils/productFilters";
import "./ProductDetails.css";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      if (!id) {
        if (isMounted) {
          setLoading(false);
          setIsNotFound(true);
          setError("Product not found.");
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setIsNotFound(false);

        const [productData, productsData] = await Promise.all([
          fetchProductById(id),
          fetchProducts(),
        ]);

        if (!isMounted) {
          return;
        }

        setProduct(productData);
        setRelatedProducts(getRelatedProducts(productsData, productData));
      } catch (err) {
        if (!isMounted) {
          return;
        }

        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setIsNotFound(true);
          setError("Product not found.");
        } else {
          setError(getErrorMessage(err, "Unable to load product details."));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="product-details product-details--loading">
        <LoadingSpinner />
      </main>
    );
  }

  if (isNotFound || !product) {
    return (
      <main className="product-details">
        <section className="product-details__not-found" role="alert">
          <p className="product-details__eyebrow">Product details</p>
          <h1>Product not found</h1>
          <p>The requested product could not be found. Please return to the catalog and try again.</p>
          <Link to="/" className="product-details__back">
            Back to Products
          </Link>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className="product-details">
        <section className="product-details__error" role="alert">
          <p className="product-details__eyebrow">Product details</p>
          <h1>Unable to load product</h1>
          <p>{error}</p>
          <Link to="/" className="product-details__back">
            Back to Products
          </Link>
        </section>
      </main>
    );
  }

  const description = product.description?.trim() || "No description available.";

  return (
    <main className="product-details">
      <section className="product-details__header">
        <Link to="/" className="product-details__back">
          ← Back to Products
        </Link>
      </section>

      <section className="product-details__content">
        <div className="product-details__media">
          <ProductImage
            name={product.name}
            imageUrl={product.imageUrl}
            variant="detail"
            className="product-details__image"
          />
        </div>

        <div className="product-details__info">
          <p className="product-details__eyebrow">{product.category}</p>
          <h1 className="product-details__title">{product.name}</h1>
          <p className="product-details__price">{formatPrice(product.price)}</p>
          <p className="product-details__description">{description}</p>
          <div className="product-details__meta">
            <span className="product-details__meta-item">
              <strong>Category:</strong> {product.category}
            </span>
            <span className="product-details__meta-item">
              <strong>ID:</strong> {product._id}
            </span>
          </div>
          <button
            type="button"
            className="product-details__add-to-cart"
            onClick={() => addToCart(product)}
          >
            Add to Cart
          </button>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="product-details__related">
          <div className="product-details__related-header">
            <h2>Related products</h2>
            <p>More items in the same category.</p>
          </div>
          <ProductGrid products={relatedProducts} showAdminActions={false} />
        </section>
      )}
    </main>
  );
}
