var Product = require(ROOT_FOLDER + "/models/product_catelog");
var globals = require(ROOT_FOLDER + "/config/globals");
var bcrypt = require("bcrypt");
exports.randomString = function(length) {
    length = length === undefined ? 6 : length;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
exports.getHash = function(string) {
    var salt = bcrypt.genSaltSync(globals.bcrypt.salt_round);
    return bcrypt.hashSync(String(string), salt);
}
exports.getProductData = function(id, cb) {
    Product
        .findOne({
            _id: id
        })
        .populate("created_by")
        .exec(cb);
}
exports.getUserById = function(id, cb) {
    var User = require(ROOT_FOLDER + "/models/users");
    User.findOne({
        _id: id
    }, cb);
}
