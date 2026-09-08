import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

import "./index.css";
import { ToastProvider } from "./context/ToastContext";

// Apply saved appearance preference (if any)
try {
  const saved = window.localStorage.getItem("catalog-appearance");
  const theme = saved === "dark" || saved === "light" ? saved : null;
  if (theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  } else {
    document.documentElement.removeAttribute("data-theme");
    document.body.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "light";
  }
} catch (e) {
  // ignore
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
  <BrowserRouter>
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  </BrowserRouter>
</StrictMode>
);