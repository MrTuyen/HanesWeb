var Database = require("../../database/db_erpsystem.js")
const db = new Database();
const logHelper = require('../../common/log.js');
const constant = require('../../common/constant');

module.exports.getIndex = function (req, res) {
    res.render('Cutting/MixSolve');
}