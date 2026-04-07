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

const getFlightdetails = async (req, res) => {
  try {
    const flights = await BusFlight.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: flights.length,
      flights,
    });
  } catch (error) {
    console.error("Get Flight Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch flight details",
    });
  }
};

const updateFlightdetails = async (req, res) => {
  try {
    const { flightId } = req.params;

    const airlineName = normalizeString(req.body?.airlineName);
    const airlineImage = req.file?.path || req.file?.secure_url;

    const updateDoc = {};

    if (airlineName !== undefined) {
      updateDoc.airlineName = airlineName;
    }

    if (airlineImage !== undefined) {
      updateDoc.airlineImage = airlineImage;
    }

    const flightDetails = await BusFlight.findByIdAndUpdate(
      flightId,
      { $set: updateDoc },
      { new: true, runValidators: true }
    );

    if (!flightDetails) {
      return res.status(404).json({
        success: false,
        message: "Flight details not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Flight details updated successfully",
      flightDetails,
    });
  } catch (error) {
    console.error("Update Flight Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update flight details",
    });
  }
};

const deleteFlightdetails = async (req, res) => {
  try {
    const { flightId } = req.params;
    const flightDetails = await BusFlight.findByIdAndDelete(flightId);

    if (!flightDetails) {
      return res.status(404).json({
        success: false,
        message: "Flight details not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Flight details deleted successfully",
    });
  } catch (error) {
    console.error("Delete Flight Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete flight details",
    });
  }
};

module.exports = {
  createFlightdetails,
  getFlightdetails,
  updateFlightdetails,
  deleteFlightdetails,
};
