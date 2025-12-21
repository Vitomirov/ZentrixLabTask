import express from 'express';
import { jwtMiddleware } from './middlewares/jwt.middleware';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({service: 'character-service', status: 'ok' });
});

app.get("/me", jwtMiddleware, (req, res) => {
  res.json({
    userId: req.user?.id,
    role: req.user?.role
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Main service running on port ${PORT}`);
});