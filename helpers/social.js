var async = require("async");
var _self = exports;
var User = require(ROOT_FOLDER + "/models/users");
var _h_common = require(ROOT_FOLDER + "/helpers/common");
var _s_mail = require(ROOT_FOLDER + "/services/mail");
exports.getUser = function(token, gateway_name) {
    return function(cb) {
        var gateway = require(ROOT_FOLDER + "/services/social_login_gateways/" + gateway_name + "_login");
        gateway.getUser(token, ["id", "name", "email", "first_name", "last_name", "gender"], function(err, user) {
            if (err) return cb(err);
            return cb(null, user, gateway_name);
        });
    }
}
exports.isUserExist = function(sUser, gName, cb) {
    User.findOne({
        email: sUser.email
    }).exec(function(err, dUser) {
        if (err) return cb(err);
        else if (dUser == null) cb(null, sUser, gName, false);
        else cb(null, sUser, gName, dUser._id);
    });
}
exports.updateOrInsertUser = function(sUser, gName, userId, cb) {
    var token = _h_common.randomString(32);
    if (userId) {
        var update = {};
        update["token"] = token;
        update["social_logins." + gName + "_id"] = sUser.id;
        update["verified"] = true;
        return User.findOneAndUpdate({
            _id: userId
        }, update, {
            upsert: true,
            new: true
        }, function(err, updated) {
          cb(null, updated, userId, "");
        });
    } else {
        var password = _h_common.randomString(8);
        var user = {
            name: sUser.name,
            token: token,
            gender: sUser.gender,
            email: sUser.email,
            first_name: sUser.first_name,
            last_name: sUser.last_name,
            password: password,
            roles: ["user"],
            verified: true
        };
        user["social_logins." + gName + "_id"] = sUser.id;
        return new User(user).save(function(err, inserted) {
          cb(null, inserted, userId, password);
        });
    }
}
exports.loginUsingSocial = function(req, cb) {
    var response = {};
    async.waterfall([
        _self.getUser(req.body.access_token, req.body.gateway, response),
        _self.isUserExist,
        _self.updateOrInsertUser,
        function(user, exist, password, cb) {
          if(!exist) {
            user.password = password;
            _s_mail.sendNotificationToSocialUser(user);
          }
          var temp = Object.assign(user);
          delete temp.password;
          return cb(null, temp);
        }
    ], cb);
}
