var User = require(ROOT_FOLDER + "/models/users");
var Product = require(ROOT_FOLDER + "/models/product_catelog");
var Rating = require(ROOT_FOLDER + "/models/rating");
var Image = require(ROOT_FOLDER + "/models/image");
var Order = require(ROOT_FOLDER + "/models/order");
var Category = require(ROOT_FOLDER + "/models/category");
var Return = require(ROOT_FOLDER + "/models/return_products");
var License = require(ROOT_FOLDER + "/models/license");
var Wishlist = require(ROOT_FOLDER + "/models/wishlist");
var Mongoose = require('mongoose');
var async = require('async');
var _s_mail = require(ROOT_FOLDER + "/services/mail");
var ObjectId = Mongoose.Types.ObjectId;
exports.addWishlist = function(req, res, next) {
    new Wishlist(req.body)
        .save(function(err, result) {
            if (err) {
            	return next(err);
            }
            else {
            	return res._response(result);
            }
        });
}
exports.getWishlist = function(req, res, next) {
	console.log('here');
  // Product.find({}).exec(function(err, result) {
  //   if (err) return next(err);
  //   return res._response(result);
  // });
}