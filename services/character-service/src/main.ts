import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import { connectRedis} from "./config/redis";
import { AppDataSource } from "./config/db";
import { seedDatabase } from "./config/seed";
import characterRoutes from "./modules/character/character.routes";
import itemRoutes from "./modules/item/item.routes";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/character", characterRoutes);
app.use("/api/item", itemRoutes);
app.get("/health", (_req, res) => res.json({ service: "character-service", status: "ok" }));

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  let retries = 5;
  while (retries) {
    try {
      console.log("Connecting to DB...");
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      console.log("Character DB connected");
      await connectRedis();
      console.log("Redis connected");

      console.log("🚀 Checking migrations...");
      await AppDataSource.runMigrations();
      console.log("Migrations complete");

      console.log("Checking for seed data...");
      await seedDatabase(); 
      console.log("Seeding process finished");

      app.listen(PORT, () => {
        console.log(`Character service running on port ${PORT}`);
      });
      break;
    } catch (err) {
      retries -= 1;
      console.error(`Startup error. Retries left: ${retries}`);
      if (retries === 0) process.exit(1);
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

startServer();