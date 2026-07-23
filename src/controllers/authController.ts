import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../model/user";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";
const JWT_EXPIRES_IN = "7d";

function signToken(userId: string, role: string) {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
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

    const token = signToken(user._id.toString(), user.role);

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

    const token = signToken(user._id.toString(), user.role);

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
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load profile.", error });
  }
};
