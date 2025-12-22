import { Request, Response } from "express";
import { AppDataSource } from "../../config/db";
import { Item } from "../../entities/Item";
import { Character } from "../../entities/Character";
import { CharacterItem } from "../../entities/CharacterItem";

export async function createItem(req: Request, res: Response) {
  try {
    const repo = AppDataSource.getRepository(Item);
    const item = repo.create(req.body);
    await repo.save(item);
    return res.status(201).json(item);
  } catch (err) {
    return res.status(500).json({ message: "Error creating item" });
  }
}

export async function getItemDetails(req: Request, res: Response) {
  const repo = AppDataSource.getRepository(Item);
  const item = await repo.findOneBy({ id: req.params.id });

  if (!item) return res.status(404).json({ message: "Item not found" });

  const stats = [
    { name: "Strength", value: item.bonusStrength },
    { name: "Agility", value: item.bonusAgility },
    { name: "Intelligence", value: item.bonusIntelligence },
    { name: "Faith", value: item.bonusFaith },
  ];

  const highest = stats.reduce((prev, current) => 
    (prev.value > current.value) ? prev : current
  );

  const displayName = `${item.name} of ${highest.name}`;

  return res.json({ ...item, displayName });
}

export async function grantItem(req: Request, res: Response) {
  const { characterId, itemId } = req.body;
  
  const charRepo = AppDataSource.getRepository(Character);
  const itemRepo = AppDataSource.getRepository(Item);
  const charItemRepo = AppDataSource.getRepository(CharacterItem);

  const character = await charRepo.findOneBy({ id: characterId });
  const item = await itemRepo.findOneBy({ id: itemId });

  if (!character || !item) return res.status(404).json({ message: "Not found" });

  const newItem = charItemRepo.create({ character, item });
  await charItemRepo.save(newItem);

  return res.status(201).json({ message: "Item granted successfully" });
}