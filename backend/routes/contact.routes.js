import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  destroy,
  index,
  show,
  store,
  update,
} from "../controllers/contact.controller.js";

const router = Router();

router.use(protect);

router.get("/", index);
router.post("/", store);
router.get("/:id", show);
router.put("/:id", update);
router.delete("/:id", destroy);

export default router;
