import { Router } from "express";
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlistController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authenticateToken, getWishlist);
router.post("/", authenticateToken, addToWishlist);
router.delete("/:productId", authenticateToken, removeFromWishlist);

export default router;
