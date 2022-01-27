//
const express = require("express");
const router = new express.Router();
const constant = require("../common/constant");
const userController = require("../controllers/systemuser/user.controller");
const authController = require("../middleware/auth.controller");

router.get("/", authController.authorizePosition(constant.Position.Admin), userController.getIndex)
router.post("/get", userController.getUser)
router.get("/:id", userController.getUserDetail)
router.post("/add", userController.addUser)
router.post("/update", userController.updateUser)
router.post("/download", userController.downloadUser)
router.post("/change-password", userController.changePassword)

module.exports = router;