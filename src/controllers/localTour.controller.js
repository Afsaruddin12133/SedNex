const LocalTour = require("../models/LocalTour");
const { safeCreateGlobalNotification } = require("../services/notification.service");

const normalizeString = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : undefined;
};

const normalizeNumber = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const numeric = Number(value);
  return Number.isNaN(numeric) ? NaN : numeric;
};

const normalizeStringArray = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed.length) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter((item) => item.length > 0);
      }
    } catch (error) {
      // Fallback to comma-separated parsing.
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return undefined;
};

const isValidUrl = (value) => {
  if (!value) {
    return false;
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (error) {
    return false;
  }
};

const getImageValue = (req) => {
  return req.file?.path || normalizeString(req.body?.image) || normalizeString(req.body?.tourImage);
};

const normalizeTourStatus = (value) => {
  const normalized = normalizeString(value);
  if (!normalized) {
    return undefined;
  }
  const lower = normalized.toLowerCase();
  const allowed = new Set(["running", "completed", "upcoming"]);
  return allowed.has(lower) ? lower : undefined;
};

const createLocalTour = async (req, res) => {
  try {
    const title = normalizeString(req.body?.title);
    const locationDetails = normalizeString(req.body?.locationDetails);
    const tourDate = normalizeString(req.body?.tourDate);
    const tourDistance = normalizeString(req.body?.tourDistance);
    const tourDuration = normalizeString(req.body?.tourDuration);
    const tourTicketPrice = normalizeNumber(req.body?.tourTicketPrice);
    const tourTicketPriceTag = normalizeString(req.body?.tourTicketPriceTag);
    const tourBegins = normalizeString(req.body?.tourBegins);
    const tourReturn = normalizeString(req.body?.tourReturn);
    const includedWithTickets = normalizeStringArray(req.body?.includedWithTickets);
    const privacyPolicyUrl = normalizeString(req.body?.privacyPolicyUrl);
    const tourStatus = normalizeTourStatus(req.body?.tourStatus);
    const image = getImageValue(req);

    if (tourTicketPrice !== undefined && (Number.isNaN(tourTicketPrice) || tourTicketPrice < 0)) {
      return res.status(400).json({
        success: false,
        message: "Tour ticket price must be a non-negative number",
      });
    }

    if (privacyPolicyUrl && !isValidUrl(privacyPolicyUrl)) {
      return res.status(400).json({
        success: false,
        message: "Privacy policy url must be a valid URL",
      });
    }

    const tour = await LocalTour.create({
      title,
      image,
      info: {
        date: tourDate,
        distance: tourDistance,
        duration: tourDuration,
        ticketPrice: tourTicketPrice,
        ticketPriceTag: tourTicketPriceTag,
        begins: tourBegins,
        returnTime: tourReturn,
      },
      includedWithTickets,
      locationDetails,
      privacyPolicyUrl,
      tourStatus,
    });

    await safeCreateGlobalNotification({
      title: "New local tour created",
      message: `Tour: ${tour.title}`,
      type: "local-tour",
      entityType: "local-tour",
      entityId: tour._id,
    });

    return res.status(201).json({
      success: true,
      message: "Local tour created successfully",
      tour,
    });
  } catch (error) {
    console.error("Create Local Tour Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create local tour",
    });
  }
};

const getLocalTours = async (req, res) => {
  try {
    const tours = await LocalTour.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: tours.length,
      tours,
    });
  } catch (error) {
    console.error("Get Local Tours Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch local tours",
    });
  }
};

const getLocalTourById = async (req, res) => {
  try {
    const { tourId } = req.params;
    const tour = await LocalTour.findById(tourId);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Local tour not found",
      });
    }

    return res.status(200).json({
      success: true,
      tour,
    });
  } catch (error) {
    console.error("Get Local Tour Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch local tour",
    });
  }
};

const updateLocalTour = async (req, res) => {
  try {
    const { tourId } = req.params;

    const title = normalizeString(req.body?.title);
    const locationDetails = normalizeString(req.body?.locationDetails);
    const tourDate = normalizeString(req.body?.tourDate);
    const tourDistance = normalizeString(req.body?.tourDistance);
    const tourDuration = normalizeString(req.body?.tourDuration);
    const tourTicketPrice = normalizeNumber(req.body?.tourTicketPrice);
    const tourTicketPriceTag = normalizeString(req.body?.tourTicketPriceTag);
    const tourBegins = normalizeString(req.body?.tourBegins);
    const tourReturn = normalizeString(req.body?.tourReturn);
    const includedWithTickets = normalizeStringArray(req.body?.includedWithTickets);
    const privacyPolicyUrl = normalizeString(req.body?.privacyPolicyUrl);
    const tourStatus = normalizeTourStatus(req.body?.tourStatus);
    const image = getImageValue(req);

    const updateDoc = {};

    if (title !== undefined) {
      updateDoc.title = title;
    }

    if (locationDetails !== undefined) {
      updateDoc.locationDetails = locationDetails;
    }

    if (tourDate !== undefined) {
      updateDoc["info.date"] = tourDate;
    }

    if (tourDistance !== undefined) {
      updateDoc["info.distance"] = tourDistance;
    }

    if (tourDuration !== undefined) {
      updateDoc["info.duration"] = tourDuration;
    }

    if (tourTicketPrice !== undefined) {
      if (Number.isNaN(tourTicketPrice) || tourTicketPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Tour ticket price must be a non-negative number",
        });
      }
      updateDoc["info.ticketPrice"] = tourTicketPrice;
    }

    if (tourTicketPriceTag !== undefined) {
      updateDoc["info.ticketPriceTag"] = tourTicketPriceTag;
    }

    if (tourBegins !== undefined) {
      updateDoc["info.begins"] = tourBegins;
    }

    if (tourReturn !== undefined) {
      updateDoc["info.returnTime"] = tourReturn;
    }

    if (includedWithTickets !== undefined) {
      updateDoc.includedWithTickets = includedWithTickets;
    }

    if (image !== undefined) {
      updateDoc.image = image;
    }

    if (privacyPolicyUrl !== undefined) {
      if (!isValidUrl(privacyPolicyUrl)) {
        return res.status(400).json({
          success: false,
          message: "Privacy policy url must be a valid URL",
        });
      }
      updateDoc.privacyPolicyUrl = privacyPolicyUrl;
    }

    if (req.body?.tourStatus !== undefined) {
      updateDoc.tourStatus = tourStatus;
    }

    const tour = await LocalTour.findByIdAndUpdate(
      tourId,
      { $set: updateDoc },
      { new: true, runValidators: true }
    );

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Local tour not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Local tour updated successfully",
      tour,
    });
  } catch (error) {
    console.error("Update Local Tour Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update local tour",
    });
  }
};

const deleteLocalTour = async (req, res) => {
  try {
    const { tourId } = req.params;
    const tour = await LocalTour.findByIdAndDelete(tourId);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Local tour not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Local tour deleted successfully",
    });
  } catch (error) {
    console.error("Delete Local Tour Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete local tour",
    });
  }
};

module.exports = {
  createLocalTour,
  getLocalTours,
  getLocalTourById,
  updateLocalTour,
  deleteLocalTour,
};
