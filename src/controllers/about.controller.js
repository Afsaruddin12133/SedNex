const Terms = require("../models/Terms");
const Contact = require("../models/Contact");
const Faq = require("../models/Faq");

const createTerms = async (req, res) => {
  try {
    const { title, content, version } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    if (!version || version.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Version is required",
      });
    }

    const existing = await Terms.findOne();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Terms already exist. Use update instead",
      });
    }

    const terms = await Terms.create({
      title: title.trim(),
      content: content.trim(),
      version: version.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Terms created successfully",
      terms: {
        title: terms.title,
        content: terms.content,
        version: terms.version,
        lastUpdated: terms.updatedAt,
      },
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
    const { title, content, version } = req.body;

    if (
      (title === undefined || title === null) &&
      (content === undefined || content === null) &&
      (version === undefined || version === null)
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const terms = await Terms.findOne();

    if (!terms) {
      return res.status(404).json({
        success: false,
        message: "Terms not found",
      });
    }

    if (title !== undefined) {
      if (!title || title.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }
      terms.title = title.trim();
    }

    if (content !== undefined) {
      if (!content || content.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Content cannot be empty",
        });
      }
      terms.content = content.trim();
    }

    if (version !== undefined) {
      if (!version || version.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Version cannot be empty",
        });
      }
      terms.version = version.trim();
    }

    await terms.save();

    return res.status(200).json({
      success: true,
      message: "Terms updated successfully",
      terms: {
        title: terms.title,
        content: terms.content,
        version: terms.version,
        lastUpdated: terms.updatedAt,
      },
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
    const terms = await Terms.findOne();

    if (!terms) {
      return res.status(404).json({
        success: false,
        message: "Terms not found",
      });
    }

    return res.status(200).json({
      success: true,
      terms: {
        title: terms.title,
        content: terms.content,
        version: terms.version,
        lastUpdated: terms.updatedAt,
      },
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
    const terms = await Terms.findOne();

    if (!terms) {
      return res.status(404).json({
        success: false,
        message: "Terms not found",
      });
    }

    await Terms.deleteMany();

    return res.status(200).json({
      success: true,
      message: "Terms deleted successfully",
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
    const { email, mobile, website } = req.body;

    if (!email || email.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    if (!mobile || mobile.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Mobile is required",
      });
    }

    if (!website || website.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Website is required",
      });
    }

    const existing = await Contact.findOne();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Contact information already exists. Use update instead",
      });
    }

    const contact = await Contact.create({
      email: email.trim(),
      mobile: mobile.trim(),
      website: website.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Contact information created successfully",
      contact: {
        email: contact.email,
        mobile: contact.mobile,
        website: contact.website,
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
    const { email, mobile, website } = req.body;

    if (
      (email === undefined || email === null) &&
      (mobile === undefined || mobile === null) &&
      (website === undefined || website === null)
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const contact = await Contact.findOne();

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact information not found",
      });
    }

    if (email !== undefined) {
      if (!email || email.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Email cannot be empty",
        });
      }
      contact.email = email.trim();
    }

    if (mobile !== undefined) {
      if (!mobile || mobile.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Mobile cannot be empty",
        });
      }
      contact.mobile = mobile.trim();
    }

    if (website !== undefined) {
      if (!website || website.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Website cannot be empty",
        });
      }
      contact.website = website.trim();
    }

    await contact.save();

    return res.status(200).json({
      success: true,
      message: "Contact information updated successfully",
      contact: {
        email: contact.email,
        mobile: contact.mobile,
        website: contact.website,
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

    if (!question || question.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    if (!answer || answer.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Answer is required",
      });
    }

    const existing = await Faq.findOne({ question: question.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "FAQ question already exists",
      });
    }

    const faq = await Faq.create({
      question: question.trim(),
      answer: answer.trim(),
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

    if (
      (question === undefined || question === null) &&
      (answer === undefined || answer === null)
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const faq = await Faq.findById(faqId);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found",
      });
    }

    if (question !== undefined) {
      if (!question || question.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Question cannot be empty",
        });
      }

      const duplicate = await Faq.findOne({
        question: question.trim(),
        _id: { $ne: faqId },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Another FAQ with this question already exists",
        });
      }

      faq.question = question.trim();
    }

    if (answer !== undefined) {
      if (!answer || answer.trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Answer cannot be empty",
        });
      }
      faq.answer = answer.trim();
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
};
