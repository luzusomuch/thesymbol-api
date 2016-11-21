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

    console.log(req.body);

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
    var where = {
      is_deleted: false,
      user_id: req.query.user_id
    };

    Wishlist
        .find(where)
        .populate({
          path: 'product_id',
        })
        .exec(function(err, result) {
            var options = {
              path: 'product_id.images',
              model: 'Image'
            };

            if (err) return res.json(500);
            Wishlist.populate(result, options, function (err, result) {
              if (!err) {
                return res._response({
                  products: result
                }, "success", 200, "Fetched Successfully");
              }
              return next(err);
            });

        });
}
exports.deleteWishlist = function(req, res, next) {
    Wishlist.update({_id: req.query.wishlist_id},
      {$set: {is_deleted: true}},
      function(err, result) {
        if (err) {
          return next(err);
        }
        else{
          return res._response(result);
        }
      });
}
exports.checkWishlist = function(req, res, next) {
    console.log(req.query.product_id);
    console.log(req.query.user_id);

    var where = {
      product_id: req.query.product_id,
      user_id: req.query.user_id,
      is_deleted: false
    }

    Wishlist.find(where)
      .exec(function(err, result) {
        if (err) {
          return next(err);
        }
        else{
          return res._response(result);
        }
      });
}