//
const express = require("express");
const constant = require('../common/constant');
const router = new express.Router();
const partController = require("../controllers/innovation/innovation.controller");
const machineController = require("../controllers/innovation/machine.controller");
const importController = require("../controllers/innovation/import.controller");
const dashboardController = require("../controllers/innovation/dashboard.controller");
const userController = require("../controllers/innovation/user.controller");
const realtimeController = require("../controllers/innovation/realtime.controller");
const positionController = require("../controllers/innovation/position.controller");
const authController = require("../middleware/auth.controller");
const workcenter = require("../controllers/innovation/sewingRealtime/workcenter.controller");
const realtimeDashboard= require("../controllers/innovation/sewingRealtime/dashboard.controller");
const machine = require("../controllers/innovation/sewingRealtime/machine.controller");
const losstime = require("../controllers/innovation/sewingRealtime/losstime.controller");
// Dashboard
router.get("/dashboard", authController.authorize([4,5]), dashboardController.getDashboard)
router.post("/dashboard/get-count", dashboardController.getStatistic)
router.post("/dashboard/get-pie-chart", dashboardController.getPieChartData)

// Sparepart request route
router.get("/", partController.getIndex)
router.post("/getPartRequest", partController.getPartRequest)
router.get("/request/:id", partController.getRequestDetail)
router.post("/suggest", partController.suggestPart)
router.post("/request/add", partController.addRequest)
router.post("/request/update", partController.updateRequest)
router.post("/request/manager-approve", partController.managerApprove)
router.post("/request/manager-reject", partController.managerReject)
router.post("/request/senior-manager-approve", partController.sManagerApprove)
router.post("/request/senior-manager-reject", partController.sManagerReject)

router.post("/request/clerk-update", partController.clerkApprove)
router.post("/request/clerk-reject", partController.clerkReject)

router.post("/request/download", partController.downloadRequest)
router.post("/request/get-mechanic", partController.getMechanicById)
router.post("/request/get-part-by-model", partController.getPartByModel)

// Warning part
router.post("/warning", partController.getWarningPart)
router.post("/warning/download", partController.downloadWarningPart)

// Part
router.post("/parts", partController.getAllPart)
router.get("/parts/:id", partController.getPartDetail)
router.post("/parts/add", partController.addPart)
router.post("/parts/update", partController.updatePart)
router.post("/part/upload", partController.upload)
router.post("/part/download", partController.downloadPart)

// Sewing Machine
router.get("/sewing-machine/:id", machineController.getSewingMachineDetail)
router.post("/sewing-machine/get", machineController.getSewingMachine)
router.post("/sewing-machine/add", machineController.addSewingMachine)
router.post("/sewing-machine/update", machineController.updateSewingMachine)
router.post("/sewing-machine/update-position", machineController.updatePositionSewingMachine)
router.post("/sewing-machine/get-position-history", machineController.getPositionHistory)
router.post("/sewing-machine/download-position-history", machineController.downloadPositionHistory)

// router.post("/sewing-machine/download", machineController.downloadSewingMachine)

// Machine
// router.get("/machine", authController.authenticate, controller.getMachineIndex)
router.get("/machine", machineController.getMachineIndex)
router.get("/machine/:id", machineController.getMachineDetail)
router.post("/machine/get", machineController.getMachine)
router.post("/machine/add", machineController.addMachine)
router.post("/machine/update", machineController.updateMachine)
router.post("/machine/download", machineController.downloadMachine)

// Model
router.get("/model/:id", machineController.getModelDetail)
router.post("/model/get", machineController.getModel)
router.post("/model/add", machineController.addModel)
router.post("/model/update", machineController.updateModel)
router.post("/model/download", machineController.downloadModel)

// Import part from vendor
router.get("/import", importController.getImportIndex)
router.post("/import/get", importController.getImport)
router.post("/import/get-import-detail", importController.getImportDetail)
router.get("/import/add", importController.addUI)
router.post("/import/add", importController.addImportRequest)
router.post("/import/update", importController.updateImportRequest)
router.post("/import/download", importController.downloadImportRequest)
// router.post("/import/get-po", importController.getPOInfo)

// User
router.get("/user", userController.getIndex)
router.post("/user/get", userController.getUser)
router.get("/user/:id", authController.authorizeRoleReturnMsg([7,8]), userController.getUserDetail)
router.post("/user/add", userController.addUser)
router.post("/user/update", userController.updateUser)
router.post("/user/download", userController.downloadUser)

// Realtime
router.get("/realtime", realtimeController.getIndex)

// Position
router.get("/machine-position", positionController.getIndex)

//sewingRealtime
//router losstime
router.get('/realtime/losstime',losstime.getLosstime);
router.post('/realtime/losstime',losstime.postLosstime);
// router machine
router.get('/realtime/workcenter',workcenter.getHomePage);
router.post("/realtime/updateZone",workcenter.adjustingZone);
router.get('/realtime/machine',machine.getMachine);
router.post('/realtime/machine',machine.postMachine);
router.post('/realtime/machineData',machine.postMachneData);
router.post('/realtime/updateMachine',machine.postUpdateMachine);
// router dashboard 
router.get('/realtime/dashboard',realtimeDashboard.getDashboard);
router.post('/realtime/locations',realtimeDashboard.portLocations);
router.post('/realtime/dataSubmit',realtimeDashboard.postDataSubmit);
router.post('/realtime/downloadReport',realtimeDashboard.portDownloadReport);
router.get('/realtime/detailDashboard',realtimeDashboard.getdetailDashboard);
router.post('/realtime/DetailDataSubmit',realtimeDashboard.postDetailDataSubmit);
module.exports = router;