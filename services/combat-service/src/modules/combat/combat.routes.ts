import { Router } from "express";
import { challenge, attack, cast, heal } from "./combat.controller";
import { jwtMiddleware } from "../../middlewares/jwt.middleware";

const router = Router();

// Endpoint to initiate a duel between two characters
router.post("/challenge", jwtMiddleware, challenge);

// Endpoint for physical attack action (1s cooldown)
router.post("/:duelId/attack", jwtMiddleware, attack);

// Endpoint for magical cast action (2s cooldown)
router.post("/:duelId/cast", jwtMiddleware, cast);

// Endpoint for healing action (2s cooldown)
router.post("/:duelId/heal", jwtMiddleware, heal);

export default router;