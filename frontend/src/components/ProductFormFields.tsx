import type { ProductFormValues } from "../types/Product";
import "./ProductFormFields.css";

interface ProductFormFieldsProps {
  values: ProductFormValues;
  onChange: (field: keyof ProductFormValues, value: string) => void;
  disabled?: boolean;
  idPrefix?: string;
}

export default function ProductFormFields({
  values,
  onChange,
  disabled = false,
  idPrefix = "product",
}: ProductFormFieldsProps) {
  return (
    <div className="product-form-fields">
      <div className="product-form-fields__group">
        <label htmlFor={`${idPrefix}-name`}>Name</label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          value={values.name}
          onChange={(event) => onChange("name", event.target.value)}
          placeholder="e.g. iPhone 16"
          disabled={disabled}
          required
        />
      </div>

      <div className="product-form-fields__group">
        <label htmlFor={`${idPrefix}-price`}>Price</label>
        <input
          id={`${idPrefix}-price`}
          type="number"
          min="1"
          step="1"
          value={values.price}
          onChange={(event) => onChange("price", event.target.value)}
          placeholder="e.g. 79999"
          disabled={disabled}
          required
        />
      </div>

      <div className="product-form-fields__group">
        <label htmlFor={`${idPrefix}-category`}>Category</label>
        <input
          id={`${idPrefix}-category`}
          type="text"
          value={values.category}
          onChange={(event) => onChange("category", event.target.value)}
          placeholder="e.g. Electronics"
          disabled={disabled}
          required
        />
      </div>

      <div className="product-form-fields__group">
        <label htmlFor={`${idPrefix}-imageUrl`}>Image URL</label>
        <input
          id={`${idPrefix}-imageUrl`}
          type="url"
          value={values.imageUrl}
          onChange={(event) => onChange("imageUrl", event.target.value)}
          placeholder="https://example.com/image.jpg"
          disabled={disabled}
        />
      </div>

      <div className="product-form-fields__group product-form-fields__group--full">
        <label htmlFor={`${idPrefix}-description`}>Description</label>
        <textarea
          id={`${idPrefix}-description`}
          value={values.description}
          onChange={(event) => onChange("description", event.target.value)}
          placeholder="Optional product description"
          disabled={disabled}
          rows={3}
        />
      </div>
    </div>
  );
}
