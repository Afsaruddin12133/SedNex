const LocalTour = require("../models/LocalTour");

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

const getImageValue = (req) => {
  return req.file?.path || normalizeString(req.body?.image) || normalizeString(req.body?.tourImage);
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
    const image = getImageValue(req);

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Tour image is required",
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Tour title is required",
      });
    }

    if (!tourDate || !tourDistance || !tourDuration || !tourBegins || !tourReturn) {
      return res.status(400).json({
        success: false,
        message: "Tour information is required",
      });
    }

    if (tourTicketPrice === undefined || Number.isNaN(tourTicketPrice) || tourTicketPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Tour ticket price must be a non-negative number",
      });
    }

    if (!includedWithTickets || includedWithTickets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Included with tickets must have at least one item",
      });
    }

    if (!locationDetails) {
      return res.status(400).json({
        success: false,
        message: "Tour location details are required",
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
    const image = getImageValue(req);

    const updateDoc = {};

    if (title !== undefined) {
      if (!title) {
        return res.status(400).json({
          success: false,
          message: "Tour title cannot be empty",
        });
      }
      updateDoc.title = title;
    }

    if (locationDetails !== undefined) {
      if (!locationDetails) {
        return res.status(400).json({
          success: false,
          message: "Tour location details cannot be empty",
        });
      }
      updateDoc.locationDetails = locationDetails;
    }

    if (tourDate !== undefined) {
      if (!tourDate) {
        return res.status(400).json({
          success: false,
          message: "Tour date cannot be empty",
        });
      }
      updateDoc["info.date"] = tourDate;
    }

    if (tourDistance !== undefined) {
      if (!tourDistance) {
        return res.status(400).json({
          success: false,
          message: "Tour distance cannot be empty",
        });
      }
      updateDoc["info.distance"] = tourDistance;
    }

    if (tourDuration !== undefined) {
      if (!tourDuration) {
        return res.status(400).json({
          success: false,
          message: "Tour duration cannot be empty",
        });
      }
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
      if (!tourTicketPriceTag) {
        return res.status(400).json({
          success: false,
          message: "Tour ticket price tag cannot be empty",
        });
      }
      updateDoc["info.ticketPriceTag"] = tourTicketPriceTag;
    }

    if (tourBegins !== undefined) {
      if (!tourBegins) {
        return res.status(400).json({
          success: false,
          message: "Tour begins cannot be empty",
        });
      }
      updateDoc["info.begins"] = tourBegins;
    }

    if (tourReturn !== undefined) {
      if (!tourReturn) {
        return res.status(400).json({
          success: false,
          message: "Tour return cannot be empty",
        });
      }
      updateDoc["info.returnTime"] = tourReturn;
    }

    if (includedWithTickets !== undefined) {
      updateDoc.includedWithTickets = includedWithTickets;
    }

    if (image !== undefined) {
      if (!image) {
        return res.status(400).json({
          success: false,
          message: "Tour image cannot be empty",
        });
      }
      updateDoc.image = image;
    }

    if (Object.keys(updateDoc).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
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
