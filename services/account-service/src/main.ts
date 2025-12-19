import "reflect-metadata";
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { AppDataSource } from "./config/db";
import authRoutes from "./modules/auth/auth.routes";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "account" });
});

// Mount auth routes
app.use("/api/auth", authRoutes);

/**
 * Retry ONLY database connection.
 * Migrations are executed ONCE after successful connection.
 */
async function waitForDbConnection(retries = 10, delayMs = 3000) {
  while (retries > 0) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      console.log("DB connected");
      return;
    } catch (err) {
      retries--;
      console.log("DB not ready, retrying...", retries);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }

  throw new Error("DB connection failed");
}

async function bootstrap() {
  await waitForDbConnection();

  await AppDataSource.runMigrations();
  console.log("Migrations executed");

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Account service running on port ${port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
