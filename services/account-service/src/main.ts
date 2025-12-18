import express, { Request, Response } from "express";
import { AppDataSource } from "./config/db";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "account" });
});

async function bootstrap() {
  await AppDataSource.initialize();
  console.log("DB connected");

  app.listen(process.env.PORT, () => {
    console.log(`Account service running on port ${process.env.PORT}`);
  });
}

bootstrap().catch((err) => console.error(err));
