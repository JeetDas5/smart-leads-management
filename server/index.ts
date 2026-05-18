import dotenv from "dotenv";

import connectDB from "./config/db.js";

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

await startServer();
