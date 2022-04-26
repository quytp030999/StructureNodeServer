const Joi = require("joi");

const userRegisterValidation = (data) => {
  const userSchema = Joi.object({
    username: Joi.string()
      .pattern(new RegExp(`gmail.com`))
      .email()
      .lowercase()
      .required(),
    password: Joi.string().lowercase().required(),
  });
  return userSchema.validate(data);
};

const userGetListValidation = (data) => {
  const userGetListSchema = Joi.object({
    page: Joi.number().required(),
    offset: Joi.number().required(),
  });

  return userGetListSchema.validate({
    page: data.page,
    offset: data.offset,
  });
};

module.exports = {
  userRegisterValidation: userRegisterValidation,
  userGetListValidation: userGetListValidation,
};
