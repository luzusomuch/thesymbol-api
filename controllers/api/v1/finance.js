var User = require(ROOT_FOLDER + "/models/users");
var Address = require(ROOT_FOLDER + "/models/address");
var Orders = require(ROOT_FOLDER + "/models/order");
var Payment = require(ROOT_FOLDER + "/models/payment");
var Settings = require(ROOT_FOLDER + "/models/site_configuration");
var _s_mail = require(ROOT_FOLDER + "/services/mail");
var mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;
var async = require("async");
var getOrders = function(id, settings, cb) {
    var where = {};
    where['payment.status'] = "Completed";
    if (id)
        where['products.shop_id'] = ObjectId(id);
        console.log(where)
    Orders
        .aggregate()
        .unwind('products')
        .match(where)
        .group({
            _id: {
                order: "$_id",
                seller: "$products.shop_id"
            },
            price: {
                $sum: "$products.price"
            },
            product_count: {
                $sum: 1
            },
            product: {
                $push: "$products"
            },
            seller: {
                "$first": "$products.shop_id"
            }
        })
        .group({
            _id: {
                seller: "$seller"
            },
            order_count: {
                $sum: 1
            },
            product_count: {
                $sum: "$product_count"
            },
            price: {
                $sum: "$price"
            },
            seller: {
                $first: "$seller"
            }
        })
        .lookup({
            from: 'users',
            localField: 'seller',
            foreignField: '_id',
            as: 'seller'
        })
        .lookup({
            from: 'payments',
            localField: '_id.seller',
            foreignField: 'user',
            as: 'payments'
        })
        .project({
            _id: "$_id.seller",
            order_count: 1,
            product_count: 1,
            price: 1,
            payments: 1,
            paid_outs: {
                $filter: {
                    input: "$payments",
                    as: "payment",
                    cond: {
                        $eq: ["$$payment.transaction_type", 'payout']
                    }

                }
            },
            refunds: {
                $filter: {
                    input: "$payments",
                    as: "payment",
                    cond: {
                        $eq: ["$$payment.transaction_type", 'refund']
                    }
                }
            },
            commission_percentage: {
                $concat: [String(settings.commission), "%"]
            },
            commission_amount: {
                $multiply: [settings.commission, {
                    $divide: ["$price", 100]
                }]
            },
            payable_amount: {
                $subtract: ["$price", {
                    $multiply: [settings.commission, {
                        $divide: ["$price", 100]
                    }]
                }]
            },
            seller_name: {
                $arrayElemAt: ["$seller.name", 0]
            },
            seller_email: {
                $arrayElemAt: ["$seller.email", 0]
            },
            seller_phone: {
                $arrayElemAt: ["$seller.phone", 0]
            }
        })
        .project({
            _id: 1,
            order_count: 1,
            order_count: 1,
            product_count: 1,
            price: 1,
            payments: 1,
            paid_out_amount: {
                $sum: "$paid_outs.transferred_amount"
            },
            refund_amount: {
                $sum: "$refunds.transferred_amount"
            },
            commission_percentage: 1,
            commission_amount: 1,
            payable_amount: {
                $subtract: ["$price", {
                    $sum: [
                        "$commission_amount", {
                            $sum: "$paid_outs.transferred_amount"
                        }, {
                            $sum: "$refunds.transferred_amount"
                        }
                    ]
                }]
            },
            seller_name: 1,
            seller_email: 1,
            seller_phone: 1
        })
        .exec(cb);
}
exports.getFinance = function(req, res, next) {
    var match = {};
    var response = {};
    async.waterfall([
        function(cb) {
            Settings.findOne({}, function(err, result) {
                if (err) return next(err);
                response.settings = result;
                cb(null, response);
            });
        },
        function(response, cb) {
            var id = req.params.id;
            getOrders(id, response.settings, function(err, result) {
                if (err) return next(err);
                response.transactions = result;
                cb(null, response);
            });
        }
    ], function(err, result) {
        if (err) return next(err);
        return res._response(result);
    });
}
exports.payAmount = function (req, res, next) {
  req.body.user = req.params.id;
  new Payment(req.body).save(function(err, result){
    if (err) return next(err);
    _s_mail.sendPayNotification(req.body);
    return res._response(result);
  });
}
