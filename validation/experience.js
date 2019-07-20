const validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateExperienceInput(data) {
    let errors = {};
    data.title = !isEmpty(data.title) ? data.title : '';
    data.company = !isEmpty(data.company) ? data.company : '';
    data.from = !isEmpty(data.from) ? data.from : '';
    if (validator.isEmpty(data.title)) {
        errors.email = 'title不能为空';
    }
    if (validator.isEmpty(data.company)) {
        errors.company = 'company不能为空';
    }
    if (validator.isEmpty(data.from)) {
        errors.from = 'from不能为空';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    }
}