import { Router, Request, Response } from "express";
import { AppDataSource } from "../../config/db";
import { User, UserRole } from "../../entities/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();
const userRepo = AppDataSource.getRepository(User);

// Register
router.post("/register", async (req: Request, res: Response) => {
  const { username, password, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = userRepo.create({ username, password: hashed, role });
  await userRepo.save(user);
  res.json({ id: user.id, username: user.username, role: user.role });
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await userRepo.findOneBy({ username });
  if (!user) return res.sendStatus(401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.sendStatus(401);

  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
  res.json({ token });
});

export default router;
