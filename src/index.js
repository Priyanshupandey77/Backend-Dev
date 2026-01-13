import dotenv from "dotenv";
dotenv.config({ path: ".env" });
import connectedDB from "./db/index.js";

import { app } from "./app.js";
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectedDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
  }
};

startServer();
