const express = require("express");
const { getAllNgos, getNgoById, searchNgos, getRecommendationsForUser, getVisits, getDonations, getCallbacks } = require("../controllers/ngoControllers");


const router = express.Router();

router.get("/", getAllNgos);
router.get("/search", searchNgos);
router.get("/:ngoId/visits", getVisits);
router.get("/:ngoId/donations", getDonations);
router.get("/:ngoId/callbacks", getCallbacks);
router.get("/recommendations/:userId", getRecommendationsForUser);
router.get("/:id", getNgoById);

module.exports = router;
