import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { useToast } from "../hooks/useToast";
import "./Navbar.css";

export default function Navbar() {
  const { totalItems } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { isAuthenticated, logout, user } = useAuthContext();
  const { showToast } = useToast();

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
          <Link to="/wishlist" className="navbar__link navbar__cart-link">
            Wishlist
            {wishlistCount > 0 && (
              <span className="navbar__badge" aria-label={`${wishlistCount} items in wishlist`}>
                {wishlistCount}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <>
              {user?.role === "admin" && (
                <Link to="/admin" className="navbar__link">
                  Admin
                </Link>
              )}
              <Link to="/orders" className="navbar__link">
                Orders
              </Link>
              <Link to="/profile" className="navbar__link">
                {user?.fullName ?? "Profile"}
              </Link>
              <button
                type="button"
                className="navbar__link navbar__link--button"
                onClick={() => {
                  logout();
                  showToast("You have been logged out.", "info");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__link">
                Login
              </Link>
              <Link to="/register" className="navbar__link navbar__link--primary">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
