import express from "express";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notification.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(verifyToken);


router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);

router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);

router.delete("/:id", deleteNotification);
router.delete("/", deleteAllNotifications);


export default router;


// GET    /notifications - Get notifications 
// GET    /notifications/unread-count // Get unread count

// PATCH  /notifications/:id/read     // Mark one as read
// PATCH  /notifications/read-all     // Mark all as read

// DELETE /notifications/:id          // Delete one
// DELETE /notifications              // Delete all