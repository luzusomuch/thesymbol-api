var Coupon = require(ROOT_FOLDER + "/models/coupon");
var Order = require(ROOT_FOLDER + "/models/order");
var _h_coupon = require(ROOT_FOLDER + "/helpers/coupon");

exports.create = function(req, res, next) {
    new Coupon(req.body).save(function(err, result) {
        if (err) return next(err);
        return res._response(result);
    });
}
exports.remove = function(req, res, next) {
    Coupon.remove({
        _id: req.params.id
    }).exec(function(err, result) {
        if (err) return next(err);
        return res._response(result);
    });
}
exports.update = function(req, res, next) {
    Coupon.update({
        _id: req.params.id
    }, req.body).exec(function(err, result) {
        if (err) return next(err);
        return res._response(result);
    });
}
exports.fetch = function(req, res, next) {
    Coupon.findOne({
        _id: req.params.id
    }).exec(function(err, result) {
        if (err) return next(err);
        return res._response(result);
    });
}
exports.query = function(req, res, next) {
    Coupon.find({
        status: true
    }).exec(function(err, result) {
        if (err) return next(err);
        return res._response(result);
    });
}
exports.check = function(req, res, next) {
    _h_coupon.isValidCoupon(req.params.id, req.user._id, function(err, result) {
        if (err) return next(err);
        return res._response(result);
    })
}
