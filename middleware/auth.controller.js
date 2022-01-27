var authController = {};
const constant = require('../common/constant.js');

authController.authorize = function(roles = []) {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authorize based on user role
        (req, res, next) => {
            if(!req.isAuthenticated()){
                return res.render("login", { msg: "Đã hết phiên đăng nhập. Vui lòng đăng nhập lại." });
            }
            if(req.user.position == constant.Position.Admin){
                return next();
            }
            // if (roles.length && !roles.includes(req.user.roles)) {
            if (roles && !req.user.roles.some(val => roles.includes(val))) {
                // user's role is not authorized
                // return res.status(401).json({ message: 'Bạn không có quyền truy cập chức năng này' });
                return res.redirect('/error');
            }
            // authentication and authorization successful
            next();
        }
    ];
}

authController.authorizeRoleReturnMsg = function(roles = []) {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authorize based on user role
        (req, res, next) => {
            if(!req.isAuthenticated()){
                return res.render("login", { msg: "Đã hết phiên đăng nhập. Vui lòng đăng nhập lại." });
            }
            if(req.user.position == constant.Position.Admin){
                return next();
            }
            // if (roles.length && !roles.includes(req.user.roles)) {
            if (roles && !req.user.roles.some(val => roles.includes(val))) {
                // user's role is not authorized
                return res.end(JSON.stringify({ rs: false, msg: "Bạn không có quyền truy cập chức năng này"}));
            }
            // authentication and authorization successful
            next();
        }
    ];
}

authController.authorizePosition = function(position = "") {
    if (typeof position === 'string') {
        position = position;
    }

    return [
        // authorize based on user role
        (req, res, next) => {
            if(!req.isAuthenticated()){
                return res.render("login", { msg: "Đã hết phiên đăng nhập. Vui lòng đăng nhập lại." });
            }
            if(req.user.position == constant.Position.Admin){
                return next();
            }
            // if (roles.length && !roles.includes(req.user.roles)) {
            if (position && req.user.position != position) {
                // user's role is not authorized
                return res.redirect('/error');
            }
            // authentication and authorization successful
            next();
        }
    ];
}

authController.authorizePositionReturnMsg = function(position = "") {
    if (typeof position === 'string') {
        position = position;
    }

    return [
        // authorize based on user role
        (req, res, next) => {
            if(!req.isAuthenticated()){
                return res.render("login", { msg: "Đã hết phiên đăng nhập. Vui lòng đăng nhập lại." });
            }
            if(req.user.position == constant.Position.Admin){
                return next();
            }
            // if (roles.length && !roles.includes(req.user.roles)) {
            if (position && !req.user.position == position) {
                // user's role is not authorized
                return res.end(JSON.stringify({ rs: false, msg: "Bạn không có quyền truy cập chức năng này"}));
            }
            // authentication and authorization successful
            next();
        }
    ];
}

authController.authorizeDepartment = function(dept = "") {
    if (typeof dept === 'string') {
        dept = dept;
    }

    return [
        // authorize based on user role
        (req, res, next) => {
            if(!req.isAuthenticated()){
                return res.render("login", { msg: "Đã hết phiên đăng nhập. Vui lòng đăng nhập lại." });
            }
            if(req.user.position == constant.Position.Admin){
                return next();
            }
            // if (roles.length && !roles.includes(req.user.roles)) {
            if (dept && req.user.dept != dept) {
                // user's role is not authorized
                return res.redirect('/error');
            }
            // authentication and authorization successful
            next();
        }
    ];
}

authController.authorizeDepartmentReturnMsg = function(dept = "") {
    if (typeof dept === 'string') {
        dept = dept;
    }

    return [
        // authorize based on user role
        (req, res, next) => {
            if(!req.isAuthenticated()){
                return res.render("login", { msg: "Đã hết phiên đăng nhập. Vui lòng đăng nhập lại." });
            }
            if(req.user.position == constant.Position.Admin){
                return next();
            }
            // if (roles.length && !roles.includes(req.user.roles)) {
            if (dept && !req.user.dept == dept) {
                // user's role is not authorized
                return res.end(JSON.stringify({ rs: false, msg: "Bạn không có quyền truy cập chức năng này"}));
            }
            // authentication and authorization successful
            next();
        }
    ];
}

authController.authenticate = (req, res, next) => {
    if(!req.isAuthenticated()){
        return res.render("login", { msg: "Đã hết phiên đăng nhập. Vui lòng đăng nhập lại." });
    }
    // authentication and authorization successful
    next();
}

module.exports = authController;