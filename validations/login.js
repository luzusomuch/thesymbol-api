var Joi = require('joi');
module.exports = {
  body :{
    "email": Joi.string().email().required(),
    "password": Joi.string().min(6).max(30).required()
  }
};
