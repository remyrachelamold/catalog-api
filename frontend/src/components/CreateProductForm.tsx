import { type FormEvent, useState } from "react";
import { createProduct, getErrorMessage } from "../services/api";
import { EMPTY_PRODUCT_FORM, type ProductFormValues } from "../types/Product";
import { parseProductForm } from "../utils/productForm";
import AlertMessage from "./AlertMessage";
import ProductFormFields from "./ProductFormFields";
import "./CreateProductForm.css";

interface CreateProductFormProps {
  onProductCreated: () => Promise<void>;
  onSuccess: (message: string) => void;
}

export default function CreateProductForm({
  onProductCreated,
  onSuccess,
}: CreateProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(EMPTY_PRODUCT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(field: keyof ProductFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = parseProductForm(values);
    if (!parsed.data) {
      setError(parsed.error);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createProduct(parsed.data);
      setValues(EMPTY_PRODUCT_FORM);
      await onProductCreated();
      onSuccess("Product created successfully.");
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Failed to create product."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="create-product-form">
      <div className="create-product-form__header">
        <h2>Add New Product</h2>
        <p>Create a catalog item using the API.</p>
      </div>

      {error && (
        <AlertMessage type="error" message={error} onDismiss={() => setError(null)} />
      )}

      <form className="create-product-form__form" onSubmit={handleSubmit}>
        <ProductFormFields
          values={values}
          onChange={handleChange}
          disabled={loading}
          idPrefix="create-product"
        />

        <button type="submit" className="create-product-form__submit" disabled={loading}>
          {loading ? "Creating..." : "Create Product"}
        </button>
      </form>
    </section>
  );
}
