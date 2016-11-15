var User = require(ROOT_FOLDER + "/models/users");
var _self = exports;

exports.isExistingUser = function(req, res, next) {
  return function(cb) {
      var gateway = require(ROOT_FOLDER + "/services/social_login_gateways/" + req.body.gateway + "_login");
      gateway.getUser(req.body.access_token, ["id", "name", "email", "first_name", "last_name", "gender"], cb);
  }
}
