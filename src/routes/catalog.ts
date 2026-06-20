import { Router } from "express";
import { getFilteredItems, createItem, updateItem, patchItem, deleteItem} from "../controllers/itemController";

const router = Router();

// router.post("/create", createUser);
router.get("/", getFilteredItems);
router.post("/", createItem);
router.put("/:id", updateItem);
router.patch("/:id", patchItem);
router.delete("/:id", deleteItem);

export default router;