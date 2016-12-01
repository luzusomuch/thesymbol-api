var Dispute = require(ROOT_FOLDER + "/models/dispute");
var User = require(ROOT_FOLDER + "/models/users");
var Product = require(ROOT_FOLDER + "/models/product_catelog");
var mail = require(ROOT_FOLDER + "/services/mail");
var async = require('async');

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
};

exports.addMessage = function(req, res, next) {
	req.body.ownerId = req.user._id;
	req.body.createdAt = new Date();
	Dispute.findById(req.params.id).exec(function(err, dispute) {
		if (err) {
			return next(err);
		}
		if (!dispute) {
			return next({status: 404, message: 'Disput not found'});
		}
		dispute.messages.push(req.body);
		dispute.save(function(err) {
			if (err) {
				return next(err);
			}
			return res._response(req.body);
		});
	});
};

exports.updateStatus = function(req, res, next) {
	if (!req.body.status) {
		return next({status: 422, message: 'Missng status entity'});
	}
	Dispute.findById(req.params.id).exec(function(err, dispute) {
		if (err) {
			return next(err);
		}
		if (!dispute) {
			return next({status: 404, message: 'Dispute not found'});
		}
		dispute.status = req.body.status;
		dispute.save(function(err, saved) {
			if (err) {
				return next(err);
			}
			// send mail to admin when updated status is raiseClaim
			User.find({roles: 'admin'}, (err, users) => {
				Product.findById(saved.productId, function(err, product) {
					async.each(users, (user, callback) => {
						mail.sendDisputeEmailToAdmin({user: user, product: product, orderId: saved.orderId}, callback);
					}, () => {
						return res._response({status: saved.status});
					});
	    	});
			});
		});
	});
}

exports.findMyDispute = function(req, res, next) {
	var page = req.params.page || 1;
	var limit = req.params.limit || 10;
	var skip = limit * (page -1);
	Dispute.find({
		$or: [{ownerId: req.user._id}, {shopId: req.user._id}]
	})
	.populate('productId').limit(limit).skip(skip).exec(function(err, disputes) {
		if (err) {
			return next(err);
		}
		Dispute.count({$or: [{ownerId: req.user._id}, {shopId: req.user._id}]}).exec(function(err, count) {
			if (err) {
				return next(err);
			}
			return res._response({totalItem: count, items: disputes});
		});
	});
};

exports.adminGetAll = function(req, res, next) {
	Dispute.find({status: 'raiseClaim'})
	.populate('productId')
	.populate('ownerId', '-password')
	.populate('shopId', '-password').exec(function(err, disputes) {
		if (err) {
			return next(err);
		}
		return res._response(disputes);
	});
};

exports.findById = function(req, res, next) {
  Dispute.findById(req.params.id)
  .populate('productId')
  .populate('messages.ownerId', '-password')
  .exec(function(err, result) {
    if (err) return next(err);
    if (!result) {
    	return next({status: 404, message: 'Dispute not found'});
    }
    return res._response(result);
  });
}