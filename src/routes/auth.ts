import { Router } from "express";
import {
	getProfile,
	loginUser,
	registerUser,
	updateProfile,
	changePassword,
	updatePreferences,
	logoutAllDevices,
	deleteAccount,
} from "../controllers/authController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authenticateToken, getProfile);
router.patch("/profile", authenticateToken, updateProfile);
router.patch("/password", authenticateToken, changePassword);
router.patch("/preferences", authenticateToken, updatePreferences);
router.post("/logout-all", authenticateToken, logoutAllDevices);
router.delete("/", authenticateToken, deleteAccount);

export default router;
