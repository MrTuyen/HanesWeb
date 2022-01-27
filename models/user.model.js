'use strict';
class UserModel{
    constructor(username, fullname, dept, position, roles, email, group, password){
        this.username = username;
        this.fullname = fullname;
        this.dept = dept;
        this.position = position;
        this.roles = roles;
        this.email = email;
        this.group = group;
        this.password = password;
    }
}

module.exports = UserModel;
