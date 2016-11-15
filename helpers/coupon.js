var Coupon = require(ROOT_FOLDER + "/models/coupon");
var Order = require(ROOT_FOLDER + "/models/order");
exports.decrementQty = function(code, cb) {
    Coupon.update({
        code: code
    }, {
        $inc: {
            uses: -1
        }
    }, cb)
}
exports.isValidCoupon = function(code, user_id, cb) {
    Coupon.findOne({
        code: code,
        start: {
            $lte: new Date().toISOString()
        },
        expiry: {
            $gte: new Date().toISOString()
        },
        uses: {
            $gt: 0
        },
        status: true
    }, function(err, coupon) {
        if (err) return cb(err);
        if (coupon == null) return cb(new Error("Token not Found."));
        Order.findOne({
            "coupon.code": coupon.code,
            "user_id": user_id
        }, function(err, order) {
            if (err) return cb(err);
            if (order != null) return cb(new Error("Coupon already used."));
            return cb(null, coupon);
        });
    });
}
