var credentials = require(ROOT_FOLDER + "/config/payment");
var globals = require(ROOT_FOLDER + "/config/globals");
var stripe_credentials = credentials[globals.environment]["stripe"];
var stripe = require("stripe")(stripe_credentials.secret_key);
exports.payForOrder = function(paymentObject, cb) {
    paymentObject["currency"] = globals.currency;
    stripe.charges.create(paymentObject, cb);
}
