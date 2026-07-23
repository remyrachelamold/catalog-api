export interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  description?: string;
  stock?: number;
}

export interface ProductInput {
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  description?: string;
  stock?: number;
}

export interface ProductMutationResponse {
  message: string;
  data: Product;
}

export interface ProductFormValues {
  name: string;
  price: string;
  category: string;
  imageUrl: string;
  description: string;
  stock?: string;
}

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  name: "",
  price: "",
  category: "",
  imageUrl: "",
  description: "",
  stock: "10",
};
