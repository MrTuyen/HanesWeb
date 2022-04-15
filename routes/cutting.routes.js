const express = require("express");
const router = new express.Router();
const dashboardController = require("../controllers/cutting/dashboard.controller");
const authController = require("../middleware/auth.controller");
const offstandardController = require("../controllers/cutting/offstandard.controller");
const fabricReceiveController = require("../controllers/cutting/fabricreceive.controller");
const mixsolveController = require("../controllers/cutting/mixsolve.controller");

// Dashboard
router.get("/", dashboardController.getIndex)
router.post("/dashboard/get-machine-data", dashboardController.getStackBarMachineData)
router.post("/dashboard/download-machine-data", dashboardController.downloadMachineDataReport)

// Cutting machine
router.post("/get-machines", dashboardController.getMachines)

// Fabric Receive
// Fabric Receive: Marker data
router.get("/fabric-receive/", fabricReceiveController.getIndex)
router.post("/fabric-receive/add-record", fabricReceiveController.addScannedRecord)
router.post("/fabric-receive/get-history", fabricReceiveController.getHistory)
router.post("/fabric-receive/upload-fabric-file", fabricReceiveController.uploadFabricFile)
router.post("/fabric-receive/save-upload-data", fabricReceiveController.saveUploadData)
router.post("/fabric-receive/save-upload-return-data", fabricReceiveController.saveUploadReturnData)
router.post("/fabric-receive/get-marker-data", fabricReceiveController.getMarkerData)
router.get("/fabric-receive/marker-data-detail", fabricReceiveController.getIndexMarkerDataDetail)
router.post("/fabric-receive/get-marker-data-detail", fabricReceiveController.getMarkerDataDetail)
router.post("/fabric-receive/action", fabricReceiveController.action)
router.get("/fabric-receive/scan-marker-data-detail", fabricReceiveController.getIndexScanMarkerDataDetail)
router.post("/fabric-receive/warehouse-confirm", fabricReceiveController.warehouseConfirm)
router.post("/fabric-receive/ccd-confirm", fabricReceiveController.ccdConfirm)

// Marker team update
router.get("/fabric-receive/marker-update", fabricReceiveController.getIndexMarkerUpdate)
router.post("/fabric-receive/marker-update", fabricReceiveController.markerUpdate)
router.post("/fabric-receive/save-update-upload-data", fabricReceiveController.saveUpdateUploadData)

// Issue team update
router.post("/fabric-receive/issue-update", fabricReceiveController.issueUpdate)

// Index
router.post("/fabric-receive/print-ticket", fabricReceiveController.printTicket)
router.post("/fabric-receive/download-marker-data", fabricReceiveController.downloadMarkerData)
router.post("/fabric-receive/download-roll-data", fabricReceiveController.downloadRollData)

// Fabric Receive: Inventory data
router.get("/fabric-receive/inventory-data", fabricReceiveController.getIndexInventoryData)
router.post("/fabric-receive/upload-fabric-inventory-file", fabricReceiveController.uploadFabricInventoryDataFile)
router.post("/fabric-receive/save-upload-fabric-inventory-data", fabricReceiveController.saveUploadFabricInventoryDataFile)
router.post("/fabric-receive/get-inventory-data", fabricReceiveController.getInventoryData)
router.get("/fabric-receive/get-inventory-data-detail/:id", fabricReceiveController.getInventoryDataDetail)
router.post("/fabric-receive/update-inventory-data-detail", fabricReceiveController.updateInventoryDataDetail)
router.post("/fabric-receive/download-inventory-data", fabricReceiveController.downloadInventoryData)
router.post("/fabric-receive/get-inventory-data-tts", fabricReceiveController.getInventoryDataTTS)

// Fabric Receive: Return data
router.get("/fabric-receive/return-data", fabricReceiveController.getIndexReturnData)
router.post("/fabric-receive/get-return-data", fabricReceiveController.getReturnData)
router.get("/fabric-receive/return-data-detail", fabricReceiveController.getIndexReturnDataDetail)
router.post("/fabric-receive/get-return-data-detail", fabricReceiveController.getReturnDataDetail)
router.post("/fabric-receive/wh-confirm-return", fabricReceiveController.whConfirmReturn)

// Offstandard
router.get("/OffStandard", offstandardController.getOffStandardPage)
router.post('/GetOffStandardTracking', offstandardController.getOffStandardTracking)
router.post('/IsExistedOffStandardTracking', offstandardController.isExistedOffStandardTracking)
router.post('/InsertOffStandardTracking', offstandardController.insertOffStandardTracking)
router.post('/CloseOffStandardTracking', offstandardController.closeOffStandardTracking)
router.post("/ie-confirm-offstandard", offstandardController.ieConfirmOfStandard)

// Mixsolve
router.get("/MixSolve", mixsolveController.getIndex)

module.exports = router;