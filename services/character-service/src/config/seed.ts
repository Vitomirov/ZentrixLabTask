// services/character-service/src/config/seed.ts

import { AppDataSource } from "./db"; // Importujemo konekciju
import { CharacterClass } from "../entities/CharacterClass"; // Importujemo entitete
import { Item } from "../entities/Item";

export async function seedDatabase() {
  console.log("🛠️  SEED: Starting..."); 
  
  const classRepo = AppDataSource.getRepository(CharacterClass);
  const itemRepo = AppDataSource.getRepository(Item);

  // Provera za klase
  const warriorExists = await classRepo.findOneBy({ name: "Warrior" });
  if (!warriorExists) {
    console.log("🌱 SEED: Inserting Warrior & Mage...");
    await classRepo.insert([
      { id: "69c56550-b39a-440a-a84f-830ca734cfb6", name: "Warrior", description: "Heavy damage dealer" },
      { id: "a1b2c3d4-e5f6-4012-8345-6789abcdef01", name: "Mage", description: "Powerful magic user" }
    ]);
  }

  // Provera za iteme
  const itemExists = await itemRepo.findOneBy({ name: "Dragon Slayer" });
  if (!itemExists) {
    console.log("⚔️ SEED: Inserting Items...");
    await itemRepo.insert([
      {
        id: "b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e",
        name: "Dragon Slayer",
        description: "A legendary heavy broadsword",
        bonusStrength: 15,
        bonusAgility: 5
      },
      {
        id: "c2d3e4f5-a6b7-4c8d-9e0f-1a2b3c4d5e6f",
        name: "Mystic Staff",
        description: "Staff infused with ancient arcane energy",
        bonusIntelligence: 20,
        bonusFaith: 10
      }
    ]);
  }
  console.log("✅ SEED: Finished!");
}