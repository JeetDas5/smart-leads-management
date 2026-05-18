import express from "express";

import { login, register, getSalespersons } from "../controllers/index.js";
import { protect } from "../middlewares/index.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/salespersons", protect, getSalespersons);

export default router;

