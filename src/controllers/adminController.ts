import type { Request, Response } from "express";
import Item from "../model/items";
import User from "../model/user";
import Order from "../model/order";

interface DashboardSummaryInput {
  productsCount: number;
  categoriesCount: number;
  usersCount: number;
  ordersCount: number;
  revenue: number;
  pendingOrders: number;
  deliveredOrders: number;
}

interface InventoryProductLike {
  name: string;
  price: number;
  category: string;
  stock?: number;
  createdAt?: Date;
}

export function buildDashboardSummary(input: DashboardSummaryInput) {
  return {
    productsCount: input.productsCount,
    categoriesCount: input.categoriesCount,
    usersCount: input.usersCount,
    ordersCount: input.ordersCount,
    revenue: input.revenue,
    pendingOrders: input.pendingOrders,
    deliveredOrders: input.deliveredOrders,
  };
}

export function buildInventorySummary(products: InventoryProductLike[]) {
  const productsByCategory = products.reduce<Record<string, number>>((acc, product) => {
    acc[product.category] = (acc[product.category] ?? 0) + 1;
    return acc;
  }, {});

  const lowStockProducts = products.filter((product) => (product.stock ?? 0) <= 3);
  const recentProducts = [...products]
    .sort((left, right) => Number(right.createdAt ?? 0) - Number(left.createdAt ?? 0))
    .slice(0, 5);

  return {
    inventoryValue: products.reduce((sum, product) => sum + product.price * (product.stock ?? 1), 0),
    totalProducts: products.length,
    productsByCategory: Object.entries(productsByCategory).map(([category, count]) => ({ category, count })),
    lowStockProducts,
    recentProducts,
  };
}

export const getAdminDashboard = async (_req: Request, res: Response) => {
  try {
    const [products, users, orders] = await Promise.all([
      Item.find({}),
      User.find({}),
      Order.find({}),
    ]);

    const categories = new Set(products.map((product: any) => product.category));
    const revenue = orders.reduce((sum: number, order: any) => sum + (order.total ?? 0), 0);
    const pendingOrders = orders.filter((order: any) => order.status === "Pending" || order.status === "Processing").length;
    const deliveredOrders = orders.filter((order: any) => order.status === "Delivered").length;

    const monthlyOrders = orders.reduce<Record<string, { month: string; orders: number; revenue: number }>>((acc, order: any) => {
      const month = new Date(order.createdAt).toLocaleString("en-US", { month: "short", year: "numeric" });
      if (!acc[month]) {
        acc[month] = { month, orders: 0, revenue: 0 };
      }
      acc[month].orders += 1;
      acc[month].revenue += order.total ?? 0;
      return acc;
    }, {});

    const statusDistribution = orders.reduce<Record<string, number>>((acc, order: any) => {
      const status = order.status ?? "Pending";
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    }, {});

    const productsByCategory = products.reduce<Record<string, number>>((acc, product: any) => {
      acc[product.category] = (acc[product.category] ?? 0) + 1;
      return acc;
    }, {});

    return res.status(200).json({
      summary: buildDashboardSummary({
        productsCount: products.length,
        categoriesCount: categories.size,
        usersCount: users.length,
        ordersCount: orders.length,
        revenue,
        pendingOrders,
        deliveredOrders,
      }),
      inventory: buildInventorySummary(products.map((product: any) => ({
        name: product.name,
        price: product.price,
        category: product.category,
        stock: product.stock ?? 10,
        createdAt: product.createdAt ?? new Date(),
      }))),
      charts: {
        productsByCategory: Object.entries(productsByCategory).map(([category, count]) => ({ category, count })),
        monthlyOrders: Object.values(monthlyOrders),
        revenueOverview: Object.values(monthlyOrders).map((entry) => ({ month: entry.month, revenue: entry.revenue })),
        orderStatusDistribution: Object.entries(statusDistribution).map(([status, count]) => ({ status, count })),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load admin dashboard.", error });
  }
};

export const listAdminProducts = async (_req: Request, res: Response) => {
  try {
    const products = await Item.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ products });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load products.", error });
  }
};

export const listAdminUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load users.", error });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update user role.", error });
  }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { isDisabled } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isDisabled }, { new: true }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update user status.", error });
  }
};

export const listAdminOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load orders.", error });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    return res.status(200).json({ order });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update order status.", error });
  }
};
