import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import { AppDataSource } from "./config/db";
import characterRoutes from "./modules/character/character.routes";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/character", characterRoutes);
app.get("/health", (_req, res) => res.json({ service: "character-service", status: "ok" }));

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  let retries = 5;
  while (retries) {
    try {
      console.log("Connecting to DB...");
      await AppDataSource.initialize();
      console.log("Character DB connected");

      console.log("Checking for pending migrations...");
      const pendingMigrations = await AppDataSource.showMigrations();
      
      if (pendingMigrations) {
        console.log("Running migrations...");
        await AppDataSource.runMigrations();
        console.log("Migrations applied!");
      } else {
        console.log("ℹNo pending migrations.");
      }

      app.listen(PORT, () => {
        console.log(`🌍 Character service running on port ${PORT}`);
      });
      break;
    } catch (err) {
      retries -= 1;
      console.error(`Startup error. Retries left: ${retries}`);
      console.error(err);
      if (retries === 0) process.exit(1);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

startServer();