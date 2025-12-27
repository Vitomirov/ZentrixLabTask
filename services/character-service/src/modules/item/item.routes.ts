import { Router } from "express";
import { createItem, getItemDetails, getItems, grantItem, giftItem } from "./item.controller";
import { jwtMiddleware } from "../../middlewares/jwt.middleware";

const router = Router();

router.post("/", jwtMiddleware, createItem);
router.get("/", jwtMiddleware, getItems);
router.get("/:id", jwtMiddleware, getItemDetails);
router.post("/grant", jwtMiddleware, grantItem);
router.post("/gift", jwtMiddleware, giftItem);

export default router;