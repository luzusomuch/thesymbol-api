var Dispute = require(ROOT_FOLDER + "/models/dispute");
var User = require(ROOT_FOLDER + "/models/users");
var Product = require(ROOT_FOLDER + "/models/product_catelog");
var mail = require(ROOT_FOLDER + "/services/mail");

exports.create = function(req, res, next) {
	Dispute.findOne({
		productId: req.body.productId, 
		ownerId: req.body.ownerId,
		shopId: req.body.shopId,
		orderId: req.body.orderId
	}, function(err, dispute) {
		if (err) {
			return next(err);
		}
		if (dispute) {
			return next({status: 409, message: 'This dispute was existed'});
		}
		// create new dispute
		req.body.messages = [];
	  new Dispute(req.body).save(function(err, result) {
	    if (err) return next(err);
	    User.findById(result.shopId, function(err, shop) {
	    	Product.findById(result.productId, function(err, product) {
			    mail.sendDisputeEmail({user: shop, product: product, orderId: result.orderId}, function(){});
			    return res._response(result);
	    	});
	    });
	  });
	});
}
exports.remove = function(req, res, next) {
  Dispute.remove({
    _id: req.params.id
  }).exec(function(err, result) {
    if (err) return next(err);
    return res._response(result);
  });
}
exports.update = function(req, res, next) {
  Dispute.update({
    _id: req.params.id
  }, req.body).exec(function(err, result) {
    if (err) return next(err);
    return res._response(result);
  });
}
exports.findById = function(req, res, next) {
  Dispute.findOne({
    _id: req.params.id
  }).exec(function(err, result) {
    if (err) return next(err);
    if (!result) {
    	return next({status: 404, message: 'Dispute not found'});
    }
    return res._response(result);
  });
}