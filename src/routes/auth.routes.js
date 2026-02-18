const express = require("express");
const { login, register } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/login", login);
router.post("/signin", register);

module.exports = router;
