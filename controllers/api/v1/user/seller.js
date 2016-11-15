var User = require(ROOT_FOLDER + "/models/users");
var Image = require(ROOT_FOLDER + "/models/image");
var Product = require(ROOT_FOLDER + "/models/product_catelog");
var Order = require(ROOT_FOLDER + "/models/order");
var Address = require(ROOT_FOLDER + "/models/address");
var Mongoose = require('mongoose');
var ObjectId = Mongoose.Types.ObjectId;
var _s_mail = require(ROOT_FOLDER + "/services/mail");
exports.getSellers = function(req, res, next) {
    var swhere = {};
    swhere["roles"] = "seller";
    swhere["is_deleted"] = false;
    swhere["status"] = true;
    var where = {};
    where["is_active"] = true;
    where["is_deleted"] = false;
    where["status"] = true;
    Product
        .aggregate()
        .match(where)
        .lookup({
            localField: "created_by",
            foreignField: "_id",
            from: "users",
            as: "created_by"
        })
        .lookup({
            localField: "_id",
            foreignField: "product",
            from: "ratings",
            as: "ratings"
        })
        .group({
            "_id": "$created_by._id",
            "name": {
                $first: {
                    $arrayElemAt: ["$created_by.name", 0]
                }
            },
            "email": {
                $first: {
                    $arrayElemAt: ["$created_by.email", 0]
                }
            },
            "logo": {
                $first: {
                    $arrayElemAt: ["$created_by.logo", 0]
                }
            },
            "banner": {
                $first: {
                    $arrayElemAt: ["$created_by.banner", 0]
                }
            },
            "address": {
                $first: {
                    $arrayElemAt: ["$created_by.address", 0]
                }
            },
            "phone": {
                $first: {
                    $arrayElemAt: ["$created_by.phone", 0]
                }
            },
            "products": {
                $push: {
                    "name": "$name",
                    "_id": "$_id",
                    "sku": "$sku",
                    "title": "$title",
                    "images": "$images",
                    "status": "$status",
                    "is_deleted": "$is_deleted",
                    "is_active": "$is_active",
                    "quantity": "$quantity",
                    "product_videos": "$product_videos",
                    "ratings": {
                        $cond: {
                            if: {
                                $ne: ["$ratings", []]
                            },
                            then: "$ratings",
                            else: null
                        }
                    }
                }
            },
            "ratings": {
                $push: {
                    $filter: {
                        input: "$ratings",
                        as: "rating",
                        cond: {
                            $ne: ["$$rating", []]
                        }
                    }
                }
            }
        })
        .project({
            "_id": 1,
            "name": 1,
            "email": 1,
            "logo": 1,
            "banner": 1,
            "address": 1,
            "phone": 1,
            "tot_p_stars": 1,
            "products": "$products",
            "ratings": {
                $filter: {
                    input: "$ratings",
                    as: "rating",
                    cond: {
                        $ne: ["$$rating", []]
                    }
                }
            }
        })
        .project({
            "_id": {
                $arrayElemAt: ["$_id", 0]
            },
            "name": 1,
            "email": 1,
            "logo": 1,
            "banner": 1,
            "address": 1,
            "phone": 1,
            "tot_p_stars": 1,
            "products": {
                $slice: [
                    //"$products",
                    {
                        $filter: {
                            input: "$products",
                            as: "product",
                            cond: {
                                $and:[
                                  {
                                    $eq: ["$$product.is_deleted", false]
                                  },
                                  {
                                    $eq: ["$$product.status", true]
                                  },
                                  {
                                    $eq: ["$$product.is_active", true]
                                  }
                                ]
                            }
                        }
                    },
                    0,
                    3
                ]
            },
            "overall_ratings": "$ratings"
        })
        .exec(function(err, result) {
            if (err) return next(err);
            Image.populate(result, [{
                path: "products.images"
            }], function(err, result) {
                if (err) return next(err);
                Address.populate(result, [{
                    path: "address"
                }], function(err, result) {
                    if (err) return next(err);
                    return res._response(result);
                });
            });
        });
}
exports.getTopProducts = function(req, res, next) {
    var where = {};
    Order
        .aggregate()
        .match({
            "payment.status": "Completed",
            "products.shop_id": ObjectId(req.params.id)
        })
        .unwind("products")
        .lookup({
            from: "product_catelogs",
            foreignField: "_id",
            localField: "products.id",
            as: "products_t"
        })
        .group({
            _id: "$products.id",
            sales_count: {
                $sum: 1
            },
            products: {
                $first: "$products_t"
            }
        })
        .project({
            products: {
                $arrayElemAt: ["$products", 0]
            },
            sales_count: 1
        })
        .match({
            "products.status": true,
            "products.is_active": true,
            "products.is_deleted": false
        })
        .lookup({
            from: "ratings",
            foreignField: "product",
            localField: "products._id",
            as: "products.ratings"
        })
        .sort({
            sales_count: -1
        })
        .project({
            products: 1,
            sales_count: 1,
            total_star: {
                $sum: "$products.ratings.stars"
            },
            total_ratings: {
                $size: "$products.ratings"
            },
            total_reviews: {
                $size: {
                    $filter: {
                        input: "$products.ratings",
                        as: "rating",
                        cond: {
                            $ne: ["$$rating.comment", ""]
                        }
                    }
                }
            }
        })
        .exec(function(err, result) {
            if (err) return next(err);
            Image.populate(result, [{
                path: "products.images"
            }], function(err, result) {
                if (err) return next(err);
                return res._response(result);
            });
        });
}
