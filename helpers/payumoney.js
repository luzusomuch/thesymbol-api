var credentials = require(ROOT_FOLDER + "/config/payment");
var stripe_credentials = credentials["sandbox"]["stripe"];
var stripe = require("stripe")(stripe_credentials.api_key);
exports.payForOrder = function(uid, cb) {

}
