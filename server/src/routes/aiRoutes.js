import express from "express";
import { optimizeBuilding } from "../controllers/aiController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/optimize", authenticate, optimizeBuilding);

export default router;