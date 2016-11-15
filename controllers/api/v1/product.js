var User = require(ROOT_FOLDER + "/models/users");
var Product = require(ROOT_FOLDER + "/models/product_catelog");
var Category = require(ROOT_FOLDER + "/models/category");
var Images = require(ROOT_FOLDER + "/models/image");
var _s_mail = require(ROOT_FOLDER + "/services/mail");

exports.addProduct = function(req, res, next) {
    Product.addProduct(req.user._id, req.body, function(err, result) {
        if (!err) {
            return res._response(result);
        }
        return next(err);
    });
}
exports.getProducts = function(req, res, next) {
    var where = {};
    where = req.user.Admin ? {} : {
        created_by: req.user._id
    };
    where["is_deleted"] = false;
    Product
        .find(where)
        .populate("images")
        .populate("categories", "-_id, name")
        .populate("created_by", "-_id name email phone")
        .populate("source")
        .exec(function(err, result) {
            if (!err) {
                return res._response({
                    products: result
                }, "success", 200, "Fetched Successfully");
            }
            return next(err);
        });
}
exports.getApprovedProducts = function(req, res, next) {
    var where = {};
    where = req.user.Admin ? {} : {
        created_by: req.user._id
    };
    where["is_deleted"] = false;
    where.status = 1;
    Product.find(where).exec(function(err, result) {
        if (!err) {
            return res._response({
                products: result
            }, "success", 200, "Fetched Successfully");
        }
        return next(err);
    });
}
exports.getSingleProduct = function(req, res, next) {
    var where = {};
    where = req.user.Admin ? {} : {
        created_by: req.user._id
    };
    where["is_deleted"] = false;
    where._id = req.params.id;
    Product
        .findOne(where)
        .populate("images")
        .populate("categories")
        .populate("source")
        .exec(function(err, result) {
            if (!err) {
                return res._response({
                    product: result
                }, "success", 200, "Fetched Successfully");
            }
            return next(err);
        });
}
exports.getNonApprovedProducts = function(req, res, next) {
    var where = {};
    where = req.user.Admin ? {} : {
        created_by: req.user._id
    };
    where["is_deleted"] = false;
    where.status = 0;
    Product.find(where).exec(function(err, result) {
        if (!err) {
            return res._response({
                products: result
            }, "success", 200, "Fetched Successfully");
        }
        return next(err);
    });
}
exports.updateProductStatus = function(req, res, next) {
    var where = {},
        data = {};
    where._id = req.params.id;
    data.status = req.params.status;
    Product.update(where, data).exec(function(err, result) {
        if (!err) {
            _s_mail.sendProductStatusMail(req.params.id, req.params.status, function() {});
            return res._response({
                products: result
            }, "success", 200, "Updated Successfully");
        }
        return next(err);
    });
}
exports.updateProduct = function(req, res, next) {
    Product.updateProduct(req.user._id, req.params.id, req.body, function(err, result) {
        if (!err) {
            return res._response({
                products: result
            }, "success", 200, "Updated Successfully");
        }
        return next(err);
    });
}
exports.getOutOfStockProduct = function(req, res, next) {
    Product.find({
        quantity: 0,
        is_deleted: false
    }, function(err, result) {
        if (!err) {
            return res._response({
                products: result
            }, "success", 200, "Fetched Successfully");
        }
        return next(err);
    });
}
exports.deleteProduct = function(req, res, next) {
    Product.updateProduct(req.user._id, req.params.id, req.body, function(err, result) {
        if (!err) {
            return res._response({
                products: result
            }, "success", 200, "Deleted Successfully");
        }
        return next(err);
    });
}
exports.isExistSKU = function(req, res, next) {
    Product.findOne(req.body, function(err, result) {
        flag = result !== null;
        if (!err) {
            return res._response({
                flag: flag
            }, "success", 200, "Deleted Successfully");
        }
        return next(err);
    });
}
exports.getFeatureProducts = function(req, res, next) {
    var where = {};
    where["is_deleted"] = false;
    where["status"] = true;
    Category
        .aggregate()
        .match(where)
        .limit(4)
        .sort({
            created_at: 1
        })
        .lookup({
            from: "product_catelogs",
            foreignField: "categories",
            localField: "_id",
            as: "products"
        })
        .project({
            _id: 1,
            name: 1,
            products: {
                $filter: {
                    input: "$products",
                    as: "product",
                    cond: {
                        $and: [
                          {
                            $eq: ["$$product.status", true]
                          },
                          {
                            $eq: ["$$product.is_active", true]
                          },
                          {
                            $eq: ["$$product.is_deleted", false]
                          }
                        ]
                    }
                }
            }
        })
        .exec(function(err, result) {
            if (err) return next(err);
            Images.populate(result, {
                path: "products.images"
            }, function(err, result) {
                if (err) return next(err);
                return res._response(result);
            });
        });
}
