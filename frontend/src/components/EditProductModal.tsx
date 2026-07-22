import { type FormEvent, useEffect, useState } from "react";
import { getErrorMessage, updateProduct } from "../services/api";
import type { Product, ProductFormValues } from "../types/Product";
import { parseProductForm, productToFormValues } from "../utils/productForm";
import AlertMessage from "./AlertMessage";
import ProductFormFields from "./ProductFormFields";
import "./EditProductModal.css";

interface EditProductModalProps {
  product: Product | null;
  onClose: () => void;
  onProductUpdated: (product: Product) => void;
  onSuccess: (message: string) => void;
}

export default function EditProductModal({
  product,
  onClose,
  onProductUpdated,
  onSuccess,
}: EditProductModalProps) {
  const [values, setValues] = useState<ProductFormValues>({
    name: "",
    price: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setValues(productToFormValues(product));
      setError(null);
    }
  }, [product]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    }

    if (product) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [product, loading, onClose]);

  if (!product) {
    return null;
  }

  function handleChange(field: keyof ProductFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!product) {
      return;
    }

    const parsed = parseProductForm(values);
    if (!parsed.data) {
      setError(parsed.error);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await updateProduct(product._id, parsed.data);
      onProductUpdated(response.data);
      onSuccess("Product updated successfully.");
      onClose();
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Failed to update product."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="edit-product-modal" role="presentation" onClick={onClose}>
      <div
        className="edit-product-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-product-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="edit-product-modal__header">
          <div>
            <h2 id="edit-product-title">Edit Product</h2>
            <p>Update product details and save changes.</p>
          </div>
          <button
            type="button"
            className="edit-product-modal__close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close edit product modal"
          >
            ×
          </button>
        </div>

        {error && (
          <AlertMessage type="error" message={error} onDismiss={() => setError(null)} />
        )}

        <form className="edit-product-modal__form" onSubmit={handleSubmit}>
          <ProductFormFields
            values={values}
            onChange={handleChange}
            disabled={loading}
            idPrefix="edit-product"
          />

          <div className="edit-product-modal__actions">
            <button
              type="button"
              className="edit-product-modal__cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="edit-product-modal__submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
