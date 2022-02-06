const express = require("express");
const router = new express.Router();
const dashboardController = require("../controllers/cutting/dashboard.controller");
const authController = require("../middleware/auth.controller");
const offstandardController = require("../controllers/cutting/offstandard.controller");
const fabricReceiveController = require("../controllers/cutting/fabricreceive.controller");

// Dashboard
router.get("/", dashboardController.getIndex)
router.post("/dashboard/get-machine-data", dashboardController.getStackBarMachineData)
router.post("/dashboard/download-machine-data", dashboardController.downloadMachineDataReport)

// Cutting machine
router.post("/get-machines", dashboardController.getMachines)

// Fabric Receive
router.get("/fabric-receive/", fabricReceiveController.getIndex)
router.post("/fabric-receive/add-record", fabricReceiveController.addScannedRecord)
router.post("/fabric-receive/get-history", fabricReceiveController.getHistory)
router.post("/fabric-receive/upload-fabric-file", fabricReceiveController.uploadFabricFile)
router.post("/fabric-receive/save-upload-data", fabricReceiveController.saveUploadData)
router.post("/fabric-receive/get-marker-data", fabricReceiveController.getMarkerData)
router.get("/fabric-receive/marker-data-detail", fabricReceiveController.getIndexMarkerDataDetail)
router.post("/fabric-receive/get-marker-data-detail", fabricReceiveController.getMarkerDataDetail)


router.get("/fabric-receive/inventory-data", fabricReceiveController.getIndexInventoryData)
router.post("/fabric-receive/upload-fabric-inventory-file", fabricReceiveController.uploadFabricInventoryDataFile)
router.post("/fabric-receive/save-upload-fabric-inventory-data", fabricReceiveController.saveUploadFabricInventoryDataFile)
router.post("/fabric-receive/get-inventory-data", fabricReceiveController.getInventoryData)

// Offstandard
router.get("/OffStandard", offstandardController.getOffStandardPage)
router.post('/GetOffStandardTracking', offstandardController.getOffStandardTracking)
router.post('/IsExistedOffStandardTracking', offstandardController.isExistedOffStandardTracking)
router.post('/InsertOffStandardTracking', offstandardController.insertOffStandardTracking)
router.post('/CloseOffStandardTracking', offstandardController.closeOffStandardTracking)
router.post("/ie-confirm-offstandard", offstandardController.ieConfirmOfStandard)

module.exports = router;