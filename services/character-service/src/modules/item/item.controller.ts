import { Request, Response } from "express";
import { AppDataSource } from "../../config/db";
import { Item } from "../../entities/Item";
import { redisClient } from "../../config/redis";
import { Character } from "../../entities/Character";
import { CharacterItem } from "../../entities/CharacterItem";

// POST /api/items
export async function createItem(req: Request, res: Response) {
  try {
    const { name, description, bonusStrength, bonusAgility, bonusIntelligence, bonusFaith } = req.body;

    if (!name) return res.status(400).json({ message: "Item name is required" });

    const repo = AppDataSource.getRepository(Item);
    
    // Check if an item with the same name already exists
    const existing = await repo.findOne({ where: { name } });
    if (existing) return res.status(409).json({ message: "Item with this name already exists" });

    const item = repo.create({
      name,
      description,
      bonusStrength: bonusStrength ?? 0,
      bonusAgility: bonusAgility ?? 0,
      bonusIntelligence: bonusIntelligence ?? 0,
      bonusFaith: bonusFaith ?? 0
    });

    await repo.save(item);
    return res.status(201).json(item);
  } catch (err) {
    console.error("CREATE ITEM ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

 // GET /api/items
export async function getItems(req: any, res: Response) {
  try {

    if (req.user?.role !== 'GameMaster') {
      return res.status(403).json({ message: "Only Game Masters can list all items" });
    }

    const repo = AppDataSource.getRepository(Item);
    const items = await repo.find();

    const itemsWithSuffix = items.map(item => {
    const stats = [
      { name: "Strength", value: item.bonusStrength },
      { name: "Agility", value: item.bonusAgility },
      { name: "Intelligence", value: item.bonusIntelligence },
      { name: "Faith", value: item.bonusFaith },
      ];

    const highest = stats.reduce((prev, current) => 
      (prev.value >= current.value) ? prev : current
      );

    const finalName = highest.value > 0 
      ? `${item.name} of ${highest.name}` 
      : item.name;

    return {
      ...item,
      name: finalName
    };
});

    return res.json(itemsWithSuffix);
  } catch (err) {
    console.error("GET ITEMS ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
} 

// GET /api/items/:id
export async function getItemDetails(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const repo = AppDataSource.getRepository(Item);
    const item = await repo.findOneBy({ id });

    if (!item) return res.status(404).json({ message: "Item not found" });

    // Determine the name suffix based on the highest stat bonus
    const stats = [
      { name: "Strength", value: item.bonusStrength },
      { name: "Agility", value: item.bonusAgility },
      { name: "Intelligence", value: item.bonusIntelligence },
      { name: "Faith", value: item.bonusFaith },
    ];

    const highest = stats.reduce((prev, current) => 
      (prev.value > current.value) ? prev : current
    );

    // Apply suffix only if the highest bonus is greater than zero
    const displayName = highest.value > 0 
      ? `${item.name} of ${highest.name}` 
      : item.name;

    return res.json({ ...item, displayName });
  } catch (err) {
    console.error("GET ITEM DETAILS ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/items/grant
export async function grantItem(req: Request, res: Response) {
  try {
    const { characterId, itemId } = req.body;
    
    if (!characterId || !itemId) {
      return res.status(400).json({ message: "characterId and itemId are required" });
    }

    const charRepo = AppDataSource.getRepository(Character);
    const itemRepo = AppDataSource.getRepository(Item);
    const charItemRepo = AppDataSource.getRepository(CharacterItem);

    const character = await charRepo.findOneBy({ id: characterId });
    const item = await itemRepo.findOneBy({ id: itemId });

    if (!character || !item) return res.status(404).json({ message: "Character or Item not found" });

    const newItem = charItemRepo.create({ character, item });
    await charItemRepo.save(newItem);

    // IMPORTANT: Invalidate the character cache in Redis as stats have changed
    await redisClient.del(`character:${characterId}`);

    return res.status(201).json({ message: "Item granted successfully" });
  } catch (err) {
    console.error("GRANT ITEM ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// POST /api/items/gift
export async function giftItem(req: Request, res: Response) {
  try {
    const { fromCharacterId, toCharacterId, itemId } = req.body;
    
    if (!fromCharacterId || !toCharacterId || !itemId) {
      return res.status(400).json({ message: "Missing required IDs" });
    }

    const charItemRepo = AppDataSource.getRepository(CharacterItem);

    // Find the link between the item and the source character
    const itemToTransfer = await charItemRepo.findOne({
      where: { 
        character: { id: fromCharacterId }, 
        item: { id: itemId } 
      }
    });

    if (!itemToTransfer) {
      return res.status(404).json({ message: "Source character does not own this item" });
    }

    // Transfer ownership to the target character
    itemToTransfer.character = { id: toCharacterId } as Character;
    await charItemRepo.save(itemToTransfer);

    // IMPORTANT: Invalidate cache for BOTH characters as their stats have changed
    await redisClient.del(`character:${fromCharacterId}`);
    await redisClient.del(`character:${toCharacterId}`);

    return res.json({ message: "Item gifted successfully" });
  } catch (err) {
    console.error("GIFT ITEM ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}