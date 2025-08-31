import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import productsRoutes from "./routes/products";
import categoriesRoutes from "./routes/categories";
import cartRoutes from "./routes/cart";
import ordersRoutes from "./routes/orders";
import userRoutes from "./routes/user";
import adminRoutes from "./routes/admin";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { errorHandler } from "./middleware/errorHandler";
import { createRateLimiter } from "./middleware/rateLimiter";

dotenv.config();

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use("/uploads", express.static("uploads"));

// rate limiter
app.use("/api/auth/login", createRateLimiter({ max: 10, windowMs: 60 * 1000 }));
app.use(
  "/api/auth/register",
  createRateLimiter({ max: 5, windowMs: 60 * 1000 })
);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

// Swagger
const swaggerDoc = YAML.load("./docs/openapi.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.get("/mail/preview", async (req, res) => {
  // Serve static sample email for dev preview
  res.sendFile("docs/email_templates/welcome.html", { root: process.cwd() });
});

app.use(errorHandler);

export default app;
