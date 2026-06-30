import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  destroy,
  index,
  store,
  update,
} from "../controllers/task.controller.js";

const router = Router();

router.use(protect);

router.get("/", index);
router.post("/", store);
router.put("/:id", update);
router.delete("/:id", destroy);

export default router;
