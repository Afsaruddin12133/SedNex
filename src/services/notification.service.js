const Notification = require("../models/Notification");

const createGlobalNotification = async ({
  title,
  message,
  type = "info",
  entityType,
  entityId,
}) => {
  return Notification.create({
    title,
    message,
    type,
    entityType,
    entityId,
  });
};

const safeCreateGlobalNotification = async (payload) => {
  try {
    return await createGlobalNotification(payload);
  } catch (error) {
    console.error("Create Notification Error:", error);
    return null;
  }
};

module.exports = {
  createGlobalNotification,
  safeCreateGlobalNotification,
};
