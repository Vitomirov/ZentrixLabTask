import { DataSource } from "typeorm";
import { User } from "../entities/User";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  entities: [User],
  migrations: ["dist/migrations/*.ts"],
});
