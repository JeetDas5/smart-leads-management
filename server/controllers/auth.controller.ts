import { registerUser, loginUser } from "../services/index.js";
import { registerSchema, loginSchema } from "../validators/index.js";
import type { Request, Response, NextFunction } from "express";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const data = await registerUser(validatedData);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      ...data,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const data = await loginUser(validatedData);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      ...data,
    });
  } catch (error) {
    next(error);
  }
};

import { User } from "../models/index.js";
import { UserRole } from "../constants/index.js";

export const getSalespersons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const salespersons = await User.find({ role: UserRole.SALES }).select("name email role");
    res.status(200).json({
      success: true,
      data: salespersons,
    });
  } catch (error) {
    next(error);
  }
};

