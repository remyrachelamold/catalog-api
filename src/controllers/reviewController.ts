import type { Request, Response } from "express";
import Item from "../model/items";
import Review from "../model/review";

export const getReviews = async (req: Request, res: Response) => {
  try {
    const product = await Item.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const reviews = await Review.find({ product: product._id }).populate("user", "fullName").sort({ createdAt: -1 });
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    return res.status(200).json({ reviews, averageRating, totalReviews: reviews.length });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load reviews.", error });
  }
};

export const createReview = async (req: Request, res: Response) => {
  try {
    const { rating, comment } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const product = await Item.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const review = await Review.create({
      product: product._id,
      user: req.user.id,
      rating,
      comment: comment?.trim() ?? "",
    });

    const populatedReview = await Review.findById(review._id).populate("user", "fullName");

    return res.status(201).json({ review: populatedReview });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create review.", error });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    if (review.user.toString() !== req.user?.id) {
      return res.status(403).json({ message: "You can only edit your own review." });
    }

    const { rating, comment } = req.body;
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;
    await review.save();

    const updatedReview = await Review.findById(review._id).populate("user", "fullName");
    return res.status(200).json({ review: updatedReview });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update review.", error });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    if (review.user.toString() !== req.user?.id) {
      return res.status(403).json({ message: "You can only delete your own review." });
    }

    await review.deleteOne();
    return res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete review.", error });
  }
};
