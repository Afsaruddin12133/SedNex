const Goods = require("../models/Goods");

// =======================
// Create Goods (Admin)
// =======================
const createBasicGoods = async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const icon = req.file ? req.file.path : req.body.icon;

    if (!name || price === undefined || price === null || !icon || !category) {
      return res.status(400).json({
        message: "Name, price, icon, and category are required",
      });
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        message: "Price must be a non-negative number",
      });
    }

    if (typeof category !== "string" || !category.trim()) {
      return res.status(400).json({
        message: "Category must be a non-empty string",
      });
    }

    const goods = await Goods.create({
      name: name.trim(),
      price: numericPrice,
      icon: icon.trim(),
      category: category.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Goods created successfully",
      goods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create goods",
    });
  }
};

// =======================
// Get Goods (Public)
// =======================
const getGoods = async (req, res) => {
  try {
    const goods = await Goods.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: goods.length,
      goods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch goods",
    });
  }
};

// =======================
// Get Goods By Category (Public)
// =======================
const getGoodsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const goods = await Goods.find({ category: category.trim() }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: goods.length,
      goods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch goods by category",
    });
  }
};

// =======================
// Update Goods (Admin)
// =======================
const updateGoods = async (req, res) => {
  try {
    const { goodsId } = req.params;
    const { name, price, category } = req.body;
    const icon = req.file ? req.file.path : req.body.icon;

    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Name must be a non-empty string",
        });
      }
      updates.name = name.trim();
    }

    if (price !== undefined) {
      const numericPrice = Number(price);
      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({
          message: "Price must be a non-negative number",
        });
      }
      updates.price = numericPrice;
    }

    if (category !== undefined) {
      if (typeof category !== "string" || !category.trim()) {
        return res.status(400).json({
          message: "Category must be a non-empty string",
        });
      }
      updates.category = category.trim();
    }

    if (icon !== undefined) {
      if (typeof icon !== "string" || !icon.trim()) {
        return res.status(400).json({
          message: "Icon must be a non-empty string",
        });
      }
      updates.icon = icon.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide at least one field to update",
      });
    }

    const goods = await Goods.findByIdAndUpdate(
      goodsId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!goods) {
      return res.status(404).json({
        message: "Goods not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Goods updated successfully",
      goods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update goods",
    });
  }
};

module.exports = {
  createBasicGoods,
  getGoods,
  getGoodsByCategory,
  updateGoods,
};
