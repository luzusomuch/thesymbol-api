var Cart = require(ROOT_FOLDER + "/models/cart");
var Product = require(ROOT_FOLDER + "/models/product_catelog");
var License = require(ROOT_FOLDER + "/models/license");
var User = require(ROOT_FOLDER + "/models/users");
var Image = require(ROOT_FOLDER + "/models/image");
var mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;
var _self = exports;
exports.getCartProduct = function(where, cb) {
    Cart.findOne(where, cb);
}
exports.getSingleCartDetail = function(req, where, cb) {
    Product
        .aggregate()
        .match(where)
        .lookup({
            from: "users",
            foreignField: "_id",
            localField: "created_by",
            as: "seller"
        })
        .project({
            "_id": "$_id",
            "product_id": {
                "name": "$name",
                "_id": "$_id",
                "title": "$title",
                "sku": "$sku",
                "description": "$description",
                "sku": "$sku",
                "quantity": "$quantity",
                "pricing": "$pricing",
                "variants": "$variants",
                "shipping_details": "$shipping_details",
                "licenses": "$licenses",
                "type": "$type",
                "paid_by_buyer": "$paid_by_buyer",
                "created_by": {
                    "_id": {
                        $arrayElemAt: ["$seller._id", 0]
                    },
                    "name": {
                        $arrayElemAt: ["$seller.name", 0]
                    },
                    "email": {
                        $arrayElemAt: ["$seller.email", 0]
                    },
                    "phone": {
                        $arrayElemAt: ["$seller.phone", 0]
                    },
                }
            },
            "product_license": "$product_license",
            "product_variant": "$product_variant",
            "product_type": "$type",
            "product_quantity": {
                $cond: {
                    if: Number(req.body.quantity),
                    then: Number(req.body.quantity),
                    else: 1
                }
            },
            "product_license": {
                $cond: {
                    if: req.body.license,
                    then: req.body.license,
                    else: null
                }
            },
            "product_variant": {
                $cond: {
                    if: req.body.variant,
                    then: req.body.variant,
                    else: null
                }
            },
            "selected_pricing": {
                $cond: {
                    if: {
                        $eq: ["$type", "normal"]
                    },
                    then: {
                        $cond: {
                            if: req.body.variant,
                            then: {
                                $arrayElemAt: [{
                                        $filter: {
                                            input: "$variants",
                                            as: "variant",
                                            cond: {
                                                $eq: ["$$variant._id", ObjectId(req.body.variant)]
                                            }
                                        }
                                    },
                                    0
                                ]
                            },
                            else: "$pricing"
                        }
                    },
                    else: {
                        $cond: {
                            if: req.body.license,
                            then: {
                                $arrayElemAt: [{
                                        $filter: {
                                            input: "$licenses",
                                            as: "license",
                                            cond: {
                                                $eq: ["$$license._id", ObjectId(req.body.license)]
                                            }
                                        }
                                    },
                                    0
                                ]
                            },
                            else: "$pricing"
                        }
                    }
                }
            }
        })
        .group({
            "_id": null,
            "cart": {
                "$push": {
                    "_id": "$_id",
                    "product_id": "$product_id",
                    "product_license": "$product_license",
                    "product_variant": "$product_variant",
                    "product_type": "$product_type",
                    "product_quantity": "$product_quantity",
                    "selected_pricing": "$selected_pricing",
                    "seller": "$seller",
                }
            },
            "total_original_price": {
                "$sum": {
                    "$multiply": ["$product_quantity", "$selected_pricing.original"]
                }
            },
            "total_after_discount": {
                "$sum": {
                    "$multiply": ["$product_quantity", "$selected_pricing.after_discount"]
                }
            },
            "total_discount": {
                "$sum": {
                    "$multiply": ["$product_quantity", {
                        "$subtract": ["$selected_pricing.original", "$selected_pricing.after_discount"]
                    }]
                }
            },
            "total_shipping": {
                "$sum": "$product_id.shipping_details.fee"
            },
            "promo_discount": {
                $sum: 0
            },
            "cart_count": {
                $sum: 1
            }
        })
        .exec(function(err, result) {
            if (err) return cb(err);
            License.populate(result, {
                path: "cart.selected_pricing.license"
            }, function(err, result) {
                if (err) return cb(err);
                Image.populate(result, {
                    path: "cart.product_id.images"
                }, function(err, result) {
                    if (err) return cb(err);
                    if (!result.length) {
                        return cb(null, {
                            cart: [],
                            total_original_price: 0,
                            total_after_discount: 0,
                            total_discount: 0,
                            total_shipping: 0,
                            promo_discount: 0,
                            cart_count: 0
                        });
                    }
                    return cb(null, result[0]);
                });
            });
        });
}
exports.getCartDetail = function(where, cb) {
    Cart.aggregate()
        .match(where)
        .lookup({
            from: "product_catelogs",
            foreignField: "_id",
            localField: "product_id",
            as: "product_id"
        })
        .project({
            "product_id": {
                $arrayElemAt: ["$product_id", 0]
            },
            product_license: 1,
            product_variant: 1,
            product_quantity: 1
        })
        .lookup({
            from: "users",
            foreignField: "_id",
            localField: "product_id.created_by",
            as: "seller"
        })
        .project({
            "product_id.images": 1,
            "seller": 1,
            "product_id._id": 1,
            "product_id.title": 1,
            "product_id.name": 1,
            "product_id.description": 1,
            "product_id.sku": 1,
            "product_id.quantity": 1,
            "product_id.pricing": 1,
            "product_id.variants": 1,
            "product_id.shipping_details": 1,
            "product_id.licenses": 1,
            "product_id.type": 1,
            "product_id.paid_by_buyer": 1,
            "product_id.created_by": {
                "_id": {
                    $arrayElemAt: ["$seller._id", 0]
                },
                "name": {
                    $arrayElemAt: ["$seller.name", 0]
                },
                "email": {
                    $arrayElemAt: ["$seller.email", 0]
                },
                "phone": {
                    $arrayElemAt: ["$seller.phone", 0]
                },
            },
            "product_id.created_at": 1,
            "product_license": 1,
            "product_variant": 1,
            "product_quantity": 1,
            "selected_pricing": {
                $cond: {
                    if: {
                        $eq: ["$product_id.type", "digital"]
                    },
                    then: {
                        $cond: {
                            if: {
                                $eq: ["$product_license", null]
                            },
                            then: "$product_id.pricing",
                            else: {
                                $filter: {
                                    input: "$product_id.licenses",
                                    as: "license",
                                    cond: {
                                        $eq: ["$$license._id", "$product_license"]
                                    }
                                }
                            }
                        }
                    },
                    else: {
                        $cond: {
                            if: {
                                $eq: ["$product_variant", null]
                            },
                            then: "$product_id.pricing",
                            else: {
                                $filter: {
                                    input: "$product_id.variants",
                                    as: "variant",
                                    cond: {
                                        $eq: ["$$variant._id", "$product_variant"]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        .project({
            "_id": 1,
            "product_id": 1,
            "product_license": 1,
            "product_variant": 1,
            "product_type": "$product_id.type",
            "product_quantity": 1,
            "selected_pricing": {
                $cond: {
                    if: {
                        $isArray: "$selected_pricing"
                    },
                    then: {
                        $arrayElemAt: ["$selected_pricing", 0]
                    },
                    else: "$selected_pricing"
                }
            }
        })
        .group({

            "_id": null,
            "cart": {
                "$push": {
                    "_id": "$_id",
                    "product_id": "$product_id",
                    "product_license": "$product_license",
                    "product_variant": "$product_variant",
                    "product_type": "$product_type",
                    "product_quantity": "$product_quantity",
                    "selected_pricing": "$selected_pricing",
                    "seller": "$seller",
                }
            },
            "total_original_price": {
                "$sum": {
                    "$multiply": ["$product_quantity", "$selected_pricing.original"]
                }
            },
            "total_after_discount": {
                "$sum": {
                    "$multiply": ["$product_quantity", "$selected_pricing.after_discount"]
                }
            },
            "total_discount": {
                "$sum": {
                    "$multiply": ["$product_quantity", {
                        "$subtract": ["$selected_pricing.original", "$selected_pricing.after_discount"]
                    }]
                }
            },
            "total_shipping": {
                "$sum": "$product_id.shipping_details.fee"
            },
            "promo_discount": {
                $sum: 0
            },
            "cart_count": {
                $sum: 1
            }
        })
        .exec(function(err, result) {
            if (err) return cb(err);
            License.populate(result, {
                path: "cart.selected_pricing.license"
            }, function(err, result) {
                if (err) return cb(err);
                Image.populate(result, {
                    path: "cart.product_id.images"
                }, function(err, result) {
                    if (err) return cb(err);
                    if (!result.length) {
                        return cb(null, {
                            cart: [],
                            total_original_price: 0,
                            total_after_discount: 0,
                            total_discount: 0,
                            total_shipping: 0,
                            promo_discount: 0,
                            cart_count: 0
                        });
                    }
                    return cb(null, result[0]);
                });
            });
        });
}
exports.isProductAlreadyInCart = function(req, res, next) {
    var body = req.body;
    var query = req.query;
    return function(cb) {
        var _c_whr = {};
        if (req.user) {
            _c_whr["user_id"] = req.user._id;
        } else {
            _c_whr["guest_token"] = query.guest_token;
        }
        _c_whr["product_id"] = body.product_id;
        if (req.body.product_variant) {
            _c_whr["product_variant"] = req.body.product_variant;
        }
        if (req.body.product_license) {
            _c_whr["product_license"] = req.body.product_license;
        }
        _self.getCartProduct(_c_whr, function(err, result) {
            if (err) return next(err);
            else if (result) return next(new Error("Product is already added in Cart"));
            cb(null, result);
        });
    };
}
