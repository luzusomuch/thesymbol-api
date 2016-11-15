var User = require(ROOT_FOLDER + "/models/users");
var Product = require(ROOT_FOLDER + "/models/product_catelog");
var Cart = require(ROOT_FOLDER + "/models/cart");
var Order = require(ROOT_FOLDER + "/models/order");
var Address = require(ROOT_FOLDER + "/models/address");
var mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;
exports.getDetails = function(req, res, next) {
    var where = {};
    where["_id"] = req.user._id;
    User.findOne(where)
        .populate("address")
        .populate("shipping")
        .populate("billing")
        .populate("image")
        .populate("logo")
        .populate("banner")
        .exec(function(err, result) {
            if (err) return next(err);
            return res._response(result, "success", 200, "Profile detail fetched successfully.");
        });
}
exports.saveDetails = function(req, res, next) {
    Address.update({
            "_id": req.body.address._id
        }, req.body.address, {})
        .exec(function(err, result) {
            if (err) return next(err);
            return res._response(result, "success", 200, "Profile detail saved successfully.");
        })
}
exports.update = function(req, res, next) {
    var where = {};
    where["is_deleted"] = false;
    where["_id"] = req.user._id;
    User.update(where, req.body, function(err, result) {
        if (err) return next(err);
        return res._response(result, "success", 200, "Profile has been updated successfully.");
    });
}
exports.updatePassword = function(req, res, next) {
    var where = {};
    where["_id"] = req.user._id;
    User.findOne(where)
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user.checkPassword(req.body.old_password))
                return res._response(user, "error", 200, "Your current password is wrong.");
            User.update(where, req.body, {})
                .exec(function(err, result) {
                    if (err) return next(err);
                    return res._response(result, "success", 200, "Your password has been changed successfully.");
                })
        })
}
exports.addAddress = function(req, res, next) {
    var where = {};
    where["_id"] = req.user._id;
    new Address(req.body)
        .save(function(err, result) {
            if (err) return next(err);
            User.update(where, {
                $addToSet: {
                    address: result._id
                }
            }, function(err, result) {
                if (err) return next(err);
                return res._response(result, "success", 200, "Address has been added.");
            })
        });
}
exports.updateAddress = function(req, res, next) {
    var where = {};
    where["_id"] = req.user._id;
    where["address"] = req.params.id;
    User
        .findOne(where)
        .exec(function(err, result) {
            if (err) return next(err);
            else if (result == null) return next(new Error("Unauthorized"));
            else {
                Address.update({
                            _id: req.params.id
                        },
                        req.body)
                    .exec(function(err, result) {
                        if (err) return next(err);
                        return res._response(result, "success", 200, "Address has been updated.");
                    });
            }
        });
}
exports.getAddress = function(req, res, next) {
    var where = {};
    where["_id"] = req.user._id;
    User
        .findOne(where)
        .select("address -_id")
        .populate("address")
        .exec(function(err, result) {
            if (err) return next(err);
            return res._response(result, "success", 200, "Address has been removed.");
        });
}
exports.getSingleAddress = function(req, res, next) {
    var where = {};
    where["_id"] = req.user._id;
    where["address"] = req.params.id;
    User
        .findOne(where)
        .select("address.$ -_id")
        .populate("address")
        .exec(function(err, result) {
            if (err) return next(err);
            return res._response(result, "success", 200, "Address has been removed.");
        });
}
exports.removeAddress = function(req, res, next) {
    var where = {};
    where["_id"] = req.user._id;
    where["address"] = req.params.id;
    User
        .findOneAndUpdate(where, {
            $pull: {
                address: ObjectId(req.params.id)
            }
        }, {
            new: true
        })
        .exec(function(err, result) {
            if (err) return next(err);
            else if (result == null) return next(new Error("Unauthorized"));
            else {
                Address.remove({
                        _id: req.params.id
                    })
                    .exec(function(err, result) {
                        if (err) return next(err);
                        return res._response(result, "success", 200, "Address has been removed.");
                    });
            }
        });
}
