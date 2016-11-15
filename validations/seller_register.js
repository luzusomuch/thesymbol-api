var Joi = require('joi');
module.exports = {
  body :{
    "name": Joi.string().min(3).max(30).required(),
    "email": Joi.string().email().required(),
    "address":  Joi.string().required(),
    "password": Joi.string().min(6).max(30).required(),
    "phone": Joi.number().required(),
    "city": Joi.string().required(),
    "state": Joi.string().required(),
    "country": Joi.string().required(),
    "pincode": Joi.string().alphanum().min(4).max(10).required(),
    "govt_issue_card": Joi.string().required(),
    "business_registration": Joi.string().alphanum().min(3).max(30).required()
  }
};
