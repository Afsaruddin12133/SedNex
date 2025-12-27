const express = require("express");
const authRoutes = require("./auth.routes");
const usersRoutes = require("./user.routes");
const postRoutes = require("./post.routes");
const articleRoutes = require("./article.routes");
const touristRoutes = require("./tourist.routes");
const aboutRoutes = require("./about.routes");
const productRoutes = require("./product.routes");
const categoryRoutes = require("./category.routes");


const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/post", postRoutes);
router.use("/article",articleRoutes );
router.use("/tourist", touristRoutes);
router.use("/about", aboutRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);


module.exports = router;
