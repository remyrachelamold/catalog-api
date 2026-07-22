import type { Product } from "../types/Product";
import ProductCard from "./ProductCard";
import "./ProductGrid.css";

interface ProductGridProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => Promise<void>;
  deletingId?: string | null;
  showAdminActions?: boolean;
}

export default function ProductGrid({
  products,
  onEdit,
  onDelete,
  deletingId = null,
  showAdminActions = true,
}: ProductGridProps) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={deletingId === product._id}
          showAdminActions={showAdminActions}
        />
      ))}
    </div>
  );
}
