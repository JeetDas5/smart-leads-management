import bcrypt from "bcryptjs";
import { User } from "../models/index.js";
import { UserRole } from "../constants/enum.js";
import { ApiError, generateToken } from "../utils/index.js";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface LoginInput {
  email: string;
  password: string;
}

export const registerUser = async ({ name, email, password, role }: RegisterInput) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const user = await User.create({ name, email, password, role: role ?? UserRole.SALES });

  const token = generateToken({ userId: user._id.toString(), role: user.role });

  return {
    token,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const loginUser = async ({ email, password }: LoginInput) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(400, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid email or password");
  }

  const token = generateToken({ userId: user._id.toString(), role: user.role });

  return {
    token,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
