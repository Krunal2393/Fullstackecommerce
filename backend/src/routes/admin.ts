import { Router, Request, Response } from "express";

const router = Router();

// Example: get logged-in user profile
router.get("/profile", (req: Request, res: Response) => {
  // Here you would fetch user details from DB using req.user.id
  res.json({
    id: 1,
    name: "John Doe",
    email: "john@example.com",
  });
});

// Example: update user profile
router.put("/profile", (req: Request, res: Response) => {
  const { name, email } = req.body;
  // Update DB logic here
  res.json({
    message: "Profile updated successfully",
    user: { name, email },
  });
});

export default router;
