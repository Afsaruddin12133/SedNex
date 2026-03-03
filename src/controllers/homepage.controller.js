const HomepageMarquee = require("../models/HomepageMarquee");
const HomepageSlider = require("../models/HomepageSlider");
const ServiceCard = require("../models/ServiceCard");

const STATUS_VALUES = new Set(["active", "inactive"]);

const toTrimmedString = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : undefined;
};

const parsePrice = (value) => {
  if (value === undefined || value === null || value === "") {
    return { error: "price is required" };
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed) || !Number.isFinite(parsed) || parsed <= 0) {
    return { error: "price must be a positive number" };
  }
  return { value: parsed };
};

const parseTime = (value) => {
  if (!value) {
    return { error: "time is required" };
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { error: "time must be a valid ISO datetime" };
  }
  return { value: parsed };
};

const parsePriceType = (value) => {
  const trimmed = toTrimmedString(value);
  if (!trimmed) {
    return { error: "priceType is required" };
  }
  return { value: trimmed };
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
      message: "Slider created successfully"
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

const createServiceCard = async (req, res) => {
  try {
    const nameInput = toTrimmedString(req.body?.name);
    const iconInput = req.file?.path || req.file?.secure_url;
    const priceResult = parsePrice(req.body?.price);
    const priceTypeResult = parsePriceType(req.body?.priceType);
    const timeResult = parseTime(req.body?.time);

    if (!nameInput) {
      return res.status(400).json({
        success: false,
        message: "name is required",
      });
    }

    if (!iconInput) {
      return res.status(400).json({
        success: false,
        message: "icon is required",
      });
    }

    if (priceResult.error) {
      return res.status(400).json({
        success: false,
        message: priceResult.error,
      });
    }

    if (priceTypeResult.error) {
      return res.status(400).json({
        success: false,
        message: priceTypeResult.error,
      });
    }

    if (timeResult.error) {
      return res.status(400).json({
        success: false,
        message: timeResult.error,
      });
    }

    const card = await ServiceCard.create({
      name: nameInput,
      icon: iconInput,
      price: priceResult.value,
      priceType: priceTypeResult.value,
      time: timeResult.value,
      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      card,
    });
  } catch (error) {
    console.error("Create Service Card Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create service card",
    });
  }
};

const updateServiceCard = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await ServiceCard.findById(id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Service card not found",
      });
    }

    const nameInput = toTrimmedString(req.body?.name);
    const iconInput = req.file?.path || req.file?.secure_url;
    const priceTypeInput = req.body?.priceType;

    if (
      nameInput === undefined &&
      !iconInput &&
      req.body?.price === undefined &&
      req.body?.time === undefined &&
      priceTypeInput === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }

    if (nameInput !== undefined) {
      if (!nameInput) {
        return res.status(400).json({
          success: false,
          message: "name cannot be empty",
        });
      }
      card.name = nameInput;
    }

    if (iconInput) {
      card.icon = iconInput;
    }

    if (req.body?.price !== undefined) {
      const priceResult = parsePrice(req.body?.price);
      if (priceResult.error) {
        return res.status(400).json({
          success: false,
          message: priceResult.error,
        });
      }
      card.price = priceResult.value;
    }

    if (priceTypeInput !== undefined) {
      const priceTypeResult = parsePriceType(priceTypeInput);
      if (priceTypeResult.error) {
        return res.status(400).json({
          success: false,
          message: priceTypeResult.error,
        });
      }
      card.priceType = priceTypeResult.value;
    }

    if (req.body?.time !== undefined) {
      const timeResult = parseTime(req.body?.time);
      if (timeResult.error) {
        return res.status(400).json({
          success: false,
          message: timeResult.error,
        });
      }
      card.time = timeResult.value;
    }

    await card.save();

    return res.status(200).json({
      success: true,
      card,
    });
  } catch (error) {
    console.error("Update Service Card Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update service card",
    });
  }
};

const deleteServiceCard = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await ServiceCard.findById(id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: "Service card not found",
      });
    }

    await card.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Service card deleted successfully",
    });
  } catch (error) {
    console.error("Delete Service Card Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete service card",
    });
  }
};

const getServiceCards = async (req, res) => {
  try {
    const cards = await ServiceCard.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      cards,
    });
  } catch (error) {
    console.error("Get Service Cards Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service cards",
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
  createServiceCard,
  updateServiceCard,
  deleteServiceCard,
  getServiceCards,
};
