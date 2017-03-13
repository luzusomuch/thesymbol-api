var User = require(ROOT_FOLDER + "/models/users");
var Product = require(ROOT_FOLDER + "/models/product_catelog");
var Cart = require(ROOT_FOLDER + "/models/cart");
var Order = require(ROOT_FOLDER + "/models/order");
var Address = require(ROOT_FOLDER + "/models/address");
var mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;
var mail = require(ROOT_FOLDER + "/services/mail");;
var _h_cart = require(ROOT_FOLDER + "/helpers/cart");;
var _h_common = require(ROOT_FOLDER + "/helpers/common");;
var _h_stripe = require(ROOT_FOLDER + "/helpers/stripe");;
var _h_coupon = require(ROOT_FOLDER + "/helpers/coupon");;
var _h_payumoney = require(ROOT_FOLDER + "/helpers/payumoney");
var bcrypt = require('bcrypt');
var async = require("async");
var isOrderExists = function(id, cb) {
    console.log('checking order existed');
    Order.find({
        "payment.transaction_id": id
    }, function(err, result) {
        console.log(err);
        console.log(result);
        console.log(result.length);
        if (err) return cb(err);
        else if (result.length) return cb(new Error("Payment id already exists"));
        return cb(null, null);
    });
};
var getCart = function(where, cb) {
    Cart.find(where)
        .populate("product_id")
        .exec(function(err, result) {
            if (err) return cb(err);
            else if (!result.length) return cb(new Error("There is no product in cart to checkout"));
            return cb(err, result);
        });
};
exports.getAddress = function(req, res, next) {
    User.findOne({
            "_id": req.user._id
        })
        .populate('shipping')
        .populate('billing')
        .populate('address')
        .exec(function(err, result) {
            if (err) return next(err);
            return res._response(result);
        })

}
exports.addBillAddress = function(req, res, next) {
    var address = req.body;
    delete address._id;
    var user = {};
    User.findOne({
        "_id": req.user._id
    }, function(error, data) {
        if (data.billing == undefined) {
            new Address(address)
                .save(function(err, result) {
                    if (err) return next(err);
                    user.billing = result._id;
                    User.update({
                        "_id": req.user._id
                    }, user, {}, function(err, users) {
                        if (err) return next(err);
                        return res._response(users, "success", 200, "lite");
                    });
                });
        } else {
            Address.update({
                "_id": data.billing
            }, address, function(err, users) {
                return res._response(users, "success", 200, "strong");
            });
        }
    });
}
exports.addShipAddress = function(req, res, next) {
    var address = req.body;
    delete address._id;
    var user = {};
    User.findOne({
        "_id": req.user._id
    }, function(error, data) {
        if (data.shipping == undefined) {
            new Address(address)
                .save(function(err, result) {
                    if (err) return next(err);
                    user.shipping = result._id;
                    User.update({
                        "_id": req.user._id
                    }, user, {}, function(err, users) {
                        if (err) return next(err);
                        return res._response(users, "success", 200, "lite");
                    });
                });
        } else {
            Address.update({
                "_id": data.shipping
            }, address, function(err, users) {
                return res._response(users, "success", 200, "strong");
            });
        }
    });
}
exports.buyNowCompleted = function(req, res, next) {
    var cart_products = [],
        payment = {},
        payable = 0,
        coupon = {},
        order = {},
        order_id, error = [];
        order.total_price = 0;
        order.total_shipping = 0;
        order.total_tax = 0;
        order.coupon = {};
        order.user_id = req.user._id;
        order.payment = {
            method: req.body.payment_method,
            status: req.body.payment_status,
            transaction_id: req.body.payment_id
        };
        order.products = [];
    async.series([
            function(cb) { //get cart products
                _h_cart.getSingleCartDetail(req, {
                    "_id": ObjectId(req.body.product_id),
                    "is_active": true,
                    "status": true,
                    "is_deleted": false
                }, function(err, result) {
                    if (!result.cart.length) return next(new Error("No product in cart to checkout."))
                    cart_products = result.cart;
                    cb(err, result);
                });
            },
            function(cb) { //create order
                cart_products.forEach(function(product, item) {
console.log(product);
                    order.products[item] = {};
                    order.products[item]["id"] = product.product_id._id;
                    order.products[item]["shop_id"] = product.product_id.created_by;
                    order.products[item]["variant"] = product.selected_pricing.name ?
                    product.selected_pricing.name : null;
                    order.products[item]["license"] = product.selected_pricing.license ?
                    product.selected_pricing.license : null;
                    order.products[item]["quantity"] = product.product_quantity;
                    order.products[item]["price"] = product.selected_pricing.after_discount;
                    order.products[item]["pricing"] = product.selected_pricing;
                    order.products[item]["shipping_details"] = product.product_id.shipping_details;
console.log('product detail ' + order.products[item]['title']);
console.log(product.selected_pricing);
                    if (product.product_id.type == "digital") {
                        order.total_price += (product.product_quantity * product.selected_pricing.after_discount)
                        order.products[item]["download_token"] = _h_common.getHash(new Date().getTime() +
                            product.product_id._id +
                            product._id
                        );
                        order.total_shipping += 0;
                    }
                    if (product.product_id.paid_by_buyer == true && product.product_id.type == "normal") {
                        var shipping = product.product_id.shipping_details.fee;
                        order.total_price += (product.product_quantity * product.selected_pricing.after_discount);
                        order.total_shipping += shipping;
                    } else {
			order.total_price += (product.product_quantity * product.selected_pricing.after_discount);
                        order.total_shipping += 0;
		    }
                    order.total_tax += product.selected_pricing.service_tax;
                    console.log(order.total_price);
                });
                cb(null, null)
            },
            function(cb) { //apply coupon
                if (!req.body.coupon) {
console.log('not using coupon');
console.log(order);
                    payable = order.total_price + order.total_shipping;
                    return cb(null, null);
                }
                _h_coupon.isValidCoupon(req.body.coupon, req.user._id, function(err, coupon) {
                    if (!err) {
                        var discount = 0;
                        if (coupon == null)
                            discount = 0
                        else if (coupon.type == 0)
                            discount = Math.round(coupon.amount);
                        else
                            discount = Math.round((coupon.amount / 100) * order.total_price);

                        payable = order.total_price + order.total_shipping - discount;
                        order.coupon = {
                            _id: coupon._id,
                            code: coupon.code,
                            discount: discount
                        };
                    } else {
                        order.coupon = {
                            _id: null,
                            code: null,
                            discount: null
                        };
                        payable = order.total_price + order.total_shipping;
                    }
                    return cb(null, null);
                });
            },
            function(cb) {
                if (req.body.payment_method == "stripe") {
                    console.log('payable');
                    console.log(payable);
                    var stripeObject = {
                        amount: payable,
                        source: req.body.payment_id //using payment id as token
                    };
                    _h_stripe.payForOrder(stripeObject, function(err, payment) {
                        if (err) return cb(err, payment);
                        payment = payment;
                        order.payment.transaction_id = payment.id;
                        order.payment.status = payment.status == "succeeded" ? "completed" : "in completed";
                        return cb(err, payment);
                    });
                } else if (req.body.payment_method == "payumoney") {
                    _h_stripe.payForOrder(req.user._id, function(err, payment) {
                        if (err) return cb(err, payment);
                        payment = payment;
                        order.payment.transaction_id = payment.id;
                        return cb(err, payment);
                    });
                } else
                    return cb(null, null);
            },
            function(cb) { //check payment id already exists
                if (req.body.payment_id) {
                    isOrderExists(req.body.payment_id, cb);
                } else {
                    return cb(null, null);
                }
            },
            function(cb) { // get shipping address
                Address.findOne({
                    _id: req.body.shipping
                }, function(err, result) {
                    if (result == null) error.push("Shipping address not found.");
                    order.shipping = result;
                    return cb(err, result);
                })
            },
            function(cb) { // get billing address
                if (!req.body.billing) { //make it optional
                    order.billing = order.shipping;
                    return cb(null, null);
                }
                Address.findOne({
                    _id: req.body.billing
                }, function(err, result) {
                    if (result == null) error.push("Billing address not found.");
                    order.billing = result;
                    return cb(err, result);
                })
            },
            function(cb) { //save order
                new Order(order).save(function(err, result) {
                    order_id = result._id;
                    cb(err, result);
                })
            },
            function(cb) { //remove cart
                Cart.remove({
                    "user_id": req.user._id
                }, cb);
            },
            function(cb) { // decrement Quantity
                async.each(order.products, function(item, callback) {
                    var update = {};
                    var where = {};
                    where["_id"] = ObjectId(item.id);
                    update["$inc"] = {
                        "quantity": -item.quantity
                    };
                    if (item.variant != "" && item.variant != undefined) {
                        where["variants"] = {};
                        where["variants"] = {
                            $elemMatch: {
                                name: item.variant
                            }
                        };
                        update["$inc"]["variants.$.quantity"] = -item.quantity;
                    } else {}
                    if (item.license == "" || item.license == undefined)
                        Product.update(where, update, callback);
                    else
                        callback(null, null);
                }, cb);
            },
            function(cb) { // decrement coupon uses
                _h_coupon.decrementQty(req.body.coupon, cb);
            }
        ],
        function(err, result) { //send mail and response to the user
            if (err) return next(err);
            mail.sendOrderPlacedNotification(order_id);
            return res._response({
                order_id: order_id,
                payment: payment
            }, "success", 200, "Your order successfully placed");
        });
}
exports.buyFromCartCompleted = function(req, res, next) {
    var cart_products = [],
        payment = {},
        payable = 0,
        coupon = {},
        order = {},
        order_id, error = [];
    order.total_price = 0;
    order.total_shipping = 0;
    order.total_tax = 0;
    order.coupon = {};
    order.user_id = req.user._id;
    order.payment = {
        method: req.body.payment_method,
        status: req.body.payment_status,
        transaction_id: req.body.payment_id
    };
    order.products = [];
    async.series([
            function(cb) { //get cart products
                _h_cart.getCartDetail({
                    $or: [{user_id: req.user._id}, {guest_token: req.body.guest_token}]
                    // user_id: req.user._id
                }, function(err, result) {
                    if (!result.cart.length) return next(new Error("No product in cart to checkout."))
                    cart_products = result.cart;
                    cb(err, result);
                });
            },
            function(cb) { //create order
                console.log(cart_products);
                cart_products.forEach(function(product, item) {
                    order.products[item] = {};
                    order.products[item]["id"] = product.product_id._id;
                    order.products[item]["shop_id"] = product.product_id.created_by;
                    order.products[item]["variant"] = product.selected_pricing.name ?
                        product.selected_pricing.name : null;
                    order.products[item]["license"] = product.selected_pricing.license ?
                        product.selected_pricing.license : null;
                    order.products[item]["quantity"] = product.product_quantity;
                    order.products[item]["price"] = product.selected_pricing.after_discount;
                    order.products[item]["pricing"] = product.selected_pricing;
                    order.products[item]["shipping_details"] = product.product_id.shipping_details;
                    if (product.product_id.type == "digital") {
                        order.total_price += (product.product_quantity * product.selected_pricing.after_discount)
                        order.products[item]["download_token"] = _h_common.getHash(new Date().getTime() +
                            product.product_id._id +
                            product._id
                        );
                        order.total_shipping += 0;
                    }
                    if (product.product_id.paid_by_buyer == true && product.product_id.type == "normal") {
                        var shipping = product.product_id.shipping_details.fee;
                        order.total_price += (product.product_quantity * product.selected_pricing.after_discount);
                        order.total_shipping += shipping;
                    } else {
                        order.total_price += (product.product_quantity * product.selected_pricing.after_discount);
                        order.total_shipping += 0;
                    }

                    if (product.selected_pricing && product.selected_pricing.service_tax) {
                        order.total_tax += product.selected_pricing.service_tax;
                    }
                });
                cb(null, null)
            },
            function(cb) { //apply coupon
                console.log(order.total_price + order.total_shipping);
                if (!req.body.coupon) {
                    payable = order.total_price + order.total_shipping;
                    return cb(null, null);
                }
                _h_coupon.isValidCoupon(req.body.coupon, req.user._id, function(err, coupon) {
                    if (!err) {
                        var discount = 0;
                        if (coupon == null)
                            discount = 0
                        else if (coupon.type == 0)
                            discount = Math.round(coupon.amount);
                        else
                            discount = Math.round((coupon.amount / 100) * order.total_price);
                        payable = order.total_price + order.total_shipping - discount;
                        order.coupon = {
                            _id: coupon._id,
                            code: coupon.code,
                            discount: discount
                        };
                    } else {
                        order.coupon = {
                            _id: null,
                            code: null,
                            discount: null
                        };
                        payable = order.total_price + order.total_shipping;
                    }
                    console.log(payable);
                    return cb(null, null);
                });
            },
            function(cb) {
                console.log(order.total_price + order.total_shipping);
                console.log(payable);
                if (req.body.payment_method == "stripe") {
                    var stripeObject = {
                        amount: payable,
                        source: req.body.payment_id //using payment id as token
                    };
                    _h_stripe.payForOrder(stripeObject, function(err, payment) {
                        if (err) return cb(err, payment);
                        payment = payment;
                        order.payment.transaction_id = payment.id;
                        order.payment.status = payment.status == "succeeded" ? "completed" : "in completed";
                        return cb(err, payment);
                    });
                } else if (req.body.payment_method == "payumoney") {
                    _h_stripe.payForOrder(req.user._id, function(err, payment) {
                        if (err) return cb(err, payment);
                        payment = payment;
                        order.payment.transaction_id = payment.id;
                        return cb(err, payment);
                    });
                } else
                    return cb(null, null);
            },
            function(cb) { //check payment id already exists
                if (req.body.payment_id) {
                    isOrderExists(req.body.payment_id, cb);
                } else {
                    return cb(null, null);
                }
            },
            function(cb) { // get shipping address
                Address.findOne({
                    _id: req.body.shipping
                }, function(err, result) {
                    if (result == null) error.push("Shipping address not found.");
                    order.shipping = result;
                    return cb(err, result);
                })
            },
            function(cb) { // get billing address
                if (!req.body.billing) { //make it optional
                    order.billing = order.shipping;
                    return cb(null, null);
                }
                Address.findOne({
                    _id: req.body.billing
                }, function(err, result) {
                    if (result == null) error.push("Billing address not found.");
                    order.billing = result;
                    return cb(err, result);
                })
            },
            function(cb) { //save order
                console.log(order);
                console.log('start save order');
                new Order(order).save(function(err, result) {
                    console.log(err);
                    console.log(result);
                    order_id = result._id;
                    cb(err, result);
                })
            },
            function(cb) { //remove cart
                Cart.remove({
                    $or: [{user_id: req.user._id}, {guest_token: req.body.guest_token}]
                }, cb);
            },
            function(cb) { // decrement Quantity
                async.each(order.products, function(item, callback) {
                    var update = {};
                    var where = {};
                    where["_id"] = ObjectId(item.id);
                    update["$inc"] = {
                        "quantity": -item.quantity
                    };
                    if (item.variant != "" && item.variant != undefined) {
                        where["variants"] = {};
                        where["variants"] = {
                            $elemMatch: {
                                name: item.variant
                            }
                        };
                        update["$inc"]["variants.$.quantity"] = -item.quantity;
                    } else {}
                    if (item.license == "" || item.license == undefined)
                        Product.update(where, update, callback);
                    else
                        callback(null, null);
                }, cb);
            },
            function(cb) { // decrement coupon uses
                _h_coupon.decrementQty(req.body.coupon, cb);
            }
        ],
        function(err, result) { //send mail and response to the user
            if (err) return next(err);
            mail.sendOrderPlacedNotification(order_id);
            return res._response({
                order_id: order_id,
                payment: payment
            }, "success", 200, "Your order successfully placed");
        });
}
