import express from "express";
import { register, login, getMe, updateProfile, getUsers } from "../controllers/authController";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "../../../shared/src/constants";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", authenticate, getMe);
router.put("/profile", authenticate, updateProfile);

// Admin only routes
router.get("/users", authenticate, authorize(UserRole.ADMIN), getUsers);

export default router;
