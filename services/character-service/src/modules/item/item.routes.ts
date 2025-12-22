import { Router } from "express";
import { createItem, getItemDetails, grantItem } from "./item.controller";
import { jwtMiddleware } from "../../middlewares/jwt.middleware";

const router = Router();

router.post("/", jwtMiddleware, createItem);
router.get("/:id", jwtMiddleware, getItemDetails);
router.post("/grant", jwtMiddleware, grantItem);

export default router;