import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "../types/cart";
import type { Product } from "../types/Product";
import {
  calculateCartSummary,
  loadCartFromStorage,
  saveCartToStorage,
} from "../utils/cartStorage";
import { useToast } from "../hooks/useToast";

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());
  const { showToast } = useToast();

  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addToCart = useCallback(
    (product: Product) => {
      setItems((current) => {
        const existingItem = current.find(
          (item) => item.product._id === product._id
        );

        if (existingItem) {
          showToast(`${product.name} quantity updated.`, "success");
          return current.map((item) =>
            item.product._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }

        showToast(`${product.name} added to cart.`, "success");
        return [...current, { product, quantity: 1 }];
      });
    },
    [showToast]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setItems((current) => {
        const removedItem = current.find((item) => item.product._id === productId);
        const nextItems = current.filter((item) => item.product._id !== productId);

        if (removedItem) {
          showToast(`${removedItem.product.name} removed from cart.`, "info");
        }

        return nextItems;
      });
    },
    [showToast]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      setItems((current) => {
        const targetItem = current.find((item) => item.product._id === productId);
        const nextItems = current.map((item) =>
          item.product._id === productId ? { ...item, quantity } : item
        );

        if (targetItem) {
          showToast(`${targetItem.product.name} quantity updated.`, "success");
        }

        return nextItems;
      });
    },
    [removeFromCart, showToast]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    showToast("Cart cleared.", "info");
  }, [showToast]);

  const summary = useMemo(() => calculateCartSummary(items), [items]);

  const value = useMemo(
    () => ({
      items,
      totalItems: summary.totalItems,
      subtotal: summary.subtotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }),
    [items, summary.totalItems, summary.subtotal, addToCart, removeFromCart, updateQuantity, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
}
