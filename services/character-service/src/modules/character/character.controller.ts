import { Request, Response } from "express";
import { AppDataSource } from "../../config/db";
import { Character } from "../../entities/Character";

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