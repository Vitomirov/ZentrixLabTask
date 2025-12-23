import { Request, Response } from "express";
import axios from "axios";
import { AppDataSource } from "../../config/db";
import { Duel } from "../../entities/Duel";

const CHARACTER_SERVICE_URL = process.env.CHARACTER_SERVICE_URL;

// Initializing a new duel
export async function challenge(req: Request, res: Response) {
  const { attackerId, defenderId } = req.body;
  const loggedInUserId = (req as any).user.userId;
  const token = req.headers.authorization;

  try {
    const [aRes, dRes] = await Promise.all([
      axios.get(`${CHARACTER_SERVICE_URL}/character/${attackerId}`, { headers: { Authorization: token } }),
      axios.get(`${CHARACTER_SERVICE_URL}/character/${defenderId}`, { headers: { Authorization: token } })
    ]);

    console.log("Attacker Data:", JSON.stringify(aRes.data, null, 2));
    console.log("Defender Data:", JSON.stringify(dRes.data, null, 2));

    const attacker = aRes.data;
    const defender = dRes.data;

    if (attacker.createdBy !== loggedInUserId) {
      return res.status(403).json({ message: "Only the character owner can initiate" });
    }

    const repo = AppDataSource.getRepository(Duel);
    const newDuel = repo.create({
      attackerId: attacker.id,
      defenderId: defender.id,
      attackerHp: attacker.health,
      defenderHp: defender.health,
      attackerStr: attacker.calculatedStats.strength,
      attackerAgi: attacker.calculatedStats.agility,
      attackerInt: attacker.calculatedStats.intelligence,
      attackerFaith: attacker.calculatedStats.faith,
      defenderStr: defender.calculatedStats.strength,
      defenderAgi: defender.calculatedStats.agility,
      defenderInt: defender.calculatedStats.intelligence,
      defenderFaith: defender.calculatedStats.faith,
      status: "IN_PROGRESS"
    });

    await repo.save(newDuel);
    res.status(201).json(newDuel);
  } catch (error) {
    res.status(400).json({ message: "Failed to initiate challenge." });
  }
}

// Attack action: Strength + Agility, 1s cooldown
export async function attack(req: Request, res: Response) {
  const { duelId } = req.params;
  const loggedInUserId = (req as any).user.userId;
  const token = req.headers.authorization as string;
  const repo = AppDataSource.getRepository(Duel);

  try {
    const duel = await repo.findOne({ where: { id: duelId, status: "IN_PROGRESS" } });
    if (!duel) return res.status(404).json({ message: "Duel not found" });

    // DRAW CHECK: 5 minute limit
    const duration = (new Date().getTime() - new Date(duel.createdAt).getTime()) / 1000 / 60;
    if (duration > 5) {
      duel.status = "DRAW";
      await repo.save(duel);
      return res.status(200).json({ message: "Duel ended in a draw", status: "DRAW" });
    }

    const isAttacker = duel.attackerId === loggedInUserId;
    const isDefender = duel.defenderId === loggedInUserId;
    if (!isAttacker && !isDefender) return res.status(403).json({ message: "Not a participant" });

    const now = new Date();
    if (duel.lastAttackAt && now.getTime() - new Date(duel.lastAttackAt).getTime() < 1000) {
      return res.status(429).json({ message: "Attack cooldown (1s)" });
    }

    let damage = isAttacker ? (duel.attackerStr + duel.attackerAgi) : (duel.defenderStr + duel.defenderAgi);
    if (isAttacker) duel.defenderHp -= damage; else duel.attackerHp -= damage;

    duel.lastAttackAt = now;

    if (duel.attackerHp <= 0 || duel.defenderHp <= 0) {
      duel.status = "FINISHED";
      duel.winnerId = duel.attackerHp > 0 ? duel.attackerId : duel.defenderId;
      const loserId = duel.winnerId === duel.attackerId ? duel.defenderId : duel.attackerId;
      await handleDuelEnd(duel, duel.winnerId, loserId, token); // Item transfer
    }

    await repo.save(duel);
    return res.status(200).json(duel);
  } catch (err) { return res.status(500).json({ message: "Attack error" }); }
}

// Cast action: 2 * Intelligence, 2s cooldown
export async function cast(req: Request, res: Response) {
  const { duelId } = req.params;
  const loggedInUserId = (req as any).user.userId;
  const token = req.headers.authorization as string;
  const repo = AppDataSource.getRepository(Duel);

  try {
    const duel = await repo.findOne({ where: { id: duelId, status: "IN_PROGRESS" } });
    if (!duel) return res.status(404).json({ message: "Duel not found" });

    const isAttacker = duel.attackerId === loggedInUserId;
    const now = new Date();
    if (duel.lastCastAt && now.getTime() - new Date(duel.lastCastAt).getTime() < 2000) {
      return res.status(429).json({ message: "Cast cooldown (2s)" });
    }

    let damage = isAttacker ? duel.attackerInt * 2 : duel.defenderInt * 2;
    if (isAttacker) duel.defenderHp -= damage; else duel.attackerHp -= damage;

    duel.lastCastAt = now;

    if (duel.attackerHp <= 0 || duel.defenderHp <= 0) {
      duel.status = "FINISHED";
      duel.winnerId = duel.attackerHp > 0 ? duel.attackerId : duel.defenderId;
      const loserId = duel.winnerId === duel.attackerId ? duel.defenderId : duel.attackerId;
      await handleDuelEnd(duel, duel.winnerId, loserId, token);
    }

    await repo.save(duel);
    return res.status(200).json(duel);
  } catch (err) { return res.status(500).json({ message: "Cast error" }); }
}

// Heal action: Faith-based, 2s cooldown
export async function heal(req: Request, res: Response) {
  const { duelId } = req.params;
  const loggedInUserId = (req as any).user.userId;
  const repo = AppDataSource.getRepository(Duel);

  try {
    const duel = await repo.findOne({ where: { id: duelId, status: "IN_PROGRESS" } });
    if (!duel) return res.status(404).json({ message: "Duel not found" });

    const isAttacker = duel.attackerId === loggedInUserId;
    const now = new Date();
    if (duel.lastHealAt && now.getTime() - new Date(duel.lastHealAt).getTime() < 2000) {
      return res.status(429).json({ message: "Heal cooldown (2s)" });
    }

    let healAmount = isAttacker ? duel.attackerFaith : duel.defenderFaith;
    if (isAttacker) duel.attackerHp += healAmount; else duel.defenderHp += healAmount;

    duel.lastHealAt = now;
    await repo.save(duel);
    return res.status(200).json(duel);
  } catch (err) { return res.status(500).json({ message: "Heal error" }); }
}

// Helper: Transfers a random item from loser to winner via Character Service
async function handleDuelEnd(duel: Duel, winnerId: string, loserId: string, token: string) {
  try {
    const loserRes = await axios.get(`${CHARACTER_SERVICE_URL}/character/${loserId}`, {
      headers: { Authorization: token }
    });
    const items = loserRes.data.items;
    if (items && items.length > 0) {
      const randomItem = items[Math.floor(Math.random() * items.length)];
      await axios.post(`${CHARACTER_SERVICE_URL}/items/gift`, {
        senderId: loserId,
        receiverId: winnerId,
        itemId: randomItem.id
      }, { headers: { Authorization: token } });
    }
  } catch (error) {
    console.error("Duel reward transfer failed:", error);
  }
}