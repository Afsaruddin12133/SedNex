const FlightRoute = require("../models/FlightRoute");

const normalizeString = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : undefined;
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

const createFlightRoute = async (req, res) => {
  try {
    const from = normalizeString(req.body?.from);
    const to = normalizeString(req.body?.to);
    const via = normalizeStringArray(req.body?.via) || [];

    if (!from) {
      return res.status(400).json({
        success: false,
        message: "From location is required",
      });
    }

    if (!to) {
      return res.status(400).json({
        success: false,
        message: "To location is required",
      });
    }

    const route = await FlightRoute.create({
      from,
      via,
      to,
    });

    return res.status(201).json({
      success: true,
      message: "Flight route created successfully",
      route,
    });
  } catch (error) {
    console.error("Create Flight Route Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create flight route",
    });
  }
};

const getFlightRoutes = async (req, res) => {
  try {
    const routes = await FlightRoute.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: routes.length,
      routes,
    });
  } catch (error) {
    console.error("Get Flight Routes Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch flight routes",
    });
  }
};

const updateFlightRoute = async (req, res) => {
  try {
    const { routeId } = req.params;

    const from = normalizeString(req.body?.from);
    const to = normalizeString(req.body?.to);
    const via = normalizeStringArray(req.body?.via);

    const updateDoc = {};

    if (from !== undefined) {
      if (!from) {
        return res.status(400).json({
          success: false,
          message: "From location cannot be empty",
        });
      }
      updateDoc.from = from;
    }

    if (to !== undefined) {
      if (!to) {
        return res.status(400).json({
          success: false,
          message: "To location cannot be empty",
        });
      }
      updateDoc.to = to;
    }

    if (via !== undefined) {
      updateDoc.via = via;
    }

    if (Object.keys(updateDoc).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const route = await FlightRoute.findByIdAndUpdate(
      routeId,
      { $set: updateDoc },
      { new: true, runValidators: true }
    );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Flight route not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Flight route updated successfully",
      route,
    });
  } catch (error) {
    console.error("Update Flight Route Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update flight route",
    });
  }
};

const deleteFlightRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const route = await FlightRoute.findByIdAndDelete(routeId);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Flight route not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Flight route deleted successfully",
    });
  } catch (error) {
    console.error("Delete Flight Route Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete flight route",
    });
  }
};

module.exports = {
  createFlightRoute,
  getFlightRoutes,
  updateFlightRoute,
  deleteFlightRoute,
};
