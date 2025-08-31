import express from "express";
import Redis from "ioredis";
import { prisma } from "../utils/prisma";
import { requireAuth } from "../middleware/auth";
import { randomBytes } from "crypto";

const router = express.Router();
const redis = new Redis(process.env.REDIS_URL);

function cartKey(sessionId: string) {
  return `cart:${sessionId}`;
}

router.get("/", async (req: any, res, next) => {
  try {
    const sessionId =
      req.cookies?.sessionId ||
      req.headers["x-session-id"] ||
      randomBytes(12).toString("hex");
    if (!req.cookies?.sessionId) {
      res.cookie("sessionId", sessionId, { httpOnly: true });
    }
    const raw = await redis.get(cartKey(sessionId));
    const cart = raw ? JSON.parse(raw) : [];
    res.json({ sessionId, items: cart });
  } catch (err) {
    next(err);
  }
});

router.post("/add", async (req: any, res, next) => {
  try {
    const { sessionId, productId, quantity } = req.body;
    const sid =
      sessionId || req.cookies?.sessionId || randomBytes(12).toString("hex");
    const key = cartKey(sid);
    const raw = await redis.get(key);
    const cart = raw ? JSON.parse(raw) : [];
    const idx = cart.findIndex((i: any) => i.productId === productId);
    if (idx >= 0) cart[idx].quantity += quantity;
    else cart.push({ productId, quantity });
    await redis.set(key, JSON.stringify(cart), "EX", 60 * 60 * 24 * 7);
    res.cookie("sessionId", sid, { httpOnly: true });
    res.json({ sessionId: sid, items: cart });
  } catch (err) {
    next(err);
  }
});

router.put("/update", async (req, res, next) => {
  try {
    const { sessionId, productId, quantity } = req.body;
    const sid = sessionId || req.cookies?.sessionId;
    if (!sid) return res.status(400).json({ error: "No session" });
    const key = cartKey(sid);
    const raw = await redis.get(key);
    const cart = raw ? JSON.parse(raw) : [];
    const idx = cart.findIndex((i: any) => i.productId === productId);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    cart[idx].quantity = quantity;
    await redis.set(key, JSON.stringify(cart), "EX", 60 * 60 * 24 * 7);
    res.json({ items: cart });
  } catch (err) {
    next(err);
  }
});

router.delete("/:itemId", async (req, res, next) => {
  try {
    const sid = req.cookies?.sessionId;
    const key = cartKey(sid);
    const raw = await redis.get(key);
    const cart = raw ? JSON.parse(raw) : [];
    const newCart = cart.filter(
      (i: any) => i.productId != Number(req.params.itemId)
    );
    await redis.set(key, JSON.stringify(newCart), "EX", 60 * 60 * 24 * 7);
    res.json({ items: newCart });
  } catch (err) {
    next(err);
  }
});

router.delete("/clear", async (req, res, next) => {
  try {
    const sid = req.cookies?.sessionId;
    if (!sid) return res.json({ items: [] });
    await redis.del(cartKey(sid));
    res.json({ items: [] });
  } catch (err) {
    next(err);
  }
});

export default router;
