var User = require(ROOT_FOLDER + "/models/users");
var Address = require(ROOT_FOLDER + "/models/address");
var async = require("async");
var _s_mail = require(ROOT_FOLDER + "/services/mail");
var _c_help = require(ROOT_FOLDER + "/helpers/common");
exports.resgisterSeller = function(req, res, next) {
    var seller = {};
    var address1 = req.body.address;
    delete req.body.address;
    seller = req.body;
    seller.email = seller.email.toLowerCase();
    seller.address = "";
    seller.roles = ["seller"];
    seller.password = _c_help.getHash(seller.password);
    address = {};
    address["pincode"] = req.body.pincode;
    address["address"] = address1;
    address["phone"] = req.body.phone;
    address["city"] = req.body.city;
    address["state"] = req.body.state;
    address["country"] = req.body.country;
    address["locality"] = req.body.locality;
    delete seller.pincode;
    delete seller.city;
    delete seller.state;
    delete seller.country;
    delete seller.locality;
    new Address(address)
        .save(function(err, result) {
            if (err) return next(err);
            seller.address = result._id;
            new User(seller)
                .save(function(err, result) {
                    if (err) return next(err);
                    _s_mail.sendRegistrationNotificationToSeller(result);
                    return res._response(result, "success", 200, "Please Confirm your registration from your mail ID");
                })
        })
}
exports.confirmUserStatus = function(req, res, next) {
    User.findOne({
        _id: req.params.id
    }, function(err, user) {
        if (err) return next(err);
        if (!user)
            return res._response('', "error", 500, "Invalid link");
        else {
            if (user.verified == true)
                return res._response('', "error", 500, "You are already confirmed");
            else {
                User.update({
                    _id: req.params.id
                }, {
                    "verified": 1
                }, {}, function(err, result) {
                    if (err) return next(err);
                    _s_mail.sendVerificationSuccessMail(req.params.id);
                    return res._response('', "success", 200, "Successfully confirmed");
                });
            }
        }
    });
}
exports.loginAsSeller = function(req, res, next) {
    User.loginAsSeller(req.body.email.toLowerCase(), req.body.password, function(err, seller) {
        if (err || seller === null) return next(err || new Error("Invalid Credentials"));
        seller.updateToken(function(err, token) {
            if (err) return next(err);
            seller.token = token;
            res._response(seller);
        });
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
            var password = _c_help.randomString(8);
            User.update({
                _id: user._id
            }, {
                "password": _c_help.getHash(password)
            }, {}, function(err, resu) {
                if (err) next(err);
                _s_mail.forgotPasswordMail(user._id, password);
                return res._response({}, "success", 200, "Password regenerated and sent it to your mail id");
            });
        }
    });
}
exports.setNewPassword = function(req, res, next) {
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
                "password": _c_help.getHash(password)
            }, {}, function(err, resu) {
                _s_mail.sendResetPasswordMail(user._id);
                return res._response(user, "success", 200, "YOUR PASSWORD SUCCESSFULLY CHANGED!!");
            });
        }
    });
}
