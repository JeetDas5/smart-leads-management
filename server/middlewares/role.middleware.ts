import { ApiError } from "../utils/index.js";
import type { AuthRequest } from "./auth.middleware.js";
import type { Response, NextFunction } from "express";

export const authorize =
  (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new ApiError(401, "Unauthorized"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ApiError(403, "You are not allowed to access this resource"));
      return;
    }

    next();
  };
