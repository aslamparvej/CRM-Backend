import express from "express";

import {
  createUser,
  getUsers,
  getUser,
  getAgents,
  updateUser,
  toggleUserStatus,
  deleteUser
} from "../controllers/user.controller.js";
import { verifyToken, authorizedRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  authorizedRoles("admin", "sub-admin"),
  createUser,
);
router.get("/", verifyToken, authorizedRoles("admin", "sub-admin"), getUsers);
router.get("/:id", verifyToken, authorizedRoles("admin", "sub-admin"), getUser);
router.get(
  "/agents/list",
  verifyToken,
  authorizedRoles("admin", "sub-admin"),
  getAgents,
);
router.put("/:id", verifyToken, authorizedRoles("admin", "sub-admin"), updateUser);
router.patch("/:id/status", verifyToken, authorizedRoles("admin"), toggleUserStatus);
router.delete("/:id", verifyToken, authorizedRoles("admin"), deleteUser);

export default router;
