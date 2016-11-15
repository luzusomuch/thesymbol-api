var User = require(ROOT_FOLDER + "/models/users");
var Product = require(ROOT_FOLDER + "/models/product_catelog");
var Cart = require(ROOT_FOLDER + "/models/cart");
var Order = require(ROOT_FOLDER + "/models/order");
var Address = require(ROOT_FOLDER + "/models/address");
var mail = require(ROOT_FOLDER + "/services/mail");
var async = require("async");
var mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;

exports.notifiOrder = function(req, res, next) {
    var msg = "You are connect to the my websitev<br><br> Please click confirm your email id  <br><br> <a href='http://45.55.165.182:9007/#/confirmation/" + result._id + "'>Click here</a> <br><br> Thankyou<br><br>Regards,<br><br> Tech Team";
    mail.sendMail("test@gmail.com", "munishwaran@provenlogic.net", "Resgister Confimation ", msg, "test", "munish", "");
}
exports.saveOrder = function(req, res, next) {
    var where = {};
    if (req.user) where.user_id = req.user._id;
    else {
        var err = new Error("User Token Missing");
        next(err);
    }
    Order.findOne({
            "payment.transaction_id": req.query.payid
        })
        .exec(function(err, order) {
            if (order == null) {
                User.findOne({
                        "_id": req.user._id
                    })
                    .populate("shipping")
                    .populate("billing")
                    .exec(function(err, user) {
                        Cart.find(where)
                            .populate("product_id")
                            .exec(function(err, result) {
                                if (result == '') return res._response("", "success", 200, "Your order id not exit;");
                                if (err) return next(err);
                                var cart = {};
                                cart.shipping = {};
                                cart.billing = {};
                                cart.payment = {};
                                cart.shipping = user.shipping;
                                cart.billing = user.billing;
                                cart.payment.mode = "paypal";
                                cart.payment.status = req.query.status;
                                cart.payment.transaction_id = req.query.payid;
                                cart.user_id = req.user._id;
                                cart.products = [];
                                cart.total_price = 0;
                                cart.total_shipping = 0;
                                cart.total_tax = 0;
                                result.forEach(function(product, item) {
                                    cart.products[item] = {};
                                    cart.products[item]["id"] = product.product_id._id;
                                    cart.products[item]["shop_id"] = product.product_id.created_by;
                                    cart.products[item]["variant"] = product.product_id.product_variant;
                                    cart.products[item]["quantity"] = product.product_quantity;
                                    cart.products[item]["price"] = product.product_id.pricing.after_discount + product.product_id.shipping_details.fee;
                                    cart.total_price += product.product_quantity * product.product_id.pricing.after_discount;
                                    cart.total_shipping += product.product_id.shipping_details.fee;
                                    cart.total_tax += product.product_id.pricing.service_tax;
                                });
                                new Order(cart)
                                    .save(function(err, results) {
                                        Cart.remove({
                                            "user_id": req.user._id
                                        }, function(err, result) {
                                            if (err) return next(err);
                                            async.each(cart.products, function(item, callback) {
                                                var update = {};
                                                var where = {};
                                                where["_id"] = ObjectId(item.id);
                                                update["$inc"] = {
                                                    quantity: -item.quantity
                                                };
                                                if (item.variant != "" && item.variant != undefined) {
                                                    where["variants"] = {};
                                                    where["variants"]["name"] = item.variant;
                                                    update["$inc"]["variants.$.quantity"] = -item.quantity;
                                                }
                                                Product.update(where, update, callback);
                                            }, function(err) {
                                                if (err) return next(err);
                                                mail.sendOrderPlacedNotification(req.user._id, cart.products);
                                                return res._response(results, "success", 200, "Your order successfully placed");
                                            });
                                        });
                                    });
                            });
                    });
            } else {
                return res._response("", "success", 200, "Your order already placed");
            }
        });
}
