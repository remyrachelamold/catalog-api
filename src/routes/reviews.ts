import { Router } from "express";
import {
  createReview,
  deleteReview,
  getReviews,
  updateReview,
} from "../controllers/reviewController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router({ mergeParams: true });

router.get("/", getReviews);
router.post("/", authenticateToken, createReview);
router.put("/:reviewId", authenticateToken, updateReview);
router.delete("/:reviewId", authenticateToken, deleteReview);

export default router;
