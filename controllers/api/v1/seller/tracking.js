var User = require(ROOT_FOLDER + "/models/users");
var Address = require(ROOT_FOLDER + "/models/address");
var Orders = require(ROOT_FOLDER + "/models/order");
var Images = require(ROOT_FOLDER + "/models/image");
var async = require("async");
var mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;
var _s_mail = require(ROOT_FOLDER + "/services/mail");
exports.updateTracking = function(req, res, next) {
    var update = {};
    update["products.$.tracking.status"] = req.query.status;
    if(req.query.status == "Rejected" || req.query.status == "Delivered" || req.query.status == "Completed" || req.query.status == "Cancelled")
      update["products.$.status"] = req.query.status;
    if (req.body.tracking_number) {
        update["products.$.tracking.tracking_number"] = req.body.tracking_number;
    }
    Orders.findOneAndUpdate({
        "_id": req.params.order_id,
        "products.id": req.params.product_id
    }, update, function(err, result) {
        if (err) return next(err);
        _s_mail.sendProductStatusNotification(result.user_id, req.params.product_id, req.query.status);
        return res._response(result, "success", 200, "Updated Successfully");
    })
}
exports.getStatus = function(req, res, next) {
  var status = req.query.status ? req.query.status : "Completed";
  Orders
      .aggregate()
      .unwind("products")
      .match({
        "products.tracking.status": status,
        "products.shop_id": req.user._id
      })
      .lookup({
          from: "product_catelogs",
          localField: "products.id",
          foreignField: "_id",
          as: "products1"
      })
      .project({
          delivery_status: "$products.tracking.status",
          returned_reason: "$products.tracking.reason",
          order_status: "$products.status",
          shipping: "$shipping",
          product_id: "$products.id",
          date_added: "$created_at",
          price: "$products.price",
          quantity: "$products.quantity",
          products: "$products1"
      })
      .exec(function(err, orders) {
          if (err) return next(err);
          return res._response({
              orders: orders
          });
      })
}
