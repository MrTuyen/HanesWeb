var Database = require("../../database/db.js")
const db = new Database();
const helper = require('../../common/helper.js');
const logHelper = require('../../common/log.js');
const config = require('../../config.js');
const constant = require('../../common/constant');
const excel = require('exceljs');
const innovationService = require("../../services/Innovation/innovation.service");

// UI
module.exports.getIndex = function (req, res) {
    var io = req.app.get('socketio');
    io.emit('realtime', {
        username: "",
        message: ""
    });
    
    res.render('Innovation/Realtime/realtime');
}