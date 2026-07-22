export interface OrderProduct {
  productId: string;
  name: string;
  category: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

export interface OrderShipping {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  _id: string;
  user: string;
  products: OrderProduct[];
  shipping: OrderShipping;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt: string;
}

export interface OrderResponse {
  message: string;
  order: Order;
}

export interface OrdersResponse {
  orders: Order[];
}

export interface OrderCreatePayload {
  items: OrderProduct[];
  shipping: OrderShipping;
}
