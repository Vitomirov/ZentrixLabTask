import { DataSource } from "typeorm";
import { User } from "../entities/User";
import dotenv from "dotenv";

dotenv.config();


export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  schema: "public",
  synchronize: true,
  logging: true,
  entities: [User],
});

export async function initializeDB() {
  await AppDataSource.initialize();
  console.log("DB connected");
}
