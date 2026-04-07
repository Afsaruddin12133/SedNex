const Terms = require("../models/Terms");
const Contact = require("../models/Contact");
const Faq = require("../models/Faq");
const Team = require("../models/Team");

const createTerms = async (req, res) => {
  try {
    const terms = Array.isArray(req.body) ? req.body : null;

    if (!terms || terms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Terms array is required",
      });
    }

    const normalizedTerms = terms.map((item) => ({
      title: item?.title ? String(item.title).trim() : "",
      content: item?.content ? String(item.content).trim() : "",
      version: item?.version ? String(item.version).trim() : "",
    }));

    for (let i = 0; i < normalizedTerms.length; i += 1) {
      const item = normalizedTerms[i];

      if (!item.version) {
        return res.status(400).json({
          success: false,
          message: `Version is required for item ${i + 1}`,
        });
      }
    }

    const createdTerms = await Terms.insertMany(normalizedTerms, {
      ordered: true,
    });

    return res.status(201).json({
      success: true,
      message: "Terms created successfully",
      total: createdTerms.length,
      terms: createdTerms.map((item) => ({
        id: item._id,
        title: item.title,
        content: item.content,
        version: item.version,
        lastUpdated: item.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Create Terms Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create terms",
    });
  }
};

const updateTerms = async (req, res) => {
  try {
    const terms = Array.isArray(req.body) ? req.body : null;

    if (!terms || terms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Terms array is required",
      });
    }

    const normalizedUpdates = terms.map((item) => ({
      version: item?.version ? String(item.version).trim() : "",
      title:
        item?.title !== undefined ? String(item.title).trim() : undefined,
      content:
        item?.content !== undefined ? String(item.content).trim() : undefined,
    }));

    for (let i = 0; i < normalizedUpdates.length; i += 1) {
      const item = normalizedUpdates[i];

      if (!item.version) {
        return res.status(400).json({
          success: false,
          message: `Version is required for item ${i + 1}`,
        });
      }

      if (item.title === undefined && item.content === undefined) {
        return res.status(400).json({
          success: false,
          message: `Provide title or content for item ${i + 1}`,
        });
      }
    }

    const versions = normalizedUpdates.map((item) => item.version);
    const existing = await Terms.find({ version: { $in: versions } });
    const existingVersions = new Set(existing.map((item) => item.version));

    for (let i = 0; i < versions.length; i += 1) {
      if (!existingVersions.has(versions[i])) {
        return res.status(404).json({
          success: false,
          message: `Terms not found for version ${versions[i]}`,
        });
      }
    }

    const operations = normalizedUpdates.map((item) => {
      const updateDoc = {};

      if (item.title !== undefined) {
        updateDoc.title = item.title;
      }

      if (item.content !== undefined) {
        updateDoc.content = item.content;
      }

      return {
        updateOne: {
          filter: { version: item.version },
          update: { $set: updateDoc },
        },
      };
    });

    await Terms.bulkWrite(operations, { ordered: true });

    const updatedTerms = await Terms.find({ version: { $in: versions } }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Terms updated successfully",
      total: updatedTerms.length,
      terms: updatedTerms.map((item) => ({
        id: item._id,
        title: item.title,
        content: item.content,
        version: item.version,
        lastUpdated: item.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Update Terms Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update terms",
    });
  }
};

const getTerms = async (req, res) => {
  try {
    const terms = await Terms.find().sort({ createdAt: -1 });

    if (!terms.length) {
      return res.status(404).json({
        success: false,
        message: "Terms not found",
      });
    }

    return res.status(200).json({
      success: true,
      total: terms.length,
      terms: terms.map((item) => ({
        id: item._id,
        title: item.title,
        content: item.content,
        version: item.version,
        lastUpdated: item.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get Terms Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch terms",
    });
  }
};

const deleteTerms = async (req, res) => {
  try {
    const versions = Array.isArray(req.body)
      ? req.body
      : Array.isArray(req.body?.versions)
      ? req.body.versions
      : req.body?.version
      ? [req.body.version]
      : [];

    const normalizedVersions = versions
      .map((value) => String(value).trim())
      .filter((value) => value.length > 0);

    if (normalizedVersions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Version list is required",
      });
    }

    const result = await Terms.deleteMany({
      version: { $in: normalizedVersions },
    });

    if (!result.deletedCount) {
      return res.status(404).json({
        success: false,
        message: "Terms not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Terms deleted successfully",
      deleted: result.deletedCount,
    });
  } catch (error) {
    console.error("Delete Terms Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete terms",
    });
  }
};

const createContact = async (req, res) => {
  try {
    const { email, mobile, website, whatsappNumber } = req.body;

    const existing = await Contact.findOne();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Contact information already exists. Use update instead",
      });
    }

    const contact = await Contact.create({
      email: email !== undefined ? String(email).trim() : undefined,
      mobile: mobile !== undefined ? String(mobile).trim() : undefined,
      website: website !== undefined ? String(website).trim() : undefined,
      whatsappNumber: whatsappNumber !== undefined ? String(whatsappNumber).trim() : undefined,
    });

    return res.status(201).json({
      success: true,
      message: "Contact information created successfully",
      contact: {
        email: contact.email,
        mobile: contact.mobile,
        website: contact.website,
        whatsappNumber: contact.whatsappNumber,
        lastUpdated: contact.updatedAt,
      },
    });
  } catch (error) {
    console.error("Create Contact Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create contact information",
    });
  }
};

const updateContact = async (req, res) => {
  try {
    const { email, mobile, website, whatsappNumber } = req.body;

    const contact = await Contact.findOne();

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact information not found",
      });
    }

    if (email !== undefined) {
      contact.email = String(email).trim();
    }

    if (mobile !== undefined) {
      contact.mobile = String(mobile).trim();
    }

    if (website !== undefined) {
      contact.website = String(website).trim();
    }

    if (whatsappNumber !== undefined) {
      contact.whatsappNumber = String(whatsappNumber).trim();
    }

    await contact.save();

    return res.status(200).json({
      success: true,
      message: "Contact information updated successfully",
      contact: {
        email: contact.email,
        mobile: contact.mobile,
        website: contact.website,
        whatsappNumber: contact.whatsappNumber,
        lastUpdated: contact.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update Contact Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update contact information",
    });
  }
};

const getContact = async (req, res) => {
  try {
    const contact = await Contact.findOne();

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact information not found",
      });
    }

    return res.status(200).json({
      success: true,
      contact: {
        email: contact.email,
        mobile: contact.mobile,
        website: contact.website,
        whatsappNumber: contact.whatsappNumber,
        lastUpdated: contact.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get Contact Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact information",
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOne();

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact information not found",
      });
    }

    await Contact.deleteMany();

    return res.status(200).json({
      success: true,
      message: "Contact information deleted successfully",
    });
  } catch (error) {
    console.error("Delete Contact Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete contact information",
    });
  }
};

const createFaq = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const normalizedQuestion =
      question !== undefined && question !== null
        ? String(question).trim()
        : undefined;
    const normalizedAnswer =
      answer !== undefined && answer !== null ? String(answer).trim() : undefined;

    const existing = normalizedQuestion
      ? await Faq.findOne({ question: normalizedQuestion })
      : null;
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "FAQ question already exists",
      });
    }

    const faq = await Faq.create({
      question: normalizedQuestion,
      answer: normalizedAnswer,
    });

    return res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      faq: {
        id: faq._id,
        question: faq.question,
        answer: faq.answer,
        lastUpdated: faq.updatedAt,
      },
    });
  } catch (error) {
    console.error("Create FAQ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create FAQ",
    });
  }
};

const updateFaq = async (req, res) => {
  try {
    const { faqId } = req.params;
    const { question, answer } = req.body;

    const faq = await Faq.findById(faqId);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    if (question !== undefined) {
      const normalizedQuestion = String(question).trim();
      const duplicate = await Faq.findOne({
        question: normalizedQuestion,
        _id: { $ne: faqId },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Another FAQ with this question already exists",
        });
      }

      faq.question = normalizedQuestion;
    }

    if (answer !== undefined) {
      faq.answer = String(answer).trim();
    }

    await faq.save();

    return res.status(200).json({
      success: true,
      message: "FAQ updated successfully",
      faq: {
        id: faq._id,
        question: faq.question,
        answer: faq.answer,
        lastUpdated: faq.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update FAQ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update FAQ",
    });
  }
};

const getFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: faqs.length,
      faqs: faqs.map((faq) => ({
        id: faq._id,
        question: faq.question,
        answer: faq.answer,
        lastUpdated: faq.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Get FAQs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch FAQs",
    });
  }
};

const deleteFaq = async (req, res) => {
  try {
    const { faqId } = req.params;

    const faq = await Faq.findById(faqId);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    await Faq.findByIdAndDelete(faqId);

    return res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    console.error("Delete FAQ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete FAQ",
    });
  }
};

const normalizeString = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : undefined;
};

const getTeamImage = (req) => {
  return req.file?.path || normalizeString(req.body?.image) || normalizeString(req.body?.employeeImage);
};

const createTeamMember = async (req, res) => {
  try {
    const name = normalizeString(req.body?.name || req.body?.employeeName);
    const designation = normalizeString(
      req.body?.designation || req.body?.employeeDesignation
    );
    const about = normalizeString(req.body?.about || req.body?.employeeAbout);
    const image = getTeamImage(req);

    const member = await Team.create({
      name,
      image,
      designation,
      about,
    });

    return res.status(201).json({
      success: true,
      message: "Team member created successfully",
      member,
    });
  } catch (error) {
    console.error("Create Team Member Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create team member",
    });
  }
};

const getTeamMembers = async (req, res) => {
  try {
    const members = await Team.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: members.length,
      members,
    });
  } catch (error) {
    console.error("Get Team Members Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch team members",
    });
  }
};

const getTeamMemberById = async (req, res) => {
  try {
    const { teamId } = req.params;
    const member = await Team.findById(teamId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    return res.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    console.error("Get Team Member Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch team member",
    });
  }
};

const updateTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;

    const name = normalizeString(req.body?.name || req.body?.employeeName);
    const designation = normalizeString(
      req.body?.designation || req.body?.employeeDesignation
    );
    const about = normalizeString(req.body?.about || req.body?.employeeAbout);
    const image = getTeamImage(req);

    const updateDoc = {};

    if (name !== undefined) {
      updateDoc.name = name;
    }

    if (designation !== undefined) {
      updateDoc.designation = designation;
    }

    if (about !== undefined) {
      updateDoc.about = about;
    }

    if (image !== undefined) {
      updateDoc.image = image;
    }

    const member = await Team.findByIdAndUpdate(
      teamId,
      { $set: updateDoc },
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Team member updated successfully",
      member,
    });
  } catch (error) {
    console.error("Update Team Member Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update team member",
    });
  }
};

const deleteTeamMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const member = await Team.findByIdAndDelete(teamId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (error) {
    console.error("Delete Team Member Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete team member",
    });
  }
};

module.exports = {
  createTerms,
  updateTerms,
  getTerms,
  deleteTerms,
  createContact,
  updateContact,
  getContact,
  deleteContact,
  createFaq,
  updateFaq,
  getFaqs,
  deleteFaq,
  createTeamMember,
  getTeamMembers,
  getTeamMemberById,
  updateTeamMember,
  deleteTeamMember,
};
