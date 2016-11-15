var Joi = require('joi');
module.exports = {
  body :{
    "name": Joi.string().min(3).max(30).required(),
    "email": Joi.string().email().required(),
    "password": Joi.string().min(6).max(30).required()
  }
};
