const express = require("express");
const { loginOrRegister } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/login", loginOrRegister);

module.exports = router;
