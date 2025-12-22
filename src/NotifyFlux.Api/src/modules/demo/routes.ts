import { Router } from "express";
import { authenticate } from "../auth/authenticate";
import { authorizeRoles } from "../auth/authorize";
import { asyncHandler } from "../../shared/utils";
import { seedDemoHandler } from "./controller";

const router = Router({ mergeParams: true });

router.post("/seed", authenticate, authorizeRoles("admin"), asyncHandler(seedDemoHandler));

export default router;
