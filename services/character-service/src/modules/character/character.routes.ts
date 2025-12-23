import { Router } from "express";
import { createCharacter, getAllCharacters, getCharacterById } from "./character.controller";
import { jwtMiddleware } from "../../middlewares/jwt.middleware";

const router = Router();

router.post("/", jwtMiddleware, createCharacter);
router.get("/", jwtMiddleware, getAllCharacters);
router.get("/:id", jwtMiddleware, getCharacterById);

export default router;
