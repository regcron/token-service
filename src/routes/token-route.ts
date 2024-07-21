import express from "express";

// Import controllers from
import { getToken } from "@/controllers/token-controller";

// Setup router
const router = express.Router();

// Token route
router.get("/", getToken);

// Export router
export default router;
