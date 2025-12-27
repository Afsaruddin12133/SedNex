const Category = require("../models/Category");

const createCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const exists = await Category.findOne({ name: name.trim() });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = new Category({
      name: name.trim(),
      description: description ? description.trim() : undefined,
      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    await category.save();

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category slug must be unique",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const includeInactive = req.query.includeInactive === "true";
    const filter = includeInactive ? {} : { isActive: true };

    const categories = await Category.find(filter)
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      total: categories.length,
      categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
};
