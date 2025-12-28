const Section = require("../models/Section");
const SectionItem = require("../models/SectionItem");
const slugify = require("../utils/slugify");

const STATUS_VALUES = new Set(["active", "inactive"]);

const toTrimmedString = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : undefined;
};

const getSections = async (req, res) => {
  try {
    const sections = await Section.find().sort({ name: 1 });

    return res.status(200).json({
      success: true,
      sections,
    });
  } catch (error) {
    console.error("Get Sections Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sections",
    });
  }
};

const createSection = async (req, res) => {
  try {
    const allowedNames = Section.schema.path("name").enumValues;
    const allowedStatuses = Section.schema.path("status").enumValues;

    const rawName = req.body?.name;
    const rawStatus = req.body?.status;

    const name = rawName ? String(rawName).trim().toLowerCase() : "";
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Section name is required",
      });
    }

    if (!allowedNames.includes(name)) {
      return res.status(400).json({
        success: false,
        message: `Section name must be one of: ${allowedNames.join(", ")}`,
      });
    }

    let status;
    if (rawStatus !== undefined) {
      const normalizedStatus = String(rawStatus).trim().toLowerCase();
      if (!allowedStatuses.includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${allowedStatuses.join(", ")}`,
        });
      }
      status = normalizedStatus;
    }

    const existing = await Section.findOne({ name });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Section already exists",
      });
    }

    const section = await Section.create({ name, status });

    return res.status(201).json({
      success: true,
      message: "Section created successfully",
      section,
    });
  } catch (error) {
    console.error("Create Section Error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Section already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create section",
    });
  }
};

const getSectionItems = async (req, res) => {
  try {
    const { slug } = req.params;
    const normalizedSlug = slugify(slug);

    const section = await Section.findOne({ slug: normalizedSlug });
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    const items = await SectionItem.find({
      sectionId: section._id,
      status: "active",
    }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      section: {
        name: section.name,
        slug: section.slug,
        status: section.status,
      },
      items,
    });
  } catch (error) {
    console.error("Get Section Items Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch section items",
    });
  }
};

const getSectionItemsAdmin = async (req, res) => {
  try {
    const { slug } = req.params;
    const normalizedSlug = slugify(slug);

    const section = await Section.findOne({ slug: normalizedSlug });
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    const items = await SectionItem.find({
      sectionId: section._id,
    }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      section: {
        name: section.name,
        slug: section.slug,
        status: section.status,
      },
      items,
    });
  } catch (error) {
    console.error("Get Section Items Admin Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch section items",
    });
  }
};

const createSectionItem = async (req, res) => {
  try {
    const { slug } = req.params;
    const normalizedSlug = slugify(slug);
    const rawName = req.body?.name;
    const rawStatus = req.body?.status;

    const section = await Section.findOne({ slug: normalizedSlug });
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    const name = rawName ? String(rawName).trim() : "";
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Item name is required",
      });
    }

    const uploadedImage = req.file?.path || req.file?.secure_url;
    const bodyImage = toTrimmedString(req.body?.image);
    const image = uploadedImage || bodyImage;
    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Item image is required",
      });
    }

    let status;
    if (rawStatus !== undefined) {
      const normalizedStatus = String(rawStatus).trim().toLowerCase();
      if (!STATUS_VALUES.has(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status provided",
        });
      }
      status = normalizedStatus;
    }

    const payload = {
      sectionId: section._id,
      name,
      image,
    };

    if (status) {
      payload.status = status;
    }

    const item = await SectionItem.create(payload);

    return res.status(201).json({
      success: true,
      message: "Section item created successfully",
      item,
    });
  } catch (error) {
    console.error("Create Section Item Error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Section item already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create section item",
    });
  }
};

module.exports = {
  createSection,
  getSections,
  getSectionItems,
  getSectionItemsAdmin,
  createSectionItem,
};
