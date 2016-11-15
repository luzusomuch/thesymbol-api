var Product = require(ROOT_FOLDER + "/models/product_catelog");
var Order = require(ROOT_FOLDER + "/models/order");
var Cart = require(ROOT_FOLDER + "/models/cart");
var _self = exports;
var randomChar = require("node-random-chars");
var ObjectId = require("mongoose").Types.ObjectId;
exports.getProduct = function(where, cb) {
    Product.findOne(where, cb);
}
exports.convertToJSON = function(array, req, res) {
    var first = array[0].join()
    var headers = first.split(',');
    var jsonData = [];
    var productData = [];
    for (var i = 1, length = array.length; i < length; i++) {
        var myRow = array[i].join();
        var row = myRow.split(',');
        var data = {};
        var p_data = {};
        for (var x = 0; x < row.length; x++) {
            data[headers[x]] = row[x];
        }
        p_data = data;
        p_data["shipping_details"] = {
            weight: data.weight,
            unit: data.unit,
            duration: data.duration
        };
        p_data["created_by"] = req.user._id;
        p_data["pricing"] = {
            price: data.price,
            after_discount: data.after_discount,
            service_tax: req.site_configuration.service_tax,
            commission: req.site_configuration.commission
        };
        p_data["meta"] = {
            title: data.meta_title,
            description: data.meta_description,
            keyword: data.meta_keyword
        };
        var request = require("request");
        var fs = require("fs");
        var name = randomChar.create(32);
        request(data.images).pipe(fs.createWriteStream(name + ".png"))
        productData.push(data);
    }
    return productData;
};
exports.isProductAvailable = function(req, res, next) {
    var body = req.body;
    var query = req.query;
    var quantity = body.quantity ? body.quantity : 1;
    return function(cb) {
        var _p_whr = {};
        _p_whr["_id"] = body.product_id;
        _p_whr["status"] = true;
        _p_whr["is_deleted"] = false;
        if (req.body.product_variant) {
            _p_whr["variants"] = {
                $elemMatch: {
                    _id: ObjectId(req.body.product_variant),
                    quantity: {
                        $gte: parseInt(quantity)
                    }
                }
            };
        } else if (req.body.product_license) {
          _p_whr["licenses"] = {
              $elemMatch: {
                  _id: ObjectId(req.body.product_license)
              }
          };
        }
        else {
          _p_whr["quantity"] = {
              $gte: parseInt(quantity)
          };
        }
        console.log("****************************************************************");
        console.log(_p_whr)
        console.log("****************************************************************");
        _self.getProduct(_p_whr, function(err, result) {
            console.log("****************************************************************");
            console.log(result)
            console.log("****************************************************************");
            if (err) return next(err);
            else if (!result) return next(new Error("Product is out of stock"));
            cb(null, result);
        });
    };
}
exports.getOrder = function(id) {
    return function(cb) {
        Order.aggregate()
            .match({
                _id: id
            })
            .unwind("products")
            .lookup({
                from: "users",
                foreignField: "_id",
                localField: "user_id",
                as: "user"
            })
            .lookup({
                from: "product_catelogs",
                foreignField: "_id",
                localField: "products.id",
                as: "products.id"
            })
            .lookup({
                from: "users",
                foreignField: "_id",
                localField: "products.shop_id",
                as: "products.shop_id"
            })
            .project({
                order_id: "$_id",
                user_name: {
                    $arrayElemAt: ["$user.name", 0]
                },
                user_id: {
                    $arrayElemAt: ["$user._id", 0]
                },
                user_mail: {
                    $arrayElemAt: ["$user.email", 0]
                },
                user_phone: {
                    $arrayElemAt: ["$user.phone", 0]
                },
                transaction_id: "$payment.transaction_id",
                billing: 1,
                shipping: 1,
                product_name: {
                    $arrayElemAt: ["$products.id.name", 0]
                },
                product_id: {
                    $arrayElemAt: ["$products.id._id", 0]
                },
                seller_id: {
                    $arrayElemAt: ["$products.shop_id._id", 0]
                },
                seller_name: {
                    $arrayElemAt: ["$products.shop_id.name", 0]
                },
                seller_mail: {
                    $arrayElemAt: ["$products.shop_id.email", 0]
                },
                seller_phone: {
                    $arrayElemAt: ["$products.shop_id.phone", 0]
                },
                product_variant: "$products.variant",
                bought_qty: "$products.quantity",
                created_at: {
                    $dateToString: {
                        format: "%d-%m-%Y",
                        date: "$created_at"
                    }
                },
                bought_price: {
                    $arrayElemAt: ["$products.id.pricing.after_discount", 0]
                },
                ship_price: {
                    $arrayElemAt: ["$products.id.shipping_details.fee", 0]
                },
                images: {
                    $arrayElemAt: ["$products.id.images", 0]
                }
            })
            .group({
                _id: "$seller_id",
                order_date: {
                    $first: "$created_at"
                },
                user: {
                    $first: {
                        _id: "$user_id",
                        name: "$user_name",
                        mail: "$user_mail",
                        phone: "$user_phone"
                    }
                },
                order_id: {
                    $first: "$_id",
                },
                billing: {
                    $first: "$billing"
                },
                shipping: {
                    $first: "$shipping"
                },
                seller: {
                    $first: {
                        _id: "$seller_id",
                        name: "$seller_name",
                        mail: "$seller_mail",
                        phone: "$seller_phone"
                    }
                },
                products: {
                    $push: {
                        _id: "$product_id",
                        name: "$product_name",
                        amount: "$bought_price",
                        qty: "$bought_qty",
                        ship_amount: "$ship_price",
                        images: "$images",
                        total_amount: {
                            $sum: [{
                                $multiply: ["$bought_price", "$bought_qty"]
                            }, "$ship_price"]
                        }
                    }
                },
                total_price: {
                    $sum: {
                        $sum: [{
                            $multiply: ["$bought_price", "$bought_qty"]
                        }, "$ship_price"]
                    }
                }
            })
            .exec(cb);
    }
}
