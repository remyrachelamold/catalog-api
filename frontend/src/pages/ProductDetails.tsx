import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductGrid from "../components/ProductGrid";
import ProductImage from "../components/ProductImage";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { useAuthContext } from "../context/AuthContext";
import {
  fetchProductById,
  fetchProducts,
  fetchReviews,
  createReview,
  getErrorMessage,
} from "../services/api";
import type { Product } from "../types/Product";
import type { Review } from "../types/review";
import { formatPrice } from "../utils/formatPrice";
import { getRelatedProducts } from "../utils/productFilters";
import "./ProductDetails.css";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuthContext();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
  const starRating = useMemo(() => Array.from({ length: 5 }, (_, index) => index + 1), []);

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

        const [productData, productsData, reviewsData] = await Promise.all([
          fetchProductById(id),
          fetchProducts(),
          fetchReviews(id),
        ]);

        if (!isMounted) {
          return;
        }

        setProduct(productData);
        setRelatedProducts(getRelatedProducts(productsData, productData));
        setReviews(reviewsData.reviews);
        setAverageRating(reviewsData.averageRating);
        setTotalReviews(reviewsData.totalReviews);
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
  const isFavorite = isInWishlist(product._id);

  async function handleSubmitReview(event: React.FormEvent) {
    event.preventDefault();
    if (!id) {
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(null);

    try {
      await createReview(id, rating, comment.trim());
      const reviewsData = await fetchReviews(id);
      setReviews(reviewsData.reviews);
      setAverageRating(reviewsData.averageRating);
      setTotalReviews(reviewsData.totalReviews);
      setComment("");
      setReviewSuccess("Review submitted successfully.");
    } catch (err) {
      setReviewError(getErrorMessage(err, "Unable to submit review."));
    } finally {
      setSubmittingReview(false);
    }
  }

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
            <span className="product-details__product-rating">
              {averageRating.toFixed(1)} ★ ({totalReviews} review{totalReviews === 1 ? "" : "s"})
            </span>
            <span className="product-details__meta-item">
              <strong>Category:</strong> {product.category}
            </span>
            <span className="product-details__meta-item">
              <strong>ID:</strong> {product._id}
            </span>
          </div>
          <div className="product-details__actions">
            <button
              type="button"
              className="product-details__add-to-cart"
              onClick={() => addToCart(product)}
            >
              Add to Cart
            </button>
            <button
              type="button"
              className={`product-details__wishlist-button ${isFavorite ? "product-details__wishlist-button--active" : ""}`.trim()}
              onClick={() => toggleWishlist(product)}
            >
              {isFavorite ? "Remove from Wishlist" : "Save to Wishlist"}
            </button>
          </div>
        </div>
      </section>

      <section className="product-details__reviews">
        <div className="product-details__reviews-header">
          <h2>Reviews</h2>
          <p>Share your experience and read what other customers say.</p>
        </div>

        {isAuthenticated ? (
          <form className="product-details__review-form" onSubmit={handleSubmitReview}>
            <div className="product-details__review-row">
              <label htmlFor="rating">Rating</label>
              <select
                id="rating"
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
              >
                {starRating.map((star) => (
                  <option key={star} value={star}>
                    {star} star{star === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </div>

            <div className="product-details__review-row">
              <label htmlFor="comment">Comment</label>
              <textarea
                id="comment"
                value={comment}
                rows={4}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Write a helpful review for other shoppers."
              />
            </div>

            {reviewError && <p className="product-details__review-error">{reviewError}</p>}
            {reviewSuccess && <p className="product-details__review-success">{reviewSuccess}</p>}

            <button
              type="submit"
              className="product-details__review-submit"
              disabled={submittingReview}
            >
              {submittingReview ? "Submitting…" : "Submit Review"}
            </button>
          </form>
        ) : (
          <div className="product-details__review-login">
            <p>You must be logged in to leave a review.</p>
            <Link to="/login" className="product-details__review-login-link">
              Login to review
            </Link>
          </div>
        )}

        <div className="product-details__review-list">
          {reviews.length === 0 ? (
            <div className="product-details__review-empty">
              <p>No reviews yet. Be the first to share your experience.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <article key={review._id} className="product-details__review-card">
                <div className="product-details__review-card-header">
                  <strong>{review.user.fullName}</strong>
                  <span>{review.rating} ★</span>
                </div>
                <p>{review.comment}</p>
                <time dateTime={review.createdAt}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </time>
              </article>
            ))
          )}
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
