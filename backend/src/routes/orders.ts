import express from "express";
import { prisma } from "../utils/prisma";
import { requireAuth, requireAdmin } from "../middleware/auth";
import Redis from "ioredis";
import { prisma as prismaClient } from "../utils/prisma";
import { sendMail } from "../services/mailer";

const router = express.Router();
const redis = new Redis(process.env.REDIS_URL);

router.get("/", requireAuth, async (req: any, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: Number(req.user.userId) },
      include: { items: true },
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.post("/create", requireAuth, async (req: any, res, next) => {
  const { items, shippingAddress } = req.body;
  const userId = req.user?.userId;

  if (!items || !items.length) {
    return res.status(400).json({ error: "Cart empty" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const productIds = items.map((i: any) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      let total = 0;
      const orderItems = items.map((i: any) => {
        const p = products.find((x) => x.id === i.productId);
        if (!p)
          throw { status: 400, message: `Product ${i.productId} not found` };
        if (p.stockQuantity < i.quantity)
          throw { status: 400, message: `Insufficient stock for ${p.name}` };

        const subtotal = Number(p.price) * i.quantity;
        total += subtotal;

        return {
          productId: p.id,
          quantity: i.quantity,
          price: p.price,
          subtotal,
        };
      });

      const order = await tx.order.create({
        data: {
          userId: Number(userId),
          totalAmount: total.toFixed(2) as any,
          shippingAddress: shippingAddress || {},
          items: {
            create: orderItems,
          },
        },
        include: { items: true },
      });

      // decrement stock
      await Promise.all(
        orderItems.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } },
          })
        )
      );

      return order;
    });

    await sendMail(
      req.user.email,
      "Order confirmation",
      `<p>Your order #${result.id} has been placed successfully.</p>`
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Admin order list
router.get(
  "/admin/orders",
  // requireAuth,
  // requireAdmin,
  async (req, res, next) => {
    try {
      const orders = await prisma.order.findMany({
        include: {
          items: {
            include: {
              product: true, // include the product details for each item
            },
          },
        },
      });
      res.json(orders);
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  "/admin/orders/:id/status",
  // requireAuth,
  // requireAdmin,
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;
      const updated = await prisma.order.update({
        where: { id },
        data: { status },
      });
      // notify user via email
      await sendMail(
        "user@example.com",
        "Order status updated",
        `<p>Order #${id} is now ${status}</p>`
      );
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
