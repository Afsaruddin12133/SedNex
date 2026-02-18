const HomepageMarquee = require("../models/HomepageMarquee");
const HomepageSlider = require("../models/HomepageSlider");

const toTrimmedString = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : undefined;
};

const createMarquee = async (req, res) => {
  try {
    const text = toTrimmedString(req.body?.text);

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Marquee text is required",
      });
    }

    await HomepageMarquee.deleteMany({});

    const marquee = await HomepageMarquee.create({
      text,
    });

    return res.status(201).json({
      success: true,
      message: "Marquee created successfully"
    });
  } catch (error) {
    console.error("Create Homepage Marquee Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create marquee",
    });
  }
};

const getPublicMarquees = async (req, res) => {
  try {
    const marquees = await HomepageMarquee.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      marquees,
    });
  } catch (error) {
    console.error("Get Public Marquees Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch marquees",
    });
  }
};


const updateMarquee = async (req, res) => {
  try {
    const { marqueeId } = req.params;
    const marquee = await HomepageMarquee.findById(marqueeId);

    if (!marquee) {
      return res.status(404).json({
        success: false,
        message: "Marquee not found",
      });
    }

    const text = toTrimmedString(req.body?.text);
    if (text !== undefined) {
      if (!text) {
        return res.status(400).json({
          success: false,
          message: "Marquee text cannot be empty",
        });
      }
      marquee.text = text;
    }

    await marquee.save();

    await HomepageMarquee.deleteMany({ _id: { $ne: marquee._id } });

    return res.status(200).json({
      success: true,
      message: "Marquee updated successfully",
      marquee,
    });
  } catch (error) {
    console.error("Update Homepage Marquee Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update marquee",
    });
  }
};


const createSlider = async (req, res) => {
  try {
    const imagePath = req.file?.path || req.file?.secure_url;
    if (!imagePath) {
      return res.status(400).json({
        success: false,
        message: "Slider image is required",
      });
    }

    const title = toTrimmedString(req.body?.title);
    const subtitle = toTrimmedString(req.body?.subtitle);
    const buttonText = toTrimmedString(req.body?.buttonText ?? req.body?.button_text);
    const buttonUrl = toTrimmedString(req.body?.buttonUrl ?? req.body?.button_url);

    let status;
    const statusInput = toTrimmedString(req.body?.status);
    if (statusInput) {
      const normalized = statusInput.toLowerCase();
      if (!STATUS_VALUES.has(normalized)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status provided",
        });
      }
      status = normalized;
    }

    let order;
    if (req.body?.order !== undefined) {
      const parsedOrder = Number(req.body.order);
      if (Number.isNaN(parsedOrder) || parsedOrder < 0) {
        return res.status(400).json({
          success: false,
          message: "Order must be a non-negative number",
        });
      }
      order = parsedOrder;
    }

    const slider = await HomepageSlider.create({
      title,
      subtitle,
      buttonText,
      buttonUrl,
      image: imagePath,
      status,
      order,
    });

    return res.status(201).json({
      success: true,
      message: "Slider created successfully",
      slider,
    });
  } catch (error) {
    console.error("Create Homepage Slider Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create slider",
    });
  }
};

const getPublicSliders = async (req, res) => {
  try {
    const sliders = await HomepageSlider.find({ status: "active" })
      .sort({ order: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      sliders,
    });
  } catch (error) {
    console.error("Get Public Sliders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sliders",
    });
  }
};

const updateSlider = async (req, res) => {
  try {
    const { sliderId } = req.params;
    const slider = await HomepageSlider.findById(sliderId);

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found",
      });
    }

    const title = toTrimmedString(req.body?.title);
    const subtitle = toTrimmedString(req.body?.subtitle);
    const buttonText = toTrimmedString(req.body?.buttonText ?? req.body?.button_text);
    const buttonUrl = toTrimmedString(req.body?.buttonUrl ?? req.body?.button_url);
    const statusInput = toTrimmedString(req.body?.status);
    const orderInput = req.body?.order;
    const imagePath = req.file?.path || req.file?.secure_url;

    if (title !== undefined) {
      slider.title = title;
    }
    if (subtitle !== undefined) {
      slider.subtitle = subtitle;
    }
    if (buttonText !== undefined) {
      slider.buttonText = buttonText;
    }
    if (buttonUrl !== undefined) {
      slider.buttonUrl = buttonUrl;
    }

    if (statusInput !== undefined) {
      if (!statusInput) {
        return res.status(400).json({
          success: false,
          message: "Status cannot be empty",
        });
      }
      const normalized = statusInput.toLowerCase();
      if (!STATUS_VALUES.has(normalized)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status provided",
        });
      }
      slider.status = normalized;
    }

    if (orderInput !== undefined) {
      const parsedOrder = Number(orderInput);
      if (Number.isNaN(parsedOrder) || parsedOrder < 0) {
        return res.status(400).json({
          success: false,
          message: "Order must be a non-negative number",
        });
      }
      slider.order = parsedOrder;
    }

    if (imagePath) {
      slider.image = imagePath;
    }

    await slider.save();

    return res.status(200).json({
      success: true,
      message: "Slider updated successfully",
      slider,
    });
  } catch (error) {
    console.error("Update Homepage Slider Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update slider",
    });
  }
};

const deleteSlider = async (req, res) => {
  try {
    const { sliderId } = req.params;
    const slider = await HomepageSlider.findById(sliderId);

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: "Slider not found",
      });
    }

    await slider.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Slider deleted successfully",
    });
  } catch (error) {
    console.error("Delete Homepage Slider Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete slider",
    });
  }
};

module.exports = {
  createMarquee,
  getPublicMarquees,
  updateMarquee,
  createSlider,
  getPublicSliders,
  updateSlider,
  deleteSlider,
};
