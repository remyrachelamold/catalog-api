import type { Request, Response } from "express";
import Item, { type IItem } from "../model/items";

// -------- Pure Logic Functions (for MCP and tests) --------
export async function getCatalogs() {
    return await Item.find({});
}

export async function addCatalogItem(input: { name: string, price: number, category: string }) {
    const newItem = new Item(input);
    await newItem.save();
    return newItem;
}

export async function deleteCatalogItem(input: { id: string }) {
    const deletedItem = await Item.findByIdAndDelete(input.id);
    if (!deletedItem) throw new Error("Item not found");
    return deletedItem;
}

export async function updateCatalogItem(input: { id: string; data: Partial<IItem> }) {
    const updatedItem = await Item.findByIdAndUpdate(input.id, input.data, { new: true });
    if (!updatedItem) throw new Error("Item not found");
    return updatedItem;
}

export async function patchCatalogItem(input: { id: string; data: Partial<IItem> }) {
    const patchedItem = await Item.findByIdAndUpdate(input.id, input.data, { new: true });
    if (!patchedItem) throw new Error("Item not found");
    return patchedItem;
}

// -------- Express Route Handlers (for HTTP API) --------
// Get item by ID (API)
export const getItemById = async (req: Request, res: Response) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving item", error });
    }
};

// Get filtered items (API)
export const getFilteredItems = async (req: Request, res: Response) => {
    try {
        const filter: any = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.name) filter.name = req.query.name;
        if (req.query.price) filter.price = Number(req.query.price);

        const filteredItems = await Item.find(filter);
        res.status(200).json(filteredItems);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving items", error });
    }
};

// Create new item (API)
export const createItem = async (req: Request, res: Response) => {
    try {
        const newItem = new Item(req.body);
        await newItem.save();
        res.status(201).json({
            message: "Item created successfully",
            data: newItem,
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating item", error });
    }
};

// Update item by ID (PUT, API)
export const updateItem = async (req: Request, res: Response) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedItem) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json({
            message: "Item updated successfully",
            data: updatedItem,
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating item", error });
    }
};

// Patch item (partial update, API)
export const patchItem = async (req: Request, res: Response) => {
    try {
        const patchedItem = await Item.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!patchedItem) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json({
            data: patchedItem,
        });
    } catch (error) {
        res.status(500).json({ message: "Error patching item", error });
    }
};

// Delete item (API)
export const deleteItem = async (req: Request, res: Response) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.status(200).json({
            message: "Item deleted successfully",
            data: deletedItem,
        });
    } catch (error) {
        res.status(500).json({ message: "Error deleting item", error });
    }
};
