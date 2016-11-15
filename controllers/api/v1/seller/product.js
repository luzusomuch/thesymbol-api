var User = require(ROOT_FOLDER + "/models/users");
var Address = require(ROOT_FOLDER + "/models/address");
var Product = require(ROOT_FOLDER + "/models/product_catelog");
var Image = require(ROOT_FOLDER + "/models/image");
var _h_product = require(ROOT_FOLDER + "/helpers/product");
var async = require("async");
var xls = require('excel');

exports.getApprovedProducts = function(req, res, next) {
    var where = {};
    where = req.user.Admin ? {} : {
        created_by: req.user._id
    };
    where["is_deleted"] = false;
    where["status"] = true;
    Product
        .find(where)
        .populate("images")
        .sort({
            created_at: -1
        })
        .exec(function(err, result) {
            if (!err) {
                return res._response({
                    products: result
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
    where["status"] = false;
    Product
        .find(where)
        .populate("images")
        .sort({
            created_at: -1
        })
        .exec(function(err, result) {
            if (!err) {
                return res._response({
                    products: result
                }, "success", 200, "Fetched Successfully");
            }
            return next(err);
        });
}
exports.getActiveProducts = function(req, res, next) {
    var where = {};
    where = req.user.Admin ? {} : {
        created_by: req.user._id
    };
    where["is_deleted"] = false;
    where["is_active"] = true;
    where["status"] = true;
    where["quantity"] = {
        $gt: 0
    };
    Product
        .find(where)
        .populate("images")
        .sort({
            created_at: -1
        })
        .exec(function(err, result) {
            if (!err) {
                return res._response({
                    products: result
                }, "success", 200, "Fetched Successfully");
            }
            return next(err);
        });
}
exports.getDeactiveProducts = function(req, res, next) {
    var where = {};
    where = req.user.Admin ? {} : {
        created_by: req.user._id
    };
    where["is_deleted"] = false;
    where["is_active"] = false;
    Product
        .find(where)
        .populate("images")
        .sort({
            created_at: -1
        })
        .exec(function(err, result) {
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
    data.is_active = req.params.status;
    Product.update(where, data).exec(function(err, result) {
        if (!err) {
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
exports.deleteProduct = function(req, res, next) {
    var where = {},
        data = {};
    where._id = req.params.id;
    data.is_deleted = true;
    Product.update(where, data).exec(function(err, result) {
        if (!err) {
            return res._response({
                products: result
            }, "success", 200, "Deleted Successfully");
        }
        return next(err);
    });
}
exports.getOutOfStockProducts = function(req, res, next) {
    var where = {};
    where = req.user.Admin ? {} : {
        created_by: req.user._id
    };
    where["is_deleted"] = false;
    where["is_active"] = true;
    where["quantity"] = 0;
    Product
        .find(where)
        .populate("images")
        .sort({
            created_at: -1
        })
        .exec(function(err, result) {
            if (!err) {
                return res._response({
                    products: result
                }, "success", 200, "Fetched Successfully");
            }
            return next(err);
        });
}
exports.uploadProductXL = function (req, res, next) {

  xls('sample1.xlsx', function(err, data) {
      if (err) return next(err);
      return res._response(_h_product.convertToJSON(data, req, res));
  });
}
