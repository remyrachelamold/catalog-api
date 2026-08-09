import type { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../model/order";

const SHIPPING_COST = 10;
const TAX_RATE = 0.08;

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { items, shipping } = req.body;
    const { paymentMethod, paymentStatus, transactionId, paidAt } = req.body ?? {};

    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart items are required to place an order." });
    }

    if (!shipping || typeof shipping !== "object") {
      return res.status(400).json({ message: "Shipping information is required." });
    }

    const sanitizedItems = items.map((item: any) => ({
      productId: new mongoose.Types.ObjectId(item.productId),
      name: item.name,
      category: item.category,
      imageUrl: item.imageUrl || "",
      price: Number(item.price),
      quantity: Number(item.quantity),
    }));

    const subtotal = sanitizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = Number((subtotal * TAX_RATE).toFixed(2));
    const total = Number((subtotal + SHIPPING_COST + tax).toFixed(2));

    const orderPayload: any = {
      user: new mongoose.Types.ObjectId(userId),
      products: sanitizedItems,
      shipping,
      subtotal,
      shippingCost: SHIPPING_COST,
      tax,
      total,
    };

    // Only accept safe payment fields and whitelist values
    const allowedMethods = ["card", "upi", "netbanking", "cod"];
    const allowedStatuses = ["pending", "paid", "failed"];

    if (paymentMethod && allowedMethods.includes(paymentMethod)) {
      orderPayload.paymentMethod = paymentMethod;
    }

    if (paymentStatus && allowedStatuses.includes(paymentStatus)) {
      orderPayload.paymentStatus = paymentStatus;
    }

    if (transactionId && typeof transactionId === "string") {
      orderPayload.transactionId = transactionId;
    }

    if (paidAt) {
      const date = new Date(paidAt);
      if (!isNaN(date.getTime())) {
        orderPayload.paidAt = date;
      }
    }

    const order = await Order.create(orderPayload);

    return res.status(201).json({
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create order.", error });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load orders.", error });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const order = await Order.findOne({ _id: id, user: userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.status(200).json({ order });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load order.", error });
  }
};
