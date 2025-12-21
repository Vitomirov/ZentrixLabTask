import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  role: "User" | "GameMaster";
}

export function jwtMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    req.user = {
      id: payload.userId,
      role: payload.role
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
