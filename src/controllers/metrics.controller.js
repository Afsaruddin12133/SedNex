const ArticaleCategory = require("../models/ArticaleCategory");
const Article = require("../models/Article.model");
const BusFlight = require("../models/BusFlight");
const BusService = require("../models/BusService");
const Category = require("../models/Category");
const Comment = require("../models/Comment");
const Contact = require("../models/Contact");
const Faq = require("../models/Faq");
const FlightRoute = require("../models/FlightRoute");
const GoldRate = require("../models/GoldRate");
const Goods = require("../models/Goods");
const HomepageMarquee = require("../models/HomepageMarquee");
const HomepageSlider = require("../models/HomepageSlider");
const LearnArabicCategory = require("../models/LearnArabicCategory");
const LearnArabicWord = require("../models/LearnArabicWord");
const LocalTour = require("../models/LocalTour");
const Notification = require("../models/Notification");
const Post = require("../models/Post");
const Product = require("../models/Product");
const RamadanTime = require("../models/RamadanTime");
const SavedArticle = require("../models/savedArticle.model");
const SavedPost = require("../models/savedPost.model");
const Section = require("../models/Section");
const SectionItem = require("../models/SectionItem");
const SectionItemDetail = require("../models/SectionItemDetail");
const ServiceCard = require("../models/ServiceCard");
const Team = require("../models/Team");
const Terms = require("../models/Terms");
const TouristSpot = require("../models/TouristSpot");
const User = require("../models/User");

const metricDefinitions = [
  { key: "users", model: User },
  { key: "posts", model: Post },
  { key: "articles", model: Article },
  { key: "products", model: Product },
  { key: "categories", model: Category },
  { key: "sections", model: Section },
  { key: "sectionItems", model: SectionItem },
  { key: "sectionItemDetails", model: SectionItemDetail },
  { key: "touristSpots", model: TouristSpot },
  { key: "localTours", model: LocalTour },
  { key: "busFlights", model: BusFlight },
  { key: "busServices", model: BusService },
  { key: "flightRoutes", model: FlightRoute },
  { key: "ramadanTimes", model: RamadanTime },
  { key: "goods", model: Goods },
  { key: "notifications", model: Notification },
  { key: "comments", model: Comment },
  { key: "savedPosts", model: SavedPost },
  { key: "savedArticles", model: SavedArticle },
  { key: "homepageMarquees", model: HomepageMarquee },
  { key: "homepageSliders", model: HomepageSlider },
  { key: "serviceCards", model: ServiceCard },
  { key: "goldRates", model: GoldRate },
  { key: "faq", model: Faq },
  { key: "terms", model: Terms },
  { key: "teams", model: Team },
  { key: "contacts", model: Contact },
  { key: "learnArabicCategories", model: LearnArabicCategory },
  { key: "learnArabicWords", model: LearnArabicWord },
  { key: "articleCategories", model: ArticaleCategory },
];

const getMetrics = async (req, res) => {
  try {
    const counts = await Promise.all(
      metricDefinitions.map((item) => item.model.countDocuments())
    );

    const metrics = metricDefinitions.reduce((acc, item, index) => {
      acc[item.key] = counts[index];
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      generatedAt: new Date().toISOString(),
      metrics,
    });
  } catch (error) {
    console.error("Get Metrics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch metrics",
    });
  }
};

module.exports = {
  getMetrics,
};
