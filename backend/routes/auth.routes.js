import { Router } from "express";
import {
  login,
  profile,
  register,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, profile);
router.put("/profile", protect, updateProfile);

export default router;
