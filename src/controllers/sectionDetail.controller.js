const mongoose = require("mongoose");
const Section = require("../models/Section");
const SectionItem = require("../models/SectionItem");
const SectionItemDetail = require("../models/SectionItemDetail");
const slugify = require("../utils/slugify");

const STATUS_VALUES = new Set(["active", "inactive"]);

const toTrimmedString = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : undefined;
};

const parseServices = (input) => {
  if (!input) {
    return [];
  }
  const source = Array.isArray(input) ? input : [input];
  const services = [];
  source.forEach((entry) => {
    if (Array.isArray(entry)) {
      entry.forEach((nested) => {
        const value = toTrimmedString(nested);
        if (value && !services.some((service) => service.toLowerCase() === value.toLowerCase())) {
          services.push(value);
        }
      });
      return;
    }
    const value = toTrimmedString(entry);
    if (!value) {
      return;
    }
    value
      .split(",")
      .map((part) => toTrimmedString(part))
      .filter(Boolean)
      .forEach((part) => {
        if (!services.some((service) => service.toLowerCase() === part.toLowerCase())) {
          services.push(part);
        }
      });
  });
  return services;
};

const parseSchedules = (input) => {
  if (!input) {
    return [];
  }
  const source = Array.isArray(input) ? input : [input];
  const schedules = [];
  source.forEach((entry) => {
    if (Array.isArray(entry)) {
      entry.forEach((nested) => {
        if (!nested) {
          return;
        }
        const day = toTrimmedString(nested.day ?? nested.name ?? nested.title ?? nested);
        if (!day) {
          return;
        }
        const note = toTrimmedString(nested.note ?? nested.description ?? nested.details);
        if (!schedules.some((item) => item.day.toLowerCase() === day.toLowerCase())) {
          schedules.push({ day, note });
        }
      });
      return;
    }
    if (!entry) {
      return;
    }
    if (typeof entry === "string") {
      const day = toTrimmedString(entry);
      if (day && !schedules.some((item) => item.day.toLowerCase() === day.toLowerCase())) {
        schedules.push({ day });
      }
      return;
    }
    const day = toTrimmedString(entry.day ?? entry.name ?? entry.title);
    if (!day) {
      return;
    }
    const note = toTrimmedString(entry.note ?? entry.description ?? entry.details);
    if (!schedules.some((item) => item.day.toLowerCase() === day.toLowerCase())) {
      schedules.push({ day, note });
    }
  });
  return schedules;
};

const findSectionAndItem = async (slug, itemId) => {
  const normalizedSlug = slugify(slug);
  const section = await Section.findOne({ slug: normalizedSlug });
  if (!section) {
    return { error: { status: 404, message: "Section not found" } };
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return { error: { status: 400, message: "Invalid section item id" } };
  }

  const item = await SectionItem.findOne({ _id: itemId, sectionId: section._id });
  if (!item) {
    return { error: { status: 404, message: "Section item not found" } };
  }

  return { section, item };
};

const createSectionItemDetail = async (req, res) => {
  try {
    const { slug, itemId } = req.params;
    const lookup = await findSectionAndItem(slug, itemId);
    if (lookup.error) {
      return res.status(lookup.error.status).json({
        success: false,
        message: lookup.error.message,
      });
    }

    const { section, item } = lookup;
    const rawStatus = req.body?.status;

    let status;
    if (rawStatus !== undefined) {
      const normalizedStatus = String(rawStatus).trim().toLowerCase();
      if (!STATUS_VALUES.has(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: `Detail status must be one of: ${Array.from(STATUS_VALUES).join(", ")}`,
        });
      }
      status = normalizedStatus;
    }

    const contactInput = req.body?.contact;
    if (!contactInput || typeof contactInput !== "object") {
      return res.status(400).json({
        success: false,
        message: "Contact information is required",
      });
    }

    const contact = {
      mobile: toTrimmedString(contactInput.mobile),
      direction: toTrimmedString(contactInput.direction),
      website: toTrimmedString(contactInput.website),
      email: toTrimmedString(contactInput.email),
    };

    if (!contact.mobile || !contact.direction || !contact.website || !contact.email) {
      return res.status(400).json({
        success: false,
        message: "Contact must include mobile, direction, website, and email",
      });
    }

    const locationInput = req.body?.location;
    if (!locationInput || typeof locationInput !== "object") {
      return res.status(400).json({
        success: false,
        message: "Location information is required",
      });
    }

    const locationAddress = toTrimmedString(locationInput.address);
    if (!locationAddress) {
      return res.status(400).json({
        success: false,
        message: "Location address is required",
      });
    }

    const location = {
      address: locationAddress,
    };

    const mapUrl = toTrimmedString(locationInput.mapUrl ?? locationInput.mapURL ?? locationInput.map_url);
    if (mapUrl) {
      location.mapUrl = mapUrl;
    }

    const latitude = locationInput.latitude ?? locationInput.lat;
    const longitude = locationInput.longitude ?? locationInput.lng;
    const parsedLatitude = latitude !== undefined ? Number(latitude) : undefined;
    const parsedLongitude = longitude !== undefined ? Number(longitude) : undefined;
    if (parsedLatitude !== undefined && !Number.isNaN(parsedLatitude)) {
      location.latitude = parsedLatitude;
    }
    if (parsedLongitude !== undefined && !Number.isNaN(parsedLongitude)) {
      location.longitude = parsedLongitude;
    }

    const aboutInput = req.body?.about;
    if (!aboutInput || typeof aboutInput !== "object") {
      return res.status(400).json({
        success: false,
        message: "About information is required",
      });
    }

    const aboutDescription = toTrimmedString(aboutInput.description ?? aboutInput.details ?? aboutInput.text);
    if (!aboutDescription) {
      return res.status(400).json({
        success: false,
        message: "About description is required",
      });
    }

    const services = parseServices(aboutInput.services ?? []);
    if (!services.length) {
      return res.status(400).json({
        success: false,
        message: "At least one service is required",
      });
    }

    const schedules = parseSchedules(req.body?.offDaySchedules ?? aboutInput.offDaySchedules);
    if (!schedules.length) {
      return res.status(400).json({
        success: false,
        message: "At least one off-day schedule entry is required",
      });
    }

    const payload = {
      sectionId: section._id,
      sectionItemId: item._id,
      contact,
      location,
      about: {
        description: aboutDescription,
        services,
      },
      offDaySchedules: schedules,
    };

    if (status) {
      payload.status = status;
    }

    const detail = await SectionItemDetail.create(payload);

    return res.status(201).json({
      success: true,
      message: "Section item detail created successfully",
      detail,
    });
  } catch (error) {
    console.error("Create Section Item Detail Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create section item detail",
    });
  }
};

const getSectionItemDetails = async (req, res) => {
  try {
    const { slug, itemId } = req.params;
    const lookup = await findSectionAndItem(slug, itemId);
    if (lookup.error) {
      return res.status(lookup.error.status).json({
        success: false,
        message: lookup.error.message,
      });
    }

    const { section, item } = lookup;

    const details = await SectionItemDetail.find({
      sectionItemId: item._id,
      status: "active",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      section: {
        name: section.name,
        slug: section.slug,
        status: section.status,
      },
      item: {
        _id: item._id,
        name: item.name,
        image: item.image,
        status: item.status,
      },
      details,
    });
  } catch (error) {
    console.error("Get Section Item Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch section item details",
    });
  }
};

const getSectionItemDetailsAdmin = async (req, res) => {
  try {
    const { slug, itemId } = req.params;
    const lookup = await findSectionAndItem(slug, itemId);
    if (lookup.error) {
      return res.status(lookup.error.status).json({
        success: false,
        message: lookup.error.message,
      });
    }

    const { section, item } = lookup;

    const details = await SectionItemDetail.find({
      sectionItemId: item._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      section: {
        name: section.name,
        slug: section.slug,
        status: section.status,
      },
      item: {
        _id: item._id,
        name: item.name,
        image: item.image,
        status: item.status,
      },
      details,
    });
  } catch (error) {
    console.error("Get Section Item Details Admin Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch section item details",
    });
  }
};

const updateSectionItemDetail = async (req, res) => {
  try {
    const { slug, itemId, detailId } = req.params;
    const lookup = await findSectionAndItem(slug, itemId);
    if (lookup.error) {
      return res.status(lookup.error.status).json({
        success: false,
        message: lookup.error.message,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(detailId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid detail id",
      });
    }

    const { item } = lookup;

    const detail = await SectionItemDetail.findOne({
      _id: detailId,
      sectionItemId: item._id,
    });

    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Section item detail not found",
      });
    }

    const hasBody = req.body && Object.keys(req.body).length > 0;
    if (!hasBody) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const rawStatus = req.body?.status;
    if (rawStatus !== undefined) {
      const normalizedStatus = String(rawStatus).trim().toLowerCase();
      if (!STATUS_VALUES.has(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: `Detail status must be one of: ${Array.from(STATUS_VALUES).join(", ")}`,
        });
      }
      detail.status = normalizedStatus;
    }

    if (req.body?.contact !== undefined) {
      const contactInput = req.body.contact;
      if (!contactInput || typeof contactInput !== "object") {
        return res.status(400).json({
          success: false,
          message: "Contact information is required",
        });
      }

      const contact = {
        mobile: toTrimmedString(contactInput.mobile),
        direction: toTrimmedString(contactInput.direction),
        website: toTrimmedString(contactInput.website),
        email: toTrimmedString(contactInput.email),
      };

      if (!contact.mobile || !contact.direction || !contact.website || !contact.email) {
        return res.status(400).json({
          success: false,
          message: "Contact must include mobile, direction, website, and email",
        });
      }

      detail.contact = contact;
    }

    if (req.body?.location !== undefined) {
      const locationInput = req.body.location;
      if (!locationInput || typeof locationInput !== "object") {
        return res.status(400).json({
          success: false,
          message: "Location information is required",
        });
      }

      const locationAddress = toTrimmedString(locationInput.address);
      if (!locationAddress) {
        return res.status(400).json({
          success: false,
          message: "Location address is required",
        });
      }

      const location = {
        address: locationAddress,
      };

      const mapUrl = toTrimmedString(locationInput.mapUrl ?? locationInput.mapURL ?? locationInput.map_url);
      if (mapUrl) {
        location.mapUrl = mapUrl;
      }

      const latitude = locationInput.latitude ?? locationInput.lat;
      const longitude = locationInput.longitude ?? locationInput.lng;
      const parsedLatitude = latitude !== undefined ? Number(latitude) : undefined;
      const parsedLongitude = longitude !== undefined ? Number(longitude) : undefined;
      if (parsedLatitude !== undefined && !Number.isNaN(parsedLatitude)) {
        location.latitude = parsedLatitude;
      }
      if (parsedLongitude !== undefined && !Number.isNaN(parsedLongitude)) {
        location.longitude = parsedLongitude;
      }

      detail.location = location;
    }

    if (req.body?.about !== undefined) {
      const aboutInput = req.body.about;
      if (!aboutInput || typeof aboutInput !== "object") {
        return res.status(400).json({
          success: false,
          message: "About information is required",
        });
      }

      const aboutDescription = toTrimmedString(aboutInput.description ?? aboutInput.details ?? aboutInput.text);
      if (!aboutDescription) {
        return res.status(400).json({
          success: false,
          message: "About description is required",
        });
      }

      const services = parseServices(aboutInput.services ?? []);
      if (!services.length) {
        return res.status(400).json({
          success: false,
          message: "At least one service is required",
        });
      }

      detail.about = {
        description: aboutDescription,
        services,
      };
    }

    if (req.body?.offDaySchedules !== undefined) {
      const schedules = parseSchedules(req.body.offDaySchedules);
      if (!schedules.length) {
        return res.status(400).json({
          success: false,
          message: "At least one off-day schedule entry is required",
        });
      }

      detail.offDaySchedules = schedules;
    }

    await detail.save();

    return res.status(200).json({
      success: true,
      message: "Section item detail updated successfully",
      detail,
    });
  } catch (error) {
    console.error("Update Section Item Detail Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update section item detail",
    });
  }
};

const deleteSectionItemDetail = async (req, res) => {
  try {
    const { slug, itemId, detailId } = req.params;
    const lookup = await findSectionAndItem(slug, itemId);
    if (lookup.error) {
      return res.status(lookup.error.status).json({
        success: false,
        message: lookup.error.message,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(detailId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid detail id",
      });
    }

    const { item } = lookup;

    const detail = await SectionItemDetail.findOneAndDelete({
      _id: detailId,
      sectionItemId: item._id,
    });

    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Section item detail not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Section item detail deleted successfully",
    });
  } catch (error) {
    console.error("Delete Section Item Detail Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete section item detail",
    });
  }
};

module.exports = {
  createSectionItemDetail,
  getSectionItemDetails,
  getSectionItemDetailsAdmin,
  updateSectionItemDetail,
  deleteSectionItemDetail,
};
