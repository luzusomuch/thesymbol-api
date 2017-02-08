var User = require(ROOT_FOLDER + "/models/users");
var Address = require(ROOT_FOLDER + "/models/address");
var Cart = require(ROOT_FOLDER + "/models/cart");
var Images = require(ROOT_FOLDER + "/models/image");
var mail = require(ROOT_FOLDER + "/services/mail");
var _h_social = require(ROOT_FOLDER + "/helpers/social");
var _h_common = require(ROOT_FOLDER + "/helpers/common");
var randomChar = require("node-random-chars");
var hbs = require("express-hbs");
var cloudinary = require("cloudinary");
cloudinary.config(require(ROOT_FOLDER + "/config/cloudinary"));
var async = require("async");
var mongoose = require("mongoose");
exports.test = function(req, res, next) {
    Images.find({
        "cdn.original_filename": {
            $eq: null
        }
    }, function(err, result) {
        if (err) return next(err);
        async.each(result, function(item, callback) {
            cloudinary.uploader.upload(item.path, function(result) {
                item.cdn = result;
                var id = item._id;
                delete item._id;
                Images.update({
                    _id: id
                }, item, {
                    upsert: true
                }, function() {
                    callback();
                });
            });
        }, function(err) {
            res._response({
                status: "success"
            });
        });
    });
}
exports.getAddress = function(req, res, next) {
    User.findOne({
            "_id": req.user._id
        })
        .select("-_id shipping billing")
        .populate('shipping')
        .populate('billing')
        .exec(function(err, result) {
            if (err) return next(err);
            return res._response({
                shipping: result.shipping,
                shippings: [result.shipping],
                billing: result.billing
            });
        });
}
exports.resgisterUser = function(req, res, next) {
    var user = {};
    var address1 = req.body.address;
    delete req.body.address;
    user = req.body;
    user.address = [];
    user.roles = ["user"];
    user.password = _h_common.getHash(user.password);
    address = {};
    address["pincode"] = req.body.pincode;
    address["name"] = req.body.name;
    address["address"] = address1;
    address["phone"] = req.body.phone;
    address["city"] = req.body.city;
    address["state"] = req.body.state;
    address["country"] = req.body.country;
    address["locality"] = req.body.locality;
    delete user.pincode;
    delete user.city;
    delete user.state;
    delete user.country;
    delete user.locality;
    User
        .find({
            email: req.body.email
        })
        .exec(function(err, result) {
            if (err) return next(err);
            if (result.length)
                return res._response(result, "fail", 500, "Email already exists");
            new Address(address)
                .save(function(err, result) {
                    if (err) return next(err);
                    user.address = [result._id];
                    user.social_logins = {fb_id: mongoose.Types.ObjectId(), google_id: mongoose.Types.ObjectId()};
                    new User(user)
                        .save(function(err, result) {
                            console.log('create user success');
                            console.log(err);
                            console.log(result);
                            if (err) return next(err);
                            mail.sendRegistrationNotification(result);
                            return res._response(result, "success", 200, "Please Confirm your registration from your mail ID");
                        })
                });

        })
}
exports.loginAsUser = function(req, res, next) {
    User.loginAsUser(req.body.email, req.body.password, function(err, user) {
        if (err || user === null) return next(err || new Error("Invalid Credentials"));
        user.updateToken(function(err, token) {
            if (err) return next(err);
            user.token = token;
            var where = {};
            var users = {};
            where.guest_token = req.query.guest_token;
            users.user_id = user._id;
            Cart.update(where, users, {
                    multi: true
                })
                .exec(function(err, result) {
                    if (err) return next(err);
                })
            res._response({
                user: user
            });
        });
    });
}
exports.confirmUserStatus = function(req, res, next) {
    User.findOne({
        _id: req.params.id
    }, function(err, user) {
        if (err) return next(err);
        if (!user)
            return res._response('', "error", 301, "Your comfirmation mail id incorrect");
        else {
            if (user.verified == true)
                return res._response(user, "error", 500, "YOU ARE ALL READY IN ROLL!! ");
            else {
                User.update({
                    _id: req.params.id
                }, {
                    "verified": true
                }, {}, function(err, resu) {
                    mail.sendVerificationSuccessMail(req.params.id);
                    return res._response(user, "success", 200, "WE ARE READY TO ROLL!!");
                });
            }
        }
    });
}
exports.forgotPassword = function(req, res, next) {
    User.findOne({
        email: req.body.email
    }, function(err, user) {
        if (err) return next(err);
        if (!user)
            return res._response('', "error", 301, "Your mail id incorrect");
        else {
            mail.sendForgotPasswordLink(user);
            return res._response(user, "success", 200, "New password create link send your mail ID. Please check Your mail id");
        }
    });
}
exports.newPassword = function(req, res, next) {
    User.findOne({
        _id: req.params.id
    }, function(err, user) {
        if (err) return next(err);
        if (!user)
            return res._response('', "error", 301, "Your mail id incorrect");
        else {
            User.update({
                _id: user._id
            }, {
                "password": _h_common.getHash(password)
            }, {}, function(err, resu) {
                mail.sendResetPasswordMail(user._id);
                return res._response(user, "success", 200, "YOUR PASSWORD SUCCESSFULLY CHANGED!!");
            });
        }
    });
}
exports.generateToken = function(req, res, next) {
    res._response({
        token: randomChar.create(32)
    });
}
exports.loginUsingSocial = function(req, res, next) {
    _h_social.loginUsingSocial(req, function(err, user) {
        if (err) return next(err);
        Cart.update({
                guest_token: req.query.guest_token
            }, {
                user_id: user._id
            }, {
                multi: true
            })
            .exec(function(err, result) {
                if (err) return next(err);
            })
        return res._response(user);
    });
}
