import { Router } from "express";
import { env } from "../../config/env";
import { loginHandler, serviceTokenHandler } from "./authController";
import { authenticate } from "./authenticate";
import { authorizeRoles } from "./authorize";
import { createRateLimiter } from "../../infra/security/rateLimit";
import { asyncHandler } from "../../shared/utils";

const router = Router({ mergeParams: true });

const loginLimiter = createRateLimiter({
  limit: env.rateLimitLoginMax,
  keyPrefix: "auth:login",
});
const serviceTokenLimiter = createRateLimiter({
  limit: env.rateLimitServiceTokenMax,
  keyPrefix: "auth:service-token",
});

router.post("/login", loginLimiter, asyncHandler(loginHandler));
router.post(
  "/service-token",
  authenticate,
  authorizeRoles("admin"),
  serviceTokenLimiter,
  asyncHandler(serviceTokenHandler)
);

export default router;
