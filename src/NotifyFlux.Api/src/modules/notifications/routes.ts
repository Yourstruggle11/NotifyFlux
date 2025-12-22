import { Router } from "express";
import { authenticate } from "../auth/authenticate";
import { authorizeRoles } from "../auth/authorize";
import { createNotificationHandler, emitSystemEventHandler, listNotifications, markAllAsSeenHandler } from "./controller";
import { asyncHandler } from "../../shared/utils";

const router = Router({ mergeParams: true });

router.get("/", authenticate, authorizeRoles("user", "admin"), asyncHandler(listNotifications));
router.post("/", authenticate, authorizeRoles("admin", "service"), asyncHandler(createNotificationHandler));
router.post("/mark-all-seen", authenticate, authorizeRoles("user", "admin"), asyncHandler(markAllAsSeenHandler));
router.post("/system-event", authenticate, authorizeRoles("admin"), asyncHandler(emitSystemEventHandler));

export default router;
