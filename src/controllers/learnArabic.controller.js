const LearnArabicCategory = require("../models/LearnArabicCategory");
const LearnArabicWord = require("../models/LearnArabicWord");
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

const createCategory = async (req, res) => {
  try {
    const name = toTrimmedString(req.body?.name);
    const description = toTrimmedString(req.body?.description);
    const statusInput = toTrimmedString(req.body?.status);

    let status;
    if (statusInput) {
      const normalizedStatus = statusInput.toLowerCase();
      if (!STATUS_VALUES.has(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status provided",
        });
      }
      status = normalizedStatus;
    }

    const existing = name
      ? await LearnArabicCategory.findOne({
          $or: [{ name: new RegExp(`^${name}$`, "i") }, { slug: slugify(name) }],
        })
      : null;

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await LearnArabicCategory.create({
      name,
      description,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create Learn Arabic Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await LearnArabicCategory.find({ status: "active" }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get Learn Arabic Categories Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};



const findCategoryBySlug = async (slug) => {
  const normalizedSlug = slugify(slug);
  return LearnArabicCategory.findOne({ slug: normalizedSlug });
};

const createWord = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await findCategoryBySlug(slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const english = toTrimmedString(req.body?.english) || toTrimmedString(req.body?.phrase);
    const arabic = toTrimmedString(req.body?.arabic) || toTrimmedString(req.body?.translation);

    let status;
    const statusInput = toTrimmedString(req.body?.status);
    if (statusInput) {
      const normalizedStatus = statusInput.toLowerCase();
      if (!STATUS_VALUES.has(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status provided",
        });
      }
      status = normalizedStatus;
    }

    const payload = {
      categoryId: category._id,
      english,
      arabic,
      pronunciation: toTrimmedString(req.body?.pronunciation),
      transliteration: toTrimmedString(req.body?.transliteration),
      example: toTrimmedString(req.body?.example),
    };

    if (status) {
      payload.status = status;
    }

    const word = await LearnArabicWord.create(payload);

    return res.status(201).json({
      success: true,
      message: "Word created successfully",
      word,
    });
  } catch (error) {
    console.error("Create Learn Arabic Word Error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Word already exists in this category",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create word",
    });
  }
};

const getCategoryWords = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await findCategoryBySlug(slug);

    if (!category || category.status !== "active") {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const words = await LearnArabicWord.find({
      categoryId: category._id,
      status: "active",
    }).sort({ english: 1 });

    return res.status(200).json({
      success: true,
      category: {
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
      words,
    });
  } catch (error) {
    console.error("Get Learn Arabic Words Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch words",
    });
  }
};

const getAllWords = async (req, res) => {
  try {
    const words = await LearnArabicWord.find()
      .sort({ english: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      total: words.length,
      words,
    });
  } catch (error) {
    console.error("Get All Learn Arabic Words Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch words",
    });
  }
};

const updateWord = async (req, res) => {
  try {
    const { slug } = req.params;
    const { wordID } = req.body;
    const category = await findCategoryBySlug(slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (!wordID || !mongoose.Types.ObjectId.isValid(wordID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid word id",
      });
    }

    const word = await LearnArabicWord.findOne({
      _id: wordID,
      categoryId: category._id,
    });

    if (!word) {
      return res.status(404).json({
        success: false,
        message: "Word not found",
      });
    }

    const english = toTrimmedString(req.body?.english) || toTrimmedString(req.body?.phrase);
    const arabic = toTrimmedString(req.body?.arabic) || toTrimmedString(req.body?.translation);
    const pronunciation = toTrimmedString(req.body?.pronunciation);
    const transliteration = toTrimmedString(req.body?.transliteration);
    const example = toTrimmedString(req.body?.example);
    const statusInput = toTrimmedString(req.body?.status);

    if (english) {
      word.english = english;
    }

    if (arabic) {
      word.arabic = arabic;
    }

    if (pronunciation !== undefined) {
      word.pronunciation = pronunciation;
    }

    if (transliteration !== undefined) {
      word.transliteration = transliteration;
    }

    if (example !== undefined) {
      word.example = example;
    }

    if (statusInput) {
      const normalizedStatus = statusInput.toLowerCase();
      if (!STATUS_VALUES.has(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status provided",
        });
      }
      word.status = normalizedStatus;
    }

    if (english) {
      const duplicate = await LearnArabicWord.findOne({
        _id: { $ne: word._id },
        categoryId: category._id,
        english: new RegExp(`^${english}$`, "i"),
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Word already exists in this category",
        });
      }
    }

    await word.save();

    return res.status(200).json({
      success: true,
      message: "Word updated successfully",
      word,
    });
  } catch (error) {
    console.error("Update Learn Arabic Word Error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Word already exists in this category",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update word",
    });
  }
};

const deleteWord = async (req, res) => {
  try {
    const { slug, wordID } = req.params;
    const category = await findCategoryBySlug(slug);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(wordID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid word id",
      });
    }

    const word = await LearnArabicWord.findOne({
      _id: wordID,
      categoryId: category._id,
    });

    if (!word) {
      return res.status(404).json({
        success: false,
        message: "Word not found",
      });
    }

    await LearnArabicWord.findByIdAndDelete(wordID);

    return res.status(200).json({
      success: true,
      message: "Word deleted successfully",
    });
  } catch (error) {
    console.error("Delete Learn Arabic Word Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete word",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoriesid } = req.params;
    const name = toTrimmedString(req.body?.name);
    const description = toTrimmedString(req.body?.description);
    const statusInput = toTrimmedString(req.body?.status);

    if (!mongoose.Types.ObjectId.isValid(categoriesid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id",
      });
    }

    const category = await LearnArabicCategory.findById(categoriesid);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name) {
      const existing = await LearnArabicCategory.findOne({
        _id: { $ne: categoriesid },
        $or: [{ name: new RegExp(`^${name}$`, "i") }, { slug: slugify(name) }],
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Category already exists",
        });
      }

      category.name = name;
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (statusInput) {
      const normalizedStatus = statusInput.toLowerCase();
      if (!STATUS_VALUES.has(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status provided",
        });
      }
      category.status = normalizedStatus;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update Learn Arabic Category Error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category slug must be unique",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { categoriesid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoriesid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id",
      });
    }

    const category = await LearnArabicCategory.findById(categoriesid);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await LearnArabicCategory.findByIdAndDelete(categoriesid);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete Learn Arabic Category Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};


module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  createWord,
  getCategoryWords,
  getAllWords,
  updateWord,
  deleteWord,
};
