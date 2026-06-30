import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getOverview } from "../controllers/analytics.controller.js";

const router = new Router();

router.use(protect);

router.get("/overview", getOverview);

export default router;
