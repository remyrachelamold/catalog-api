import { Router } from "express";
import {
  getAdminDashboard,
  listAdminOrders,
  listAdminProducts,
  listAdminUsers,
  toggleUserStatus,
  updateOrderStatus,
  updateUserRole,
} from "../controllers/adminController";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticateToken, requireAdmin);
router.get("/dashboard", getAdminDashboard);
router.get("/products", listAdminProducts);
router.get("/orders", listAdminOrders);
router.get("/users", listAdminUsers);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/status", toggleUserStatus);
router.patch("/orders/:id/status", updateOrderStatus);

export default router;
