const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const {
  getNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notification.controller");

const router = express.Router();

router.get(
    "/", 
    authMiddleware, 
    getNotifications
);

router.post(
    "/", 
    authMiddleware, 
    adminMiddleware, 
    createNotification
);

router.patch(
    "/read-all", 
    authMiddleware, 
    markAllNotificationsRead
);

router.patch(
    "/:id/read", 
    authMiddleware, 
    markNotificationRead
);

module.exports = router;
