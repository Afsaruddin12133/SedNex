const BusFlight = require("../models/BusFlight");

const normalizeString = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : undefined;
};

const createFlightdetails = async (req, res) => {
  try {
    const airlineName = normalizeString(req.body?.airlineName);
    const airlineImage = req.file?.path || req.file?.secure_url;

    if (!airlineName) {
      return res.status(400).json({
        success: false,
        message: "Airline name is required",
      });
    }

    if (!airlineImage) {
      return res.status(400).json({
        success: false,
        message: "Airline image is required",
      });
    }

    const flightDetails = await BusFlight.create({
      airlineName,
      airlineImage,
    });

    return res.status(201).json({
      success: true,
      message: "Flight details created successfully",
      flightDetails,
    });
  } catch (error) {
    console.error("Create Flight Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create flight details",
    });
  }
};

module.exports = {
  createFlightdetails,
};
