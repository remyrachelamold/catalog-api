import { Link } from "react-router-dom";
import ProductImage from "../components/ProductImage";
import { useCart } from "../hooks/useCart";
import { formatPrice } from "../utils/formatPrice";
import "./CartPage.css";

export default function CartPage() {
  const {
    items,
    subtotal,
    totalItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const estimatedTotal = subtotal;

  if (items.length === 0) {
    return (
      <main className="cart-page">
        <section className="cart-page__empty" role="status">
          <div className="cart-page__empty-icon" aria-hidden="true">
            🛍️
          </div>
          <h1>Your cart is empty.</h1>
          <p>Add a few products to your cart and they will appear here.</p>
          <Link to="/" className="cart-page__primary-action">
            Continue Shopping
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <section className="cart-page__header">
        <div>
          <p className="cart-page__eyebrow">Shopping cart</p>
          <h1>Your cart</h1>
          <p className="cart-page__subtitle">
            {totalItems} item{totalItems === 1 ? "" : "s"} ready for checkout.
          </p>
        </div>
        <button type="button" className="cart-page__secondary-action" onClick={clearCart}>
          Clear cart
        </button>
      </section>

      <div className="cart-page__layout">
        <section className="cart-page__items" aria-label="Cart items">
          {items.map(({ product, quantity }) => (
            <article key={product._id} className="cart-page__item">
              <div className="cart-page__item-media">
                <ProductImage name={product.name} imageUrl={product.imageUrl} variant="cart" />
              </div>

              <div className="cart-page__item-details">
                <div className="cart-page__item-info">
                  <div>
                    <p className="cart-page__item-category">{product.category}</p>
                    <h2>{product.name}</h2>
                  </div>
                  <p className="cart-page__item-price">{formatPrice(product.price)}</p>
                </div>

                <div className="cart-page__controls">
                  <div className="cart-page__quantity-control" aria-label={`Quantity for ${product.name}`}>
                    <button
                      type="button"
                      className="cart-page__quantity-button"
                      onClick={() => updateQuantity(product._id, quantity - 1)}
                      aria-label={`Decrease quantity of ${product.name}`}
                    >
                      −
                    </button>
                    <input
                      className="cart-page__quantity-input"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(event) => {
                        const nextValue = Number(event.target.value);
                        if (Number.isFinite(nextValue) && nextValue > 0) {
                          updateQuantity(product._id, nextValue);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="cart-page__quantity-button"
                      onClick={() => addToCart(product)}
                      aria-label={`Increase quantity of ${product.name}`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="cart-page__remove"
                    onClick={() => removeFromCart(product._id)}
                  >
                    Remove
                  </button>
                </div>

                <div className="cart-page__item-total">
                  <span>Total</span>
                  <strong>{formatPrice(product.price * quantity)}</strong>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="cart-page__summary" aria-label="Cart summary">
          <h2>Order summary</h2>
          <div className="cart-page__summary-row">
            <span>Total products</span>
            <strong>{items.length}</strong>
          </div>
          <div className="cart-page__summary-row">
            <span>Total quantity</span>
            <strong>{totalItems}</strong>
          </div>
          <div className="cart-page__summary-row">
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <div className="cart-page__summary-row cart-page__summary-row--highlight">
            <span>Estimated total</span>
            <strong>{formatPrice(estimatedTotal)}</strong>
          </div>

          <Link to="/checkout" className="cart-page__checkout-button">
            Proceed to Checkout
          </Link>
        </aside>
      </div>
    </main>
  );
}
