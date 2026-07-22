import { Router } from "express";
import { getFilteredItems, getItemById, createItem, updateItem, patchItem, deleteItem} from "../controllers/itemController";

const router = Router();

router.get("/", getFilteredItems);
router.get("/:id", getItemById);
router.post("/", createItem);
router.put("/:id", updateItem);
router.patch("/:id", patchItem);
router.delete("/:id", deleteItem);

export default router;