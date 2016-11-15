var PrimeSubscription = require(ROOT_FOLDER + "/models/prime-subscription");

exports.create = function(req, res, next) {
	// Currently we only allow admin to add only 1 primesubscription data
	PrimeSubscription.find({}).exec((err, result) => {
		if (err) {
			return next(err);
		}

		if (result && result.length > 0) {
			return next({status: 403, message: 'Only allow to create 1 prime subscription data'});
		}

	  new PrimeSubscription(req.body).save(function(err, result) {
	    if (err) return next(err);
	    return res._response(result);
	  });
	});
}
exports.remove = function(req, res, next) {
  PrimeSubscription.remove({
    _id: req.params.id
  }).exec(function(err, result) {
    if (err) return next(err);
    return res._response(result);
  });
}
exports.update = function(req, res, next) {
  PrimeSubscription.update({
    _id: req.params.id
  }, req.body).exec(function(err, result) {
    if (err) return next(err);
    return res._response(result);
  });
}
exports.fetch = function(req, res, next) {
  PrimeSubscription.findOne({
    _id: req.params.id
  }).exec(function(err, result) {
    if (err) return next(err);
    if (!result) {
    	return next({status: 404, message: 'Prime subscription not found'});
    }
    return res._response(result);
  });
}
exports.query = function(req, res, next) {
  PrimeSubscription.find({}).exec(function(err, result) {
    if (err) return next(err);
    return res._response(result);
  });
}
