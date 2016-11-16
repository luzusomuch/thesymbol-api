var Currency = require(ROOT_FOLDER + "/models/currency");

exports.create = function(req, res, next) {
	// Currently we only allow admin to add only 1 primesubscription data
	Currency.findOne({countryCode: req.body.countryCode}).exec((err, result) => {
		if (err) {
			return next(err);
		}

		if (result && result._id) {
			return next({status: 409, message: 'This country was existed'});
		}

	  new Currency(req.body).save(function(err, result) {
	    if (err) return next(err);
	    return res._response(result);
	  });
	});
}
exports.remove = function(req, res, next) {
  Currency.remove({
    _id: req.params.id
  }).exec(function(err, result) {
    if (err) return next(err);
    return res._response(result);
  });
}
exports.update = function(req, res, next) {
  Currency.update({
    _id: req.params.id
  }, req.body).exec(function(err, result) {
    if (err) return next(err);
    return res._response(result);
  });
}
exports.fetch = function(req, res, next) {
  Currency.findOne({
    _id: req.params.id
  }).exec(function(err, result) {
    if (err) return next(err);
    if (!result) {
    	return next({status: 404, message: 'Currency not found'});
    }
    return res._response(result);
  });
}
exports.query = function(req, res, next) {
  Currency.find({}).exec(function(err, result) {
    if (err) return next(err);
    return res._response(result);
  });
}
exports.getByCountryCode = (req, res, next) => {
  if (req.query.countryCode) {
    Currency.findOne({countryCode: req.query.countryCode}).exec((err, result) => {
      if (err) {
        return next(err);
      }
      if (!result) {
        return next({status: '404', message: 'Currency not found'});
      }
      return res._response(result);
    });
  } else {
    return next({status: '422', message: 'Missing country code'});
  }
}
