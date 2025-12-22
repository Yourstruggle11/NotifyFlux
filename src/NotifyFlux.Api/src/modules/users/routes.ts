import { Router } from "express";
import { authenticate } from "../auth/authenticate";
import { authorizeRoles } from "../auth/authorize";
import { createUserHandler, meHandler } from "./controller";
import { asyncHandler } from "../../shared/utils";

const router = Router({ mergeParams: true });

router.post("/", authenticate, authorizeRoles("admin"), asyncHandler(createUserHandler));
router.get("/me", authenticate, authorizeRoles("user", "admin"), asyncHandler(meHandler));

export default router;
