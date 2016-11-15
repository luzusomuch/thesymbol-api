var User = require(ROOT_FOLDER + "/models/users");
var Product = require(ROOT_FOLDER + "/models/product_catelog");
var Cart = require(ROOT_FOLDER + "/models/cart");
var Order = require(ROOT_FOLDER + "/models/order");
var Address = require(ROOT_FOLDER + "/models/address");
var ObjectId = require("mongoose").Types.ObjectId;
exports.getOrder = function(req, res, next) {
    var limit = req.query.limit ? parseInt(req.query.limit) : 10;
    var skip = req.query.start ? parseInt(req.query.start) : 0;
    var where = {};
    if (req.user) where.user_id = req.user._id;
    else {
        var err = new Error("User Token Missing");
        next(err);
    }
    Order.find(where)
        .sort({
            created_at: -1
        })
        .populate([{
            path: 'products.id',
            select: 'title name description sku images type ratings',
            populate: [{
                path: "images"
            }, {
                path: "ratings",
                match: {
                  user: req.user._id
                }
            }]
        }, {
            path: 'products.license',
        }, {
            path: 'products.shop_id',
            select: 'name email phone',
        }])
        .skip(skip)
        .limit(limit)
        .exec(function(err, result) {
            if (err) return next(err);
            return res._response(result);
        })
}
exports.getOrderedDigitalProducts = function(req, res, next) {
    var limit = req.query.limit ? parseInt(req.query.limit) : 10;
    var skip = req.query.start ? parseInt(req.query.start) : 0;
    var where = {};
    if (req.user) where.user_id = req.user._id;
    else {
        var err = new Error("User Token Missing");
        next(err);
    }
    Order.find(where)
        .sort({
            created_at: -1
        })
        .populate([{
            path: 'products.id',
            match: {
                type: "digital"
            },
            select: 'title name description sku images',
            populate: {
                path: "images"
            }
        }, {
            path: 'products.license',
        }])
        .skip(skip)
        .limit(limit)
        .exec(function(err, result) {
            if (err) return next(err);
            return res._response(result);
        })
}
exports.downloadDigitalProduct = function(req, res, next) {
    var where = {};
    where["products.download_token"] = req.query.dt;
    where["products.id"] = ObjectId(req.params.id);
    Order
        .findOne(where)
        .exec(function(err, result) {
            if (err) return res.render("error", err);
            if (!result) return res.render("error", new Error("You are not authorized."));
            Product
                .findOne({
                    _id: ObjectId(req.params.id),
                    type: "digital"
                })
                .populate("source")
                .exec(function(err, result) {
                    if (err) return res.render("error", err);
                    if (!result) return res.render("error", new Error("You are not authorized."));
                    var fs = require('fs');
                    if (fs.existsSync(result.source.path)) {
                        var path = require('path');
                        var fs = require('fs');
                        var mime = require('mime');
                        var filename = path.basename(result.source.path);
                        var mimetype = mime.lookup(result.source.path);
                        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
                        res.setHeader('Content-type', mimetype);
                        var filestream = fs.createReadStream(result.source.path);
                        filestream.pipe(res);
                    } else {
                        res.type("html");
                        res.write("File is not found");
                        res.end();
                    }
                });
        });
}
exports.downloadDigitalProducts = function(req, res, next) {
    var where = {};
    where["user_id"] = req.user._id;
    where["products.id"] = ObjectId(req.params.id);
    Order
        .findOne(where)
        .exec(function(err, result) {
            if (err) return res.render("error", err);
            if (!result) return res.render("error", new Error("You are not authorized."));
            Product
                .findOne({
                    _id: ObjectId(req.params.id),
                    type: "digital"
                })
                .populate("source")
                .exec(function(err, result) {
                    if (err) return res.render("error", err);
                    if (!result) return res.render("error", new Error("You are not authorized."));
                    result.source = {};
                    result.source.path = ROOT_FOLDER + "/public/uploads/sources/9a1bb0ed1f6dc61763624c0ba2fd1e9b";
                    var fs = require('fs');
                    if (fs.existsSync(result.source.path)) {
                        var path = require('path');
                        var fs = require('fs');
                        var mime = require('mime');
                        var filename = path.basename(result.source.path);
                        var mimetype = mime.lookup(result.source.path);
                        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
                        res.setHeader('Content-type', mimetype);
                        var filestream = fs.createReadStream(result.source.path);
                        filestream.pipe(res);
                    } else {
                        res.type("html");
                        res.write("File is not found");
                        res.end();
                    }
                });
        });
}
