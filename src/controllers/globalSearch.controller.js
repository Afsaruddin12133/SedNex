const Article = require("../models/Article.model");
const ArticaleCategory = require("../models/ArticaleCategory");
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
const Product = require("../models/Product");
const RamadanTime = require("../models/RamadanTime");
const SavedArticle = require("../models/savedArticle.model");
const Section = require("../models/Section");
const SectionItem = require("../models/SectionItem");
const SectionItemDetail = require("../models/SectionItemDetail");
const ServiceCard = require("../models/ServiceCard");
const Team = require("../models/Team");
const Terms = require("../models/Terms");
const TouristSpot = require("../models/TouristSpot");
const User = require("../models/User");

const normalizeKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const MODEL_CONFIG = [
  { keys: ["article", "articles"], model: Article },
  { keys: ["articlecategory", "articlecategories", "articalecategory"], model: ArticaleCategory },
  { keys: ["busflight", "busflights"], model: BusFlight },
  { keys: ["busservice", "busservices"], model: BusService },
  { keys: ["category", "categories"], model: Category },
  { keys: ["comment", "comments"], model: Comment },
  { keys: ["contact", "contacts"], model: Contact },
  { keys: ["faq", "faqs"], model: Faq },
  { keys: ["flightroute", "flightroutes"], model: FlightRoute },
  { keys: ["goldrate", "goldrates"], model: GoldRate },
  { keys: ["goods"], model: Goods },
  { keys: ["homepagemarquee", "marquee"], model: HomepageMarquee },
  { keys: ["homepageslider", "sliders"], model: HomepageSlider },
  { keys: ["learnarabiccategory", "learnarabiccategories"], model: LearnArabicCategory },
  { keys: ["learnarabicword", "learnarabicwords"], model: LearnArabicWord },
  { keys: ["localtour", "localtours"], model: LocalTour },
  { keys: ["notification", "notifications"], model: Notification },
  { keys: ["product", "products"], model: Product },
  { keys: ["ramadantime", "ramadantimes"], model: RamadanTime },
  { keys: ["savedarticle", "savedarticles"], model: SavedArticle },
  { keys: ["section", "sections"], model: Section },
  { keys: ["sectionitem", "sectionitems"], model: SectionItem },
  { keys: ["sectionitemdetail", "sectionitemdetails"], model: SectionItemDetail },
  { keys: ["servicecard", "servicecards"], model: ServiceCard },
  { keys: ["team", "teams"], model: Team },
  { keys: ["terms", "term"], model: Terms },
  { keys: ["touristspot", "touristspots"], model: TouristSpot },
  { keys: ["user", "users"], model: User },
];

const MODEL_REGISTRY = MODEL_CONFIG.reduce((registry, entry) => {
  entry.keys.forEach((key) => {
    registry.set(normalizeKey(key), entry.model);
  });
  return registry;
}, new Map());

const EXCLUDED_MODELS = new Set([
  Category,
  ArticaleCategory,
  LearnArabicCategory,
  Product,
  Goods,
  Terms,
  Contact,
  Faq,
  Team,
]);

const EXCLUDED_FIELDS = [
  "password",
  "resetPasswordToken",
  "resetPasswordOtp",
];

const getSearchableFields = (model) => {
  const fields = [];

  Object.entries(model.schema.paths).forEach(([pathName, schemaType]) => {
    if (pathName === "__v") {
      return;
    }

    if (EXCLUDED_FIELDS.some((field) => pathName.includes(field))) {
      return;
    }

    if (schemaType.instance === "String") {
      fields.push(pathName);
      return;
    }

    if (schemaType.instance === "Array" && schemaType.caster?.instance === "String") {
      fields.push(pathName);
    }
  });

  return fields;
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getSort = (model) => {
  if (model.schema.paths.createdAt) {
    return { createdAt: -1 };
  }

  return undefined;
};

const getModelLabel = (model) => {
  const entry = MODEL_CONFIG.find((item) => item.model === model);
  return entry ? entry.keys[0] : model.modelName;
};

const runModelSearch = async ({ model, searchTerm, page, limit }) => {
  const searchableFields = getSearchableFields(model);

  if (searchableFields.length === 0) {
    return {
      model: getModelLabel(model),
      total: 0,
      page,
      totalPages: 0,
      items: [],
      skipped: true,
    };
  }

  const regex = new RegExp(escapeRegex(searchTerm), "i");
  const filter = {
    $or: searchableFields.map((field) => ({ [field]: regex })),
  };

  const skip = (page - 1) * limit;
  const total = await model.countDocuments(filter);

  let query = model.find(filter).skip(skip).limit(limit);
  const sort = getSort(model);
  if (sort) {
    query = query.sort(sort);
  }

  const items = await query.lean();

  return {
    model: getModelLabel(model),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    items,
  };
};

const globalSearch = async (req, res) => {
  try {
    const rawModel = req.query.model;
    const rawQuery = req.query.q;

    const modelKey = normalizeKey(rawModel);
    const searchTerm = String(rawQuery || "").trim();

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: "q query parameter is required",
      });
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

    if (modelKey) {
      const model = MODEL_REGISTRY.get(modelKey);

      if (!model) {
        return res.status(400).json({
          success: false,
          message: "Invalid model",
          availableModels: Array.from(new Set(MODEL_CONFIG.flatMap((entry) => entry.keys))).filter(
            (key) => !EXCLUDED_MODELS.has(MODEL_REGISTRY.get(normalizeKey(key)))
          ),
        });
      }

      if (EXCLUDED_MODELS.has(model)) {
        return res.status(400).json({
          success: false,
          message: "Selected model is excluded from global search",
        });
      }

      const result = await runModelSearch({
        model,
        searchTerm,
        page,
        limit,
      });

      return res.status(200).json({
        success: true,
        model: rawModel,
        query: searchTerm,
        total: result.total,
        page,
        totalPages: result.totalPages,
        items: result.items,
      });
    }

    const searchableModels = MODEL_CONFIG.map((entry) => entry.model).filter(
      (model) => !EXCLUDED_MODELS.has(model)
    );

    const results = await Promise.all(
      searchableModels.map((model) =>
        runModelSearch({
          model,
          searchTerm,
          page,
          limit,
        })
      )
    );

    const total = results.reduce((sum, item) => sum + (item.total || 0), 0);

    const items = results.flatMap((result) =>
      result.items.map((item) => ({
        ...item,
        model: result.model,
      }))
    );

    return res.status(200).json({
      success: true,
      query: searchTerm,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to run global search",
    });
  }
};

module.exports = { globalSearch };
