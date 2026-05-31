import { Router } from "express";
import { register, login, me } from "./auth.controller.js";
import { validateRegister, validateLogin } from "../../validations/index.js";
import { protect } from "../../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/me", protect, me);

export default router;
