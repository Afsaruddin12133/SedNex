const Notification = require("../models/Notification");

const normalizeString = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : undefined;
};

const getNotifications = async (req, res) => {
  try {
    const userId = req.authUser?.userId;
    const notifications = await Notification.find().sort({ createdAt: -1 });

    const items = notifications.map((item) => {
      const isRead = userId
        ? item.readBy.some((id) => id.toString() === String(userId))
        : false;

      return {
        ...item.toObject(),
        isRead,
      };
    });

    const unreadCount = userId
      ? notifications.filter(
          (item) => !item.readBy.some((id) => id.toString() === String(userId))
        ).length
      : 0;

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications: items,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

const createNotification = async (req, res) => {
  try {
    const title = normalizeString(req.body?.title);
    const message = normalizeString(req.body?.message);
    const type = normalizeString(req.body?.type) || "info";
    const entityType = normalizeString(req.body?.entityType);
    const entityId = req.body?.entityId;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "title is required",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "message is required",
      });
    }

    const notification = await Notification.create({
      title,
      message,
      type,
      entityType,
      entityId,
    });

    return res.status(201).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Create Notification Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create notification",
    });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.authUser?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    const hasRead = notification.readBy.some(
      (item) => item.toString() === String(userId)
    );

    if (!hasRead) {
      notification.readBy.push(userId);
      await notification.save();
    }

    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notification",
    });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.authUser?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await Notification.updateMany(
      { readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark All Notifications Read Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update notifications",
    });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
};
