const Section = require("../models/Section");
const SectionItem = require("../models/SectionItem");
const slugify = require("../utils/slugify");
const mongoose = require("mongoose");

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
    const allowedStatuses = Section.schema.path("status").enumValues;

    const rawName = req.body?.name;
    const rawStatus = req.body?.status;

    const name = rawName ? String(rawName).trim().toLowerCase() : "";

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

const updateSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { name, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid section id",
      });
    }


    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    if (name !== undefined) {
      const normalizedName = String(name).trim().toLowerCase();

      const existing = await Section.findOne({
        _id: { $ne: section._id },
        name: normalizedName,
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Section already exists",
        });
      }

      section.name = normalizedName;
    }

    if (status !== undefined) {
      const allowedStatuses = Section.schema.path("status").enumValues;
      const normalizedStatus = String(status).trim().toLowerCase();

      if (!allowedStatuses.includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${allowedStatuses.join(", ")}`,
        });
      }

      section.status = normalizedStatus;
    }

    await section.save();

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      section,
    });
  } catch (error) {
    console.error("Update Section Error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Section already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update section",
    });
  }
};

const deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid section id",
      });
    }

    const section = await Section.findByIdAndDelete(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
    });
  } catch (error) {
    console.error("Delete Section Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete section",
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

    const uploadedImage = req.file?.path || req.file?.secure_url;
    const bodyImage = toTrimmedString(req.body?.image);
    const image = uploadedImage || bodyImage;

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

const updateSectionItem = async (req, res) => {
  try {
    const { slug, itemId } = req.params;
    const normalizedSlug = slugify(slug);

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item id",
      });
    }

    const section = await Section.findOne({ slug: normalizedSlug });
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    const item = await SectionItem.findOne({
      _id: itemId,
      sectionId: section._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Section item not found",
      });
    }

    const { name, status } = req.body;
    const hasImageUpdate = Boolean(req.file) || req.body?.image !== undefined;


    if (name !== undefined) {
      const normalizedName = String(name).trim();

      const existing = await SectionItem.findOne({
        _id: { $ne: item._id },
        sectionId: section._id,
        name: normalizedName,
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Section item already exists",
        });
      }

      item.name = normalizedName;
    }

    if (hasImageUpdate) {
      const uploadedImage = req.file?.path || req.file?.secure_url;
      const bodyImage = toTrimmedString(req.body?.image);
      const image = uploadedImage || bodyImage;
      item.image = image;
    }

    if (status !== undefined) {
      const normalizedStatus = String(status).trim().toLowerCase();
      if (!STATUS_VALUES.has(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status provided",
        });
      }
      item.status = normalizedStatus;
    }

    await item.save();

    return res.status(200).json({
      success: true,
      message: "Section item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Update Section Item Error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Section item already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update section item",
    });
  }
};

const deleteSectionItem = async (req, res) => {
  try {
    const { slug, itemId } = req.params;
    const normalizedSlug = slugify(slug);

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item id",
      });
    }

    const section = await Section.findOne({ slug: normalizedSlug });
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    const item = await SectionItem.findOneAndDelete({
      _id: itemId,
      sectionId: section._id,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Section item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Section item deleted successfully",
    });
  } catch (error) {
    console.error("Delete Section Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete section item",
    });
  }
};

module.exports = {
  createSection,
  updateSection,
  getSections,
  getSectionItems,
  getSectionItemsAdmin,
  createSectionItem,
  updateSectionItem,
  deleteSectionItem,
  deleteSection,
};
