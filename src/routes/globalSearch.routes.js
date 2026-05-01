const express = require("express");
const { globalSearch } = require("../controllers/globalSearch.controller");

const router = express.Router();

router.get("/", globalSearch);
router.get("/global-search", globalSearch);

module.exports = router;
