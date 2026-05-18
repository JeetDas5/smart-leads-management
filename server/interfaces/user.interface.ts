import { Document } from "mongoose";
import { UserRole } from "../constants/index.js";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;

  createdAt: Date;
  updatedAt: Date;
}
