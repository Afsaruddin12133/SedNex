const express = require("express");
const authRoutes = require("./auth.routes");
const usersRoutes = require("./user.routes");
const postRoutes = require("./post.routes");
const articleRoutes = require("./article.routes");
const touristRoutes = require("./tourist.routes");
const aboutRoutes = require("./about.routes");
const productRoutes = require("./product.routes");
const categoryRoutes = require("./category.routes");
const sectionRoutes = require("./section.routes");
const learnArabicRoutes = require("./learnArabic.routes");
const homepageRoutes = require("./homepage.routes");
const goodsRoutes = require("./goods.routes");
const localTourRoutes = require("./localTour.routes");
const busFlightsRoutes = require("./busFlights.routes");
const flightRouteRoutes = require("./flightRoute.routes");
const busServicesRoutes = require("./busServices.routes");
const ramadanTimeRoutes = require("./ramadanTime.routes");
const notificationRoutes = require("./notification.routes");
const metricsRoutes = require("./metrics.routes");


const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/post", postRoutes);
router.use("/article",articleRoutes );
router.use("/tourist", touristRoutes);
router.use("/about", aboutRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/sections", sectionRoutes);
router.use("/learn-arabic", learnArabicRoutes);
router.use("/homepage", homepageRoutes);
router.use("/goods", goodsRoutes);
router.use("/local-tour", localTourRoutes);
router.use("/bus-flights", busFlightsRoutes);
router.use("/flight-routes", flightRouteRoutes);
router.use("/bus-services", busServicesRoutes);
router.use("/ramadan-times", ramadanTimeRoutes);
router.use("/notifications", notificationRoutes);
router.use("/metrics", metricsRoutes);

module.exports = router;

