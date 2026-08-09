import type { Request, Response } from "express";
import Item from "../model/items";
import User from "../model/user";

export const getWishlist = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).populate("wishlist");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ products: user.wishlist });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load wishlist.", error });
  }
};

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    const product = await Item.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const alreadySaved = user.wishlist.some((itemId) => itemId.toString() === productId);
    if (!alreadySaved) {
      user.wishlist.push(product._id);
      await user.save();
    }

    const refreshedUser = await User.findById(req.user?.id).populate("wishlist");
    return res.status(200).json({ products: refreshedUser?.wishlist ?? [] });
  } catch (error) {
    return res.status(500).json({ message: "Unable to add product to wishlist.", error });
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.wishlist = user.wishlist.filter((itemId) => itemId.toString() !== req.params.productId);
    await user.save();

    const refreshedUser = await User.findById(req.user?.id).populate("wishlist");
    return res.status(200).json({ products: refreshedUser?.wishlist ?? [] });
  } catch (error) {
    return res.status(500).json({ message: "Unable to remove product from wishlist.", error });
  }
};
