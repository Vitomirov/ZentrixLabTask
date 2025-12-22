import "reflect-metadata";
import { DataSource } from "typeorm";
import { Character } from "../entities/Character";
import { CharacterClass } from "../entities/CharacterClass";
import { CharacterItem } from "../entities/CharacterItem";
import { Item } from "../entities/Item";
import { seedDatabase } from "./seed";
import dotenv from "dotenv";
import * as path from "path";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [Character, CharacterClass, CharacterItem, Item],
  migrations: [path.join(__dirname, "..", "migrations", "*{.ts,.js}")],
  migrationsTableName: "migrations",
  synchronize: false, 
  logging: false,
});

export async function initializeDB() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Character DB connected");

      console.log("🚀 Running migrations...");
      await AppDataSource.runMigrations();

      console.log("🌱 Checking for seed data...");
      await seedDatabase();
      
      console.log("✅ DB Initialization complete");
    }
  } catch (error) {
    console.error("❌ Error during Data Source initialization", error);
    throw error;
  }
}