'use strict';

const AppError = require('../errors/AppError');

function validate(schema) {
  return (req, _res, next) => {
    const errors = [];

    ['body', 'params', 'query'].forEach((part) => {
      if (!schema[part]) return;
      const { error } = schema[part].validate(req[part], { abortEarly: false });
      if (error) {
        error.details.forEach((d) => {
          errors.push({ field: d.path.join('.'), message: d.message });
        });
      }
    });

    if (errors.length > 0) {
      const err = new AppError(400, 'VALIDATION_ERROR', '입력값을 확인해 주세요.');
      err.details = errors;
      return next(err);
    }

    return next();
  };
}

module.exports = validate;
