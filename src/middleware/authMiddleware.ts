import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../model/user";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

interface JwtPayload {
  sub: string;
  role?: string;
  v?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role?: string;
      };
    }
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Enforce token version to support logout-all-devices
    const user = await User.findById(payload.sub).select("tokenVersion");
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    if (typeof payload.v === "number" && payload.v !== user.tokenVersion) {
      return res.status(401).json({ message: "Session invalidated. Please log in again." });
    }

    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Access denied." });
  }

  return next();
}
