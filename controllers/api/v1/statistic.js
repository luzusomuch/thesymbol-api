var Product = require(ROOT_FOLDER + "/models/product_catelog")
var Order = require(ROOT_FOLDER + "/models/order")
var User = require(ROOT_FOLDER + "/models/users")
var async = require("async");
exports.getStatistics = function(req, res, next) {
    async.parallel({
        user_count: function(cb) {
            User.count().exec(cb);
        },
        products_count: function(cb) {
            Product.count().exec(cb);
        },
        orders_count: function(cb) {
            Order.count().exec(cb);
        }
    }, function(err, result) {
      if(err) return next(err);
      return res._response(result);
    })
};
