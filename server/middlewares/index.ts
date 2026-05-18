import { protect, type AuthRequest } from "./auth.middleware.js";
import { authorize } from "./role.middleware.js";
import { errorMiddleware } from "./error.middleware.js";

export { protect, type AuthRequest, authorize, errorMiddleware };
