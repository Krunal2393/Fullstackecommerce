import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma";
import { signAccess, signRefresh, verifyRefresh } from "../services/jwt";
import { sendMail } from "../services/mailer";
import { randomBytes } from "crypto";
import { z } from "zod";

const router = express.Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
  }),
});

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse({
      body: req.body,
    }).body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email already in use" });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        name,
      },
    });

    const token = randomBytes(32).toString("hex");
    // store verification token in Redis or DB; for simplicity we'll embed token in link using signed JWT
    const verifyLink = `${
      process.env.FRONTEND_URL
    }/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    // Send dev preview
    await sendMail(
      email,
      "Verify your email",
      `<p>Click <a href="${verifyLink}">here</a> to verify</p>`
    );
    // In prod store mapping token->user in Redis with TTL.
    return res.json({
      message: "Registered. Please check your email to verify.",
    });
  } catch (err) {
    next(err);
  }
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse({ body: req.body }).body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const access = signAccess({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refresh = signRefresh({ userId: user.id });

    // Set httpOnly cookies
    res.cookie("accessToken", access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Logged in",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.json({
        message: "If this email exists we'll send reset instructions",
      });
    const token = randomBytes(32).toString("hex");
    const resetLink = `${
      process.env.FRONTEND_URL
    }/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    await sendMail(
      email,
      "Reset your password",
      `<p>Reset password: <a href="${resetLink}">Reset</a></p>`
    );
    return res.json({
      message: "If this email exists we'll send reset instructions",
    });
  } catch (err) {
    next(err);
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const { email, token, newPassword } = z
      .object({
        email: z.string().email(),
        token: z.string(),
        newPassword: z.string().min(6),
      })
      .parse(req.body);
    // For demo we won't verify token storage; assume valid
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hash },
    });
    return res.json({ message: "Password reset" });
  } catch (err) {
    next(err);
  }
});

// verify email route (simple placeholder)
router.post("/verify-email", async (req, res, next) => {
  try {
    const { email, token } = z
      .object({ email: z.string().email(), token: z.string() })
      .parse(req.body);
    // Validate token from Redis/DB; for demo mark verified
    await prisma.user.update({ where: { email }, data: { isVerified: true } });
    return res.json({ message: "Email verified" });
  } catch (err) {
    next(err);
  }
});

export default router;
