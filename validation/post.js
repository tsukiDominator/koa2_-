const validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatePostInput(data) {
    let errors = {};
    data.text = !isEmpty(data.text) ? data.text : '';
    if (!validator.isLength(data.text, { min: 10, max: 300 })) {
        errors.text = 'text的长度不能小于10位且不能超过300位';
    }
    if (validator.isEmpty(data.text)) {
        errors.text = 'text不能为空';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    }
}