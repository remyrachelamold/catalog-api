import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { processPayment } from "../controllers/paymentController";

const router = Router();

router.use(authenticateToken);
router.post("/process", processPayment);

export default router;
