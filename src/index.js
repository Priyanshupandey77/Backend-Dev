import express from "express";
import dotenv from "dotenv";
import connectedDB from "./db/index.js";

dotenv.config({ path: ".env" });

const app = express();
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
