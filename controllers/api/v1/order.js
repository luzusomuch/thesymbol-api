var User = require(ROOT_FOLDER + "/models/users");
var Address = require(ROOT_FOLDER + "/models/address");
var Orders = require(ROOT_FOLDER + "/models/order");
var async = require("async");
exports.getOrders = function(req, res, next) {
    var match = {};
    Orders
        .aggregate()
        .unwind('products')
        .match(req.query)
        .lookup({
            from: 'product_catelogs',
            localField: 'products.id',
            foreignField: '_id',
            as: 'product'
        })
        .lookup({
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
        })
        .lookup({
            from: 'users',
            localField: 'products.shop_id',
            foreignField: '_id',
            as: 'seller'
        })
        .project({
            _id: "$_id",
            product: {
                $arrayElemAt: ["$product", 0]
            },
            seller: {
                $arrayElemAt: ["$seller", 0]
            },
            product_status: "$products.tracking.status",
            returned_reason: "$products.tracking.reason",
            product_index: "$products._id",
            bought_qty: "$products.quantity",
            bought_price: "$products.price",
            created_at: 1,
            payment: 1,
            user: {
                $arrayElemAt: ["$user", 0]
            },
        })
        .group({
            _id: {
                _id: "$_id",
                seller: "$seller._id"
            },
            product_status: {
              $first: "$product_status"
            },
            returned_reason: {
              $first: "$returned_reason"
            },
            user: {
              $first: {
                name: "$user.name",
                email: "$user.email",
                phone: "$user.phone"
              }
            },
            total_price: {
              $sum: "$bought_price"
            },
            payment: {
              $first: "$payment"
            },
            created_at: {
              $first: "$created_at"
            },
            total_qty: {
              $sum: "$bought_qty"
            },
            total_qty: {
              $sum: "$bought_qty"
            },
            seller: {
              $first: {
                name : "$seller.name",
                email : "$seller.email",
                phone : "$seller.phone"
              }
            }
        })
        .exec(function(err, result) {
            if (err) return next(err);
            res._response(result);
        });
}
