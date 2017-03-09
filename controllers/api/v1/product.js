'use strict';

var User = require(ROOT_FOLDER + "/models/users");
var Product = require(ROOT_FOLDER + "/models/product_catelog");
var Category = require(ROOT_FOLDER + "/models/category");
var Images = require(ROOT_FOLDER + "/models/image");
var _s_mail = require(ROOT_FOLDER + "/services/mail");
var solrHelper = require(ROOT_FOLDER + '/helpers/solr');
var solr = require('solr-client');
var client = solr.createClient({
    core: 'the_symbol_solr'
});
var async = require('async');

exports.addProduct = function(req, res, next) {
    Product.addProduct(req.user._id, req.body, function(err, result) {
        if (!err) {
            solrHelper.createOrUpdateSolrDocument(result, function(err, resp) {
                if (!err) {
                    return res._response(result);
                } else {
                    Product.remove({_id: result._id}).exec(function(err, resp) {
                        if (err) {
                            return next(err);
                        }
                        return next({status: 500, message: 'Error when create product'});
                    });
                }
            });
        } else {
            return next(err);
        }
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
            Product.findOne({_id: req.params.id}).exec(function(err, product) {
                solrHelper.createOrUpdateSolrDocument(product, function(){
                    _s_mail.sendProductStatusMail(product._id, product.status, function() {
                        console.log('update status of product successfully');
                        return res._response({
                            products: result
                        }, "success", 200, "Updated Successfully");
                    });
                });
            });
        } else {
            return next(err);
        }
    });
}
exports.updateProduct = function(req, res, next) {
    Product.updateProduct(req.user._id, req.params.id, req.body, function(err, result) {
        if (!err) {
            Product.findById(req.params.id, function(err, product) {
                if (err) {
                    return next(err);
                }
                solrHelper.createOrUpdateSolrDocument(product, function(){
                    return res._response({
                        products: product
                    }, "success", 200, "Updated Successfully");
                });
            });
        } else {
            return next(err);
        }
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
            solrHelper.createOrUpdateSolrDocument(result, function(){
                return res._response({
                    products: result
                }, "success", 200, "Deleted Successfully");
            });
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

exports.searchProducts = (req, res, next) => {
    let query = client.createQuery();
    console.log(req.body);
    let limit = req.body.limit || 10;
    let page  = req.body.page || 1; 
    let start = (page -1) * limit;
    let q = {};
    if (req.body.category) {
        q.categories = req.body.category;
    }
    if (req.body.productName && req.body.productName.length > 0) {
        q.title = req.body.productName
    }
    if (req.body.shopId) {
        q.created_by = req.body.shopId;
    }
    // search by location
    if (req.body.lat && req.body.lng) {
        query.parameters.push('fq={!geofilt%20pt='+req.body.lat+','+req.body.lng+'%20sfield=coordinates%20d=50}')
    }
    query.q(q);
    query.start(start);
    query.rows(limit);
    client.search(query, (err, resp) => {
        console.log(err);
        console.log(resp);
        if (err) {
            return next(err);
        } 
        let data = {totalItem: resp.response.numFound, items: []};
        async.each(resp.response.docs, (item, callback) => {
            Product.findById(item._id)
            .populate("images")
            .populate("categories")
            .populate("source")
            .exec(function(err, product) {
                if (err) {
                    return callback(err);
                }
                if (!product) {
                    console.log('no product found');
                    return callback({status: 404, message: 'Product not found'});
                }
                data.items.push(product);
                callback(null);
            });
        }, () => {
            return res._response(data);
        });
    });
}
