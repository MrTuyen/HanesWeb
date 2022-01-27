//
const express = require("express");
const router = new express.Router();
const offstandardController = require("../controllers/production/offstandard.controller");
const zoneController = require("../controllers/production/zone.controller");
const authController = require("../middleware/auth.controller");

// Off Standard
router.post("/ie-confirm-offstandard", offstandardController.ieConfirmOfStandard)

// Zone
router.get("/zone/", zoneController.getIndex)
router.post("/zone/get", zoneController.getAllZone)
router.get("/zone/:id", zoneController.getZoneDetail)
router.post("/zone/add", zoneController.addZone)
router.post("/zone/update", zoneController.updateZone)
router.post("/zone/get-zone", zoneController.getZone)
router.post("/zone/get-line-by-zone", zoneController.getLineByZone)

// Line
router.post("/line/get", zoneController.getAllLine)
router.get("/line/:id", zoneController.getLineDetail)
router.post("/line/add", zoneController.addLine)
router.post("/line/update", zoneController.updateLine)

module.exports = router;