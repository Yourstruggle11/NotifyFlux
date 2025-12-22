import { Router } from "express";
import { loginHandler, serviceTokenHandler } from "./authController";
import { authenticate } from "./authenticate";
import { authorizeRoles } from "./authorize";
import { asyncHandler } from "../../shared/utils";

const router = Router({ mergeParams: true });

router.post("/login", asyncHandler(loginHandler));
router.post("/service-token", authenticate, authorizeRoles("admin"), asyncHandler(serviceTokenHandler));

export default router;
