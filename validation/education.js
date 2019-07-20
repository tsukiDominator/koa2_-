const validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateExperienceInput(data) {
    let errors = {};
    data.school = !isEmpty(data.school) ? data.school : '';
    data.degree = !isEmpty(data.degree) ? data.degree : '';
    data.filedofstudy = !isEmpty(data.filedofstudy) ? data.filedofstudy : '';
    data.from = !isEmpty(data.from) ? data.from : '';
    if (validator.isEmpty(data.school)) {
        errors.school = 'school不能为空';
    }
    if (validator.isEmpty(data.degree)) {
        errors.degree = 'degree不能为空';
    }
    if (validator.isEmpty(data.filedofstudy)) {
        errors.filedofstudy = 'filedofstudy不能为空';
    }
    if (validator.isEmpty(data.from)) {
        errors.from = 'from不能为空';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    }
}