import dotenv from "dotenv";

import connectDB from "./config/db.js";
import app from "./app.js";

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();
    const port = Number(process.env.PORT ?? 5000);

    app.listen(port, () => {
      console.log(`Server running on port ${String(port)}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

await startServer();
