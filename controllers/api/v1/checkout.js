var User = require(ROOT_FOLDER + "/models/users");
var Product = require(ROOT_FOLDER + "/models/product_catelog");
var Cart = require(ROOT_FOLDER + "/models/cart");
var Order = require(ROOT_FOLDER + "/models/order");
var Address = require(ROOT_FOLDER + "/models/address");
var mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;
exports.getAddress = function(req, res, next) {
    User.findOne({
            "_id": req.user._id
        })
        .populate('shipping')
        .populate('billing')
        .populate('address')
        .exec(function(err, result) {
            if (err) return next(err);
            return res._response(result);
        })

}
exports.addBillAddress = function(req, res, next) {
    var address = req.body;
    delete address._id;
    var user = {};
    User.findOne({
        "_id": req.user._id
    }, function(error, data) {
        if (data.billing == undefined) {
            new Address(address)
                .save(function(err, result) {
                    if (err) return next(err);
                    user.billing = result._id;
                    User.update({
                        "_id": req.user._id
                    }, user, {}, function(err, users) {
                        if (err) return next(err);
                        return res._response(users, "success", 200, "lite");
                    });
                });
        } else {
            Address.update({
                "_id": data.billing
            }, address, function(err, users) {
                return res._response(users, "success", 200, "strong");
            });
        }
    });
}
exports.addShipAddress = function(req, res, next) {
    var address = req.body;
    delete address._id;
    var user = {};
    User.findOne({
        "_id": req.user._id
    }, function(error, data) {
        if (data.shipping == undefined) {
            new Address(address)
                .save(function(err, result) {
                    if (err) return next(err);
                    user.shipping = result._id;
                    User.update({
                        "_id": req.user._id
                    }, user, {}, function(err, users) {
                        if (err) return next(err);
                        return res._response(users, "success", 200, "lite");
                    });
                });
        } else {
            Address.update({
                "_id": data.shipping
            }, address, function(err, users) {
                return res._response(users, "success", 200, "strong");
            });
        }
    });
}
