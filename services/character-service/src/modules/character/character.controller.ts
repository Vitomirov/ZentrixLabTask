import { Request, Response } from "express";
import { AppDataSource } from "../../config/db";
import { redisClient } from "../../config/redis";
import { Character } from "../../entities/Character";

// POST /api/character
export async function createCharacter(req: Request, res: Response) {
  try {
    const { 
      name, 
      health, 
      mana, 
      baseStrength, 
      baseAgility, 
      baseIntelligence, 
      baseFaith, 
      characterClassId 
    } = req.body;
    
    if (!name) return res.status(400).json({ message: "Character name is required" });
    if (!characterClassId) return res.status(400).json({ message: "Character class ID is required" });

    const user = (req as any).user;
    if (!user || !user.userId) {
      return res.status(401).json({ message: "Unauthorized: No user found in token" });
    }

    const repo = AppDataSource.getRepository(Character);
    
    const existing = await repo.findOne({ where: { name } });
    if (existing) return res.status(409).json({ message: "Character name already exists" });

    const character = repo.create({
      name,
      health: health ?? 100,
      mana: mana ?? 50,
      baseStrength: baseStrength ?? 10,
      baseAgility: baseAgility ?? 10,
      baseIntelligence: baseIntelligence ?? 10,
      baseFaith: baseFaith ?? 10,
      createdBy: user.userId,
      characterClass: { id: characterClassId } as any 
    });

    await repo.save(character);
    return res.status(201).json(character);
  } catch (err) {
    console.error("CREATE CHARACTER ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/character
export async function getAllCharacters(req: Request, res: Response) {
  try {
    const user = (req as any).user;

    if (user.role !== 'GameMaster') {
      return res.status(403).json({ message: "Forbidden: Only Game Masters can list all characters" });
    }

    const repo = AppDataSource.getRepository(Character);
    
    const characters = await repo.find({
      select: {
        id: true,
        name: true,
        health: true,
        mana: true
      }
    });

    return res.json(characters);
  } catch (err) {
    console.error("GET ALL CHARACTERS ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// GET /api/character/:id
export async function getCharacterById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const cacheKey = `character:${id}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const repo = AppDataSource.getRepository(Character);
    
    const character = await repo.findOne({
      where: { id },
      relations: ["characterClass", "items", "items.item"] 
    });

    if (!character) return res.status(404).json({ message: "Character not found" });

    if (user.role !== 'GameMaster' && character.createdBy !== user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    let strength = character.baseStrength;
    let agility = character.baseAgility;
    let intelligence = character.baseIntelligence;
    let faith = character.baseFaith;

    if (character.items && character.items.length > 0) {
      character.items.forEach(charItem => {
        if (charItem.item) {
          strength += charItem.item.bonusStrength || 0;
          agility += charItem.item.bonusAgility || 0;
          intelligence += charItem.item.bonusIntelligence || 0;
          faith += charItem.item.bonusFaith || 0;
        }
      });
    }

    const result = { 
      ...character, 
      calculatedStats: { strength, agility, intelligence, faith } 
    };

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));

    return res.json(result);
  } catch (err) {
    console.error("GET CHARACTER BY ID ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}