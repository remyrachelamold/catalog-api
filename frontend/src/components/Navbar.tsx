import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import "./Navbar.css";

export default function Navbar() {
  const { totalItems } = useCart();

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <span className="navbar__logo" aria-hidden="true">
            C
          </span>
          <span className="navbar__title">Catalog Store</span>
        </Link>

        <nav className="navbar__links" aria-label="Primary">
          <Link to="/#products" className="navbar__link navbar__link--active">
            Shop
          </Link>
          <Link to="/cart" className="navbar__link navbar__cart-link">
            Cart
            {totalItems > 0 && (
              <span className="navbar__badge" aria-label={`${totalItems} items in cart`}>
                {totalItems}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
