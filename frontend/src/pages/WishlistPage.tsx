import { useMemo } from "react";
import { Link } from "react-router-dom";
import ProductImage from "../components/ProductImage";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import type { Product } from "../types/Product";
import { formatPrice } from "../utils/formatPrice";
import "./WishlistPage.css";

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const hasItems = items.length > 0;

  const handleMoveToCart = async (product: Product) => {
    await addToCart(product);
    await removeFromWishlist(product._id);
  };

  const totalValue = useMemo(
    () => items.reduce((sum, product) => sum + product.price, 0),
    [items]
  );

  return (
    <main className="wishlist-page">
      <section className="wishlist-page__header">
        <div>
          <p className="wishlist-page__eyebrow">Wishlist</p>
          <h1>Saved items</h1>
          <p className="wishlist-page__subtitle">
            Your wishlist is saved locally and synced when you&apos;re logged in.
          </p>
        </div>
        <div className="wishlist-page__summary">
          <span>{items.length} item{items.length === 1 ? "" : "s"}</span>
          <strong>{formatPrice(totalValue)}</strong>
        </div>
      </section>

      {!hasItems ? (
        <section className="wishlist-page__empty">
          <h2>Your wishlist is empty</h2>
          <p>Add a few items to your wishlist by clicking the heart icon on a product card or product details page.</p>
          <Link to="/" className="wishlist-page__button">
            Continue shopping
          </Link>
        </section>
      ) : (
        <section className="wishlist-page__grid">
          {items.map((product) => (
            <article key={product._id} className="wishlist-product-card">
              <div className="wishlist-product-card__media">
                <ProductImage
                  name={product.name}
                  imageUrl={product.imageUrl}
                  variant="card"
                />
              </div>

              <div className="wishlist-product-card__content">
                <p className="wishlist-product-card__category">{product.category}</p>
                <h2>{product.name}</h2>
                <p className="wishlist-product-card__price">{formatPrice(product.price)}</p>
                <div className="wishlist-product-card__actions">
                  <button
                    type="button"
                    className="wishlist-product-card__button wishlist-product-card__button--cart"
                    onClick={() => handleMoveToCart(product)}
                  >
                    Move to Cart
                  </button>
                  <button
                    type="button"
                    className="wishlist-product-card__button wishlist-product-card__button--remove"
                    onClick={() => removeFromWishlist(product._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
