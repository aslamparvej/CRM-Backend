import express from "express";

import { createUser, getUsers } from "../controllers/user.controller.js";
import { verifyToken, authorizedRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizedRoles("admin", "sub-admin"),
  createUser,
);
router.get("/", verifyToken, authorizedRoles("admin", "sub-admin"), getUsers);

export default router;
