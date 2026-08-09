import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../model/user";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const JWT_EXPIRES_IN = "7d";

async function signToken(userId: string, role: string) {
  // include tokenVersion in the token payload to support invalidation
  const user = await User.findById(userId).select("tokenVersion");
  const v = user?.tokenVersion ?? 0;
  return jwt.sign({ sub: userId, role, v }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: "customer",
    });

    const token = await signToken(user._id.toString(), user.role);

    return res.status(201).json({
      message: "User registered successfully.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isDisabled: user.isDisabled,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to register user.", error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.isDisabled) {
      return res.status(403).json({ message: "This account has been disabled." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = await signToken(user._id.toString(), user.role);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isDisabled: user.isDisabled,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to log in.", error });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isDisabled: user.isDisabled,
        createdAt: user.createdAt,
        appearance: user.appearance,
        notifications: user.notifications,
        shoppingPreferences: user.shoppingPreferences,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load profile.", error });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { fullName, email } = req.body ?? {};
    if (!userId) return res.status(401).json({ message: "Authentication required." });

    if (!fullName || !email) return res.status(400).json({ message: "Full name and email are required." });

    // Prevent changing to an email already in use by another account
    const existing = await User.findOne({ email });
    if (existing && existing._id.toString() !== userId) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const user = await User.findByIdAndUpdate(userId, { fullName, email }, { new: true }).select("-password");
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update profile.", error });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body ?? {};
    if (!userId) return res.status(401).json({ message: "Authentication required." });

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All password fields are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return res.status(401).json({ message: "Current password is incorrect." });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to change password.", error });
  }
};

export const updatePreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Authentication required." });

    const { appearance, notifications, shoppingPreferences } = req.body ?? {};

    const update: any = {};
    if (appearance) update.appearance = appearance;
    if (notifications) update.notifications = notifications;
    if (shoppingPreferences) update.shoppingPreferences = shoppingPreferences;

    const user = await User.findByIdAndUpdate(userId, update, { new: true }).select("-password");
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update preferences.", error });
  }
};

export const logoutAllDevices = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Authentication required." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    return res.status(200).json({ message: "Logged out of all devices." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to logout from all devices.", error });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Authentication required." });

    // Remove user and associated orders
    await User.findByIdAndDelete(userId);
    // Optional: remove orders belonging to user
    const Order = (await import("../model/order")).default;
    await Order.deleteMany({ user: userId });

    return res.status(200).json({ message: "Account deleted." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete account.", error });
  }
};
