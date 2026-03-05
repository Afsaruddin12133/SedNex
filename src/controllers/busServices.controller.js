const BusService = require("../models/BusService");

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
  return req.file?.path || req.file?.secure_url || normalizeString(req.body?.busImage);
};

const createBusService = async (req, res) => {
  try {
    const busName = normalizeString(req.body?.busName);
    const busImage = getImageValue(req);
    const busSitNo = normalizeNumber(req.body?.busSitNo);
    const rentalDetails = normalizeStringArray(req.body?.rentalDetails);
    const note = normalizeString(req.body?.note);
    const aboutBusServices = normalizeString(req.body?.aboutBusServices);
    const contactNumber = normalizeString(req.body?.contactNumber);

    if (!busName) {
      return res.status(400).json({
        success: false,
        message: "Bus name is required",
      });
    }

    if (!busImage) {
      return res.status(400).json({
        success: false,
        message: "Bus image is required",
      });
    }

    if (busSitNo === undefined || Number.isNaN(busSitNo) || busSitNo < 1) {
      return res.status(400).json({
        success: false,
        message: "Bus seat number must be a positive number",
      });
    }

    if (!rentalDetails || rentalDetails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Rental details must have at least one item",
      });
    }

    if (!note) {
      return res.status(400).json({
        success: false,
        message: "Note is required",
      });
    }

    if (!aboutBusServices) {
      return res.status(400).json({
        success: false,
        message: "About bus services is required",
      });
    }

    if (!contactNumber) {
      return res.status(400).json({
        success: false,
        message: "Contact number is required",
      });
    }

    const busService = await BusService.create({
      busName,
      busImage,
      busSitNo,
      rentalDetails,
      note,
      aboutBusServices,
      contactNumber,
    });

    return res.status(201).json({
      success: true,
      message: "Bus service created successfully",
      busService,
    });
  } catch (error) {
    console.error("Create Bus Service Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create bus service",
    });
  }
};

const getBusServices = async (req, res) => {
  try {
    const services = await BusService.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: services.length,
      services,
    });
  } catch (error) {
    console.error("Get Bus Services Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bus services",
    });
  }
};

const updateBusService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const busName = normalizeString(req.body?.busName);
    const busImage = getImageValue(req);
    const busSitNo = normalizeNumber(req.body?.busSitNo);
    const rentalDetails = normalizeStringArray(req.body?.rentalDetails);
    const note = normalizeString(req.body?.note);
    const aboutBusServices = normalizeString(req.body?.aboutBusServices);
    const contactNumber = normalizeString(req.body?.contactNumber);

    const updateDoc = {};

    if (busName !== undefined) {
      if (!busName) {
        return res.status(400).json({
          success: false,
          message: "Bus name cannot be empty",
        });
      }
      updateDoc.busName = busName;
    }

    if (busImage !== undefined) {
      if (!busImage) {
        return res.status(400).json({
          success: false,
          message: "Bus image cannot be empty",
        });
      }
      updateDoc.busImage = busImage;
    }

    if (busSitNo !== undefined) {
      if (Number.isNaN(busSitNo) || busSitNo < 1) {
        return res.status(400).json({
          success: false,
          message: "Bus seat number must be a positive number",
        });
      }
      updateDoc.busSitNo = busSitNo;
    }

    if (rentalDetails !== undefined) {
      if (!rentalDetails || rentalDetails.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Rental details must have at least one item",
        });
      }
      updateDoc.rentalDetails = rentalDetails;
    }

    if (note !== undefined) {
      if (!note) {
        return res.status(400).json({
          success: false,
          message: "Note cannot be empty",
        });
      }
      updateDoc.note = note;
    }

    if (aboutBusServices !== undefined) {
      if (!aboutBusServices) {
        return res.status(400).json({
          success: false,
          message: "About bus services cannot be empty",
        });
      }
      updateDoc.aboutBusServices = aboutBusServices;
    }

    if (contactNumber !== undefined) {
      if (!contactNumber) {
        return res.status(400).json({
          success: false,
          message: "Contact number cannot be empty",
        });
      }
      updateDoc.contactNumber = contactNumber;
    }

    if (Object.keys(updateDoc).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const busService = await BusService.findByIdAndUpdate(
      serviceId,
      { $set: updateDoc },
      { new: true, runValidators: true }
    );

    if (!busService) {
      return res.status(404).json({
        success: false,
        message: "Bus service not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bus service updated successfully",
      busService,
    });
  } catch (error) {
    console.error("Update Bus Service Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update bus service",
    });
  }
};

const deleteBusService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const busService = await BusService.findByIdAndDelete(serviceId);

    if (!busService) {
      return res.status(404).json({
        success: false,
        message: "Bus service not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bus service deleted successfully",
    });
  } catch (error) {
    console.error("Delete Bus Service Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete bus service",
    });
  }
};

module.exports = {
  createBusService,
  getBusServices,
  updateBusService,
  deleteBusService,
};
