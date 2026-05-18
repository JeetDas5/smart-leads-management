import type { Request, Response, NextFunction } from "express";
import { ApiError, verifyToken } from "../utils/index.js";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const protect = (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError(401, "Unauthorized");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }

    const decoded = verifyToken(token);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Unauthorized"));
  }
};
