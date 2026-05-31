import { Router } from "express";
import authRouter from "../modules/auth/auth.route.js";
import usersRouter from "../modules/users/users.route.js";
import portfoliosRouter from "../modules/portfolios/portfolios.route.js";
import projectsRouter from "../modules/projects/projects.route.js";
import healthRouter from "./health.route.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/portfolios", portfoliosRouter);
router.use("/projects", projectsRouter);

export default router;
