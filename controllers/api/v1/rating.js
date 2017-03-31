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
exports.addReview = function(req, res, next) {
    new Rating(req.body).save(function(err, result) {
        if (err) {
        	return next(err);
        }
        else {
        	return res._response(result);
        }
    });
}
exports.getReview = function(req, res, next) {
    var where = '';
    if (req.query.seller) {
        where = {
            is_deleted: false,
            seller: req.query.seller
        };
    }
    else {
        where = {
            is_deleted: false,
            product: req.query.product
        };
    }

    Rating.find(where).populate({
        path: 'user',
        select: '-password',
        populate: {
            path: 'image', model: 'Image',
            path: 'logo', model: 'Image'
        }
    }).exec(function(err, result) {
        if (err) return res.json(500);
        return res._response({
            reviews: result
        }, "success", 200, "Fetched Successfully");
    });
}