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
