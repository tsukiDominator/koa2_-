const validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateRegisterInput(data) {
    let errors = {};
    data.name = !isEmpty(data.name) ? data.name : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';

    if (!validator.isLength(data.name, { min: 2, max: 20 })) {
        errors.name = '名字的长度不能小于2位且不能超过20位';
    }
    if (validator.isEmpty(data.name)) {
        errors.name = '名字不能为空';
    }
    if (!validator.isEmail(data.email)) {
        errors.email = '邮箱不合法';
    }
    if (validator.isEmpty(data.email)) {
        errors.email = '邮箱不能为空';
    }
    if (validator.isEmpty(data.password)) {
        errors.password = '密码不能为空';
    }
    if (!validator.isLength(data.password, { min: 5, max: 30 })) {
        errors.password = '密码的长度不能小于5位且不能超过30位';
    }
    if (!validator.equals(data.password, data.password2)) {
        errors.password2 = '两次密码不一致';
    }
    if (validator.isEmpty(data.password2)) {
        errors.password2 = '再次输入密码不能为空';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    }
}