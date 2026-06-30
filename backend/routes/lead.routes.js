import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  destroy,
  index,
  reOrder,
  show,
  store,
  update,
} from "../controllers/lead.controller.js";

const router = Router();

router.use(protect);

router.patch("/reorder", reOrder);
router.get("/", index);
router.post("/", store);
router.get("/:id", show);
router.put("/:id", update);
router.delete("/:id", destroy);

export default router;
