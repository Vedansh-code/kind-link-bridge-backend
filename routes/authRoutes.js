const express = require("express");
const { signup, login, logout, ngoSignup, ngoLogin } = require("../controllers/authControllers");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/ngo-signup", ngoSignup);
router.post("/ngo-login", ngoLogin);

module.exports = router;
