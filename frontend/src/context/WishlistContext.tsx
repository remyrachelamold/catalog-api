import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuthContext } from "./AuthContext";
import { useToast } from "../hooks/useToast";
import {
  addToWishlist as addToWishlistApi,
  fetchWishlist as fetchWishlistApi,
  removeFromWishlist as removeFromWishlistApi,
} from "../services/api";
import type { Product } from "../types/Product";
import {
  loadWishlistFromStorage,
  saveWishlistToStorage,
} from "../utils/wishlistStorage";

interface WishlistContextValue {
  items: Product[];
  totalItems: number;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const { showToast } = useToast();
  const [items, setItems] = useState<Product[]>(() => loadWishlistFromStorage());

  useEffect(() => {
    if (authLoading) {
      return;
    }

    async function syncWishlist() {
      if (!isAuthenticated) {
        return;
      }

      try {
        const localItems = loadWishlistFromStorage();
        const data = await fetchWishlistApi();
        const existingIds = new Set(data.products.map((product) => product._id));

        const toSync = localItems.filter(
          (product) => !existingIds.has(product._id)
        );

        await Promise.all(
          toSync.map((product) =>
            addToWishlistApi(product._id).catch(() => undefined)
          )
        );

        const merged = [
          ...data.products,
          ...toSync.filter((product) => !existingIds.has(product._id)),
        ];

        setItems(merged);
        saveWishlistToStorage(merged);
      } catch {
        // Keep the stored wishlist until a later successful sync.
      }
    }

    void syncWishlist();
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    saveWishlistToStorage(items);
  }, [items]);

  const isInWishlist = useCallback(
    (productId: string) => {
      return items.some((product) => product._id === productId);
    },
    [items]
  );

  const addToWishlist = useCallback(
    async (product: Product) => {
      setItems((current) => {
        if (current.some((item) => item._id === product._id)) {
          return current;
        }

        showToast(`${product.name} added to wishlist.`, "success");
        return [...current, product];
      });

      if (isAuthenticated) {
        try {
          await addToWishlistApi(product._id);
        } catch {
          showToast(
            "Unable to sync wishlist while online. Your selection is still saved locally.",
            "info"
          );
        }
      }
    },
    [isAuthenticated, showToast]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      setItems((current) => current.filter((item) => item._id !== productId));

      if (isAuthenticated) {
        try {
          await removeFromWishlistApi(productId);
        } catch {
          showToast(
            "Unable to sync wishlist removal while online. Your selection is still removed locally.",
            "info"
          );
        }
      }
    },
    [isAuthenticated, showToast]
  );

  const toggleWishlist = useCallback(
    async (product: Product) => {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
        return;
      }

      await addToWishlist(product);
    },
    [addToWishlist, isInWishlist, removeFromWishlist]
  );

  const value = useMemo(
    () => ({
      items,
      totalItems: items.length,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
    }),
    [items, isInWishlist, addToWishlist, removeFromWishlist, toggleWishlist]
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlistContext must be used within a WishlistProvider");
  }

  return context;
}
