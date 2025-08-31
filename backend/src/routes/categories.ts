import express from "express";
import { prisma } from "../utils/prisma";
import { requireAuth, requireAdmin } from "../middleware/auth";
import slugify from "slugify";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const cats = await prisma.category.findMany();
    res.json(cats);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const slug = slugify(name, { lower: true });
    const created = await prisma.category.create({
      data: { name, description, slug },
    });
    res.json(created);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;
    const slug = slugify(name, { lower: true });
    const updated = await prisma.category.update({
      where: { id },
      data: { name, description, slug },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.category.delete({ where: { id } });
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
