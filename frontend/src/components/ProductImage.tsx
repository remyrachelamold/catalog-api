import { useState } from "react";
import "./ProductImage.css";

interface ProductImageProps {
  name: string;
  imageUrl?: string;
  className?: string;
  variant?: "card" | "detail" | "cart";
}

export default function ProductImage({
  name,
  imageUrl,
  className = "",
  variant = "card",
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const showFallback = !imageUrl || hasError;

  return (
    <div className={`product-image product-image--${variant} ${className}`.trim()}>
      {showFallback ? (
        <div className="product-image__fallback" aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </div>
      ) : (
        <img
          src={imageUrl}
          alt={name}
          className="product-image__img"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
