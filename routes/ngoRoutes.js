const express = require("express");
const { getAllNgos, getNgoById, searchNgos, getRecommendationsForUser } = require("../controllers/ngoControllers");

const router = express.Router();

router.get("/", getAllNgos);
router.get("/search", searchNgos);
router.get("/recommendations/:userId", getRecommendationsForUser);
router.get("/:id", getNgoById);

module.exports = router;
