import express from "express";
import { prisma } from "../utils/prisma";
import { z } from "zod";
import Redis from "ioredis";
import multer from "multer";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = express.Router();
const redis = new Redis(process.env.REDIS_URL);

const upload = multer({ dest: "uploads/" });

router.get("/", async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 12);
    const search = String(req.query.search || "");
    const category = String(req.query.category || "");
    const sort = String(req.query.sort || "createdAt");

    const cacheKey = `products:${page}:${limit}:${search}:${category}:${sort}`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (category) where.category = { slug: category };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sort as string]: "desc" },
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    const result = { page, limit, total, items };
    await redis.set(cacheKey, JSON.stringify(result), "EX", 60 * 5); // 5 min
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const cacheKey = `product:${id}`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    await redis.set(cacheKey, JSON.stringify(product), "EX", 60 * 5);
    res.json(product);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const payload = z
      .object({
        name: z.string(),
        description: z.string().optional(),
        price: z.string().transform(Number),
        stockQuantity: z.number().int().default(0),
        categoryId: z.number(),
      })
      .parse(req.body);

    const created = await prisma.product.create({ data: payload });
    // invalidate product list cache
    await redis
      .keys("products:*")
      .then((keys) => Promise.all(keys.map((k) => redis.del(k))));
    res.json(created);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updated = await prisma.product.update({ where: { id }, data });
    await redis.del(`product:${id}`);
    await redis
      .keys("products:*")
      .then((keys) => Promise.all(keys.map((k) => redis.del(k))));
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.product.delete({ where: { id } });
    await redis.del(`product:${id}`);
    await redis
      .keys("products:*")
      .then((keys) => Promise.all(keys.map((k) => redis.del(k))));
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/:id/upload-image",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!req.file) return res.status(400).json({ error: "No file" });
      // For demo store local path; production should upload to Cloudinary/S3
      const url = `/uploads/${req.file.filename}`;
      await prisma.product.update({ where: { id }, data: { imageUrl: url } });
      await redis.del(`product:${id}`);
      res.json({ url });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
