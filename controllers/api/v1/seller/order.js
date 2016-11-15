var User = require(ROOT_FOLDER + "/models/users");
var Address = require(ROOT_FOLDER + "/models/address");
var Image = require(ROOT_FOLDER + "/models/image");
var Orders = require(ROOT_FOLDER + "/models/order");
var async = require("async");
var mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;
exports.getOrders = function(req, res, next) {
    var status = req.query.status ? req.query.status : "Completed";
    Orders
        .aggregate()
        .unwind("products")
        .match({
            "products.status": status,
            "products.shop_id": ObjectId(req.user._id)
        })
        .sort({
            created_at: -1
        })
        .lookup({
            from: "product_catelogs",
            localField: "products.id",
            foreignField: "_id",
            as: "products1"
        })
        .project({
            delivery_status: "$products.tracking.status",
            order_status: "$products.status",
            shipping: "$shipping",
            product_id: "$products.id",
            date_added: "$created_at",
            price: "$products.price",
            quantity: "$products.quantity",
            products: "$products1"
        })
        .exec(function(err, orders) {
            if (err) return next(err);
            Image.populate(orders, {
                path: "products.images"
            }, function(err, orders) {
                if (err) return next(err);
                return res._response({
                    orders: orders
                });
            });
        })
}
exports.getSingleOrder = function(req, res, next) {
    Orders
        .aggregate()
        .unwind("products")
        .match({
            "_id": ObjectId(req.params.id),
            "products.shop_id": ObjectId(req.user._id)
        })
        .lookup({
            from: "product_catelogs",
            localField: "products.id",
            foreignField: "_id",
            as: "original_product"
        })
        .group({
            _id: "$_id",
            shipping: {
                $first: "$shipping"
            },
            billing: {
                $first: "$billing"
            },
            total_price: {
                $first: "$total_price"
            },
            total_tax: {
                $first: "$total_tax"
            },
            total_shipping: {
                $first: "$total_shipping"
            },
            products: {
                $push: {
                    name: {
                        $arrayElemAt: ["$original_product.name", 0]
                    },
                    title: {
                        $arrayElemAt: ["$original_product.title", 0]
                    },
                    description: {
                        $arrayElemAt: ["$original_product.description", 0]
                    },
                    sku: {
                        $arrayElemAt: ["$original_product.sku", 0]
                    },
                    quantity: {
                        $arrayElemAt: [, 0]
                    },
                    images: {
                        $arrayElemAt: ["$original_product.images", 0]
                    },
                    pricing: {
                        $arrayElemAt: ["$original_product.pricing", 0]
                    },
                    shipping_details: {
                        $arrayElemAt: ["$original_product.shipping_details", 0]
                    },
                    bought_price: "$products.price",
                    bought_quantity: "$products.quantity",
                    tracking: "$products.tracking",
                }
            }
        })
        .exec(function(err, orders) {
            if (err) return next(err);
            Image.populate(orders, {
                path: "products.images"
            }, function(err, orders) {
                if (err) return next(err);
                return res._response({
                    orders: orders
                });
            });
        })
}
exports.AcceptOrders = function(req, res, next) {
    new Orders({
        "user_id": "57a9ba04c11280363b7f656d",
        "products": [{
            "id": "57a857d670151f3842eb62af",
            "shop_id": "57a9ba04c11280363b7f656d",
            "quantity": 7.0,
            "price": 700.0,
            "tracking": {
                "company": null,
                "tracking_number": null,
                "status": "Cancelled",
                "estimated_delivery": null
            }
        }, {
            "id": "57a857d670151f3842eb62af",
            "shop_id": "57a9ba04c11280363b7f656d",
            "quantity": 7.0,
            "price": 700.0,
            "tracking": {
                "company": null,
                "tracking_number": null,
                "status": "Cancelled",
                "estimated_delivery": null
            }
        }],
        "shipping": {
            "customer": "vivek",
            "address": "address",
            "city": "city",
            "region": "region",
            "state": "state",
            "country": "country",
            "delivery_notes": "notes"
        },
        "quantity": 14,
        "price": 1400,
        "status": true,
        "created_at": null,
        "updated_at": null,
        "is_deleted": false
    }).save(function(err, result) {
        res.json(err || result)
    })
}
exports.updateOrder = function(req, res, next) {
    var update = {};
    update["products.$.status"] = req.query.status;
    if (req.query.status == "Approved")
        update["products.$.tracking.status"] = "Yet To Be Shipped";
    else if(req.query.status == "Rejected" || req.query.status == "Completed" || req.query.status == "Delivered")
        update["products.$.tracking.status"] = req.query.status;
    Orders.update({
        "_id": req.params.order_id,
        "products.id": req.params.product_id
    }, update, function(err, result) {
        if (err) return next(err);
        return res._response(result, "success", 200, "Updated Successfully");
    })
}
exports.getUnShippedOrders = function(req, res, next) {

}
exports.ShipOrders = function(req, res, next) {

}
