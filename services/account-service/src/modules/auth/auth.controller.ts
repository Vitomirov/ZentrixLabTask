import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import ms from "ms";
import { AppDataSource } from "../../config/db";
import { User } from "../../entities/User";

export async function register(req: Request, res: Response) {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const userRepo = AppDataSource.getRepository(User);

    const existing = await userRepo.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = userRepo.create({
      username,
      password: hashedPassword,
      role: role === "GameMaster" ? "GameMaster" : "User",
    });

    await userRepo.save(user);

    return res.status(201).json({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    const payload = { userId: user.id, role: user.role };

    let expiresIn: number | undefined;
    if (process.env.JWT_EXPIRES_IN) {
      const msValue = ms(process.env.JWT_EXPIRES_IN as ms.StringValue);
      expiresIn = msValue ? Math.floor(msValue / 1000) : undefined;
    }

    const options: SignOptions = { expiresIn };

    const token = jwt.sign(payload, secret, options);

    return res.json({ token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
