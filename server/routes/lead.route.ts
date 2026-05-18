import express from "express";
import { authorize, protect } from "../middlewares/index.js";

import { createLeadHandler, deleteLeadHandler, getLeadsHandler, getSingleLeadHandler, updateLeadHandler } from "../controllers/index.js";

const router = express.Router();

router.use(protect);

router.get("/", getLeadsHandler);

router.get("/:id", getSingleLeadHandler);

router.post("/", authorize("admin", "sales"), createLeadHandler);

router.put("/:id", authorize("admin", "sales"), updateLeadHandler);

router.delete("/:id", authorize("admin"), deleteLeadHandler);

export default router;
