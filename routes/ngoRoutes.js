const express = require("express");
const { getAllNgos, getNgoById } = require("../controllers/ngoControllers");

const router = express.Router();

router.get("/", getAllNgos);
router.get("/:id", getNgoById);

module.exports = router;
