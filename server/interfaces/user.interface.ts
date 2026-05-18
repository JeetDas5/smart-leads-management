import { UserRole } from "../constants/index.js";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;

  createdAt: Date;
  updatedAt: Date;
}
