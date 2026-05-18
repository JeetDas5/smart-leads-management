import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

import { errorMiddleware } from "./middlewares/index.js";
import { authRouter } from "./routes/index.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({
    message: "Smart Leads API Running",
    success: true,
  });
});

app.use("/api/auth", authRouter);

app.use(errorMiddleware);

export default app;
