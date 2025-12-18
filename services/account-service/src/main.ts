import "reflect-metadata";
import express, { Request, Response } from "express";
import { AppDataSource } from "./config/db";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "account" });
});

// Mount auth routes
app.use("/api/auth", authRoutes);

async function bootstrap() {
 // await AppDataSource.initialize();
 // await AppDataSource.runMigrations();
  console.log("DB connected and migrations run");

  app.listen(Number(process.env.PORT), () => {
    console.log(`Account service running on port ${process.env.PORT}`);
  });
}

bootstrap().catch((err) => console.error(err));
