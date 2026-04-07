const TouristSpot = require("../models/TouristSpot");
const User = require("../models/User");

const createTouristSpot = async (req, res) => {
  try {
    const { title, description } = req.body;

    const { userId } = req.authUser;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const spot = await TouristSpot.create({
      title,
      description,
      image: req.file?.path,
      author: user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Tourist spot created successfully",
      spot,
    });
  } catch (error) {
    console.error("Create Tourist Spot Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create tourist spot",
    });
  }
};

const getTouristSpots = async (req, res) => {
  try {

    const spots = await TouristSpot.find()
      .populate("author", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: spots.length,
      spots,
    });
  } catch (error) {
    console.error("Get Tourist Spots Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tourist spots",
    });
  }
};

const getTouristSpotById = async (req, res) => {
  try {

    const { touristId } = req.params;
    const spot = await TouristSpot.findById(touristId).populate(
      "author",
      "name email role"
    );

    if (!spot) {
      return res.status(404).json({
        success: false,
        message: "Tourist spot not found",
      });
    }

    return res.status(200).json({
      success: true,
      spot,
    });
  } catch (error) {
    console.error("Get Tourist Spot Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tourist spot",
    });
  }
};

const updateTouristSpot = async (req, res) => {
  try {
    const { touristId } = req.params;
    const { title, description } = req.body;

    const { userId } = req.authUser;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin" && user.role !== "user") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const spot = await TouristSpot.findById(touristId);

    if (!spot) {
      return res.status(404).json({
        success: false,
        message: "Tourist spot not found",
      });
    }

    const isOwner = spot.author.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own tourist spot",
      });
    }

    if (title !== undefined) {
      spot.title = title;
    }

    if (description !== undefined) {
      spot.description = description;
    }

    if (req.file && req.file.path) {
      spot.image = req.file.path;
    }

    await spot.save();

    return res.status(200).json({
      success: true,
      message: "Tourist spot updated successfully",
      spot,
    });
  } catch (error) {
    console.error("Update Tourist Spot Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update tourist spot",
    });
  }
};

const deleteTouristSpot = async (req, res) => {
  try {
    const { touristId } = req.params;

    const spot = await TouristSpot.findById(touristId);

    if (!spot) {
      return res.status(404).json({
        success: false,
        message: "Tourist spot not found",
      });
    }

    await TouristSpot.findByIdAndDelete(touristId);

    return res.status(200).json({
      success: true,
      message: "Tourist spot deleted successfully",
    });
  } catch (error) {
    console.error("Delete Tourist Spot Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete tourist spot",
    });
  }
};

module.exports = {
  createTouristSpot,
  getTouristSpots,
  getTouristSpotById,
  updateTouristSpot,
  deleteTouristSpot,
};
