import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import type { Product } from "../types/Product";
import { formatPrice } from "../utils/formatPrice";
import ProductImage from "./ProductImage";
import "./ProductCard.css";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => Promise<void>;
  isDeleting?: boolean;
  showAdminActions?: boolean;
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
  isDeleting = false,
  showAdminActions = true,
}: ProductCardProps) {
  const { addToCart } = useCart();

  async function handleDelete(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!onDelete) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${product.name}" from the catalog?`
    );

    if (!confirmed) {
      return;
    }

    await onDelete(product._id);
  }

  function handleEdit(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    onEdit?.(product);
  }

  function handleAddToCart(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    addToCart(product);
  }

  return (
    <article className="product-card">
      <Link to={`/products/${product._id}`} className="product-card__link">
        <div className="product-card__image">
          <span className="product-card__badge">{product.category}</span>
          <ProductImage
            name={product.name}
            imageUrl={product.imageUrl}
            variant="card"
          />
        </div>

        <div className="product-card__content">
          <p className="product-card__category">{product.category}</p>
          <h3 className="product-card__name">{product.name}</h3>
          <div className="product-card__footer">
            <p className="product-card__price">{formatPrice(product.price)}</p>
          </div>
        </div>
      </Link>

      <div
        className={`product-card__actions ${
          showAdminActions ? "" : "product-card__actions--shop"
        }`.trim()}
      >
        <button
          type="button"
          className="product-card__button product-card__button--cart"
          onClick={handleAddToCart}
          disabled={isDeleting}
        >
          Add to Cart
        </button>
        {showAdminActions && onEdit && onDelete && (
          <>
            <button
              type="button"
              className="product-card__button product-card__button--edit"
              onClick={handleEdit}
              disabled={isDeleting}
            >
              Edit
            </button>
            <button
              type="button"
              className="product-card__button product-card__button--delete"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </>
        )}
      </div>
    </article>
  );
}
