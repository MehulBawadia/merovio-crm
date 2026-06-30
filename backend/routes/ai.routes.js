import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  aiStatus,
  generateEmailDraft,
  leadSummary,
  salesInsights,
} from "../controllers/ai.controller.js";

const router = Router();

router.use(protect);

router.get("/status", aiStatus);
router.post("/lead-summary", leadSummary);
router.post("/generate-email", generateEmailDraft);
router.post("/sales-insights", salesInsights);

export default router;
