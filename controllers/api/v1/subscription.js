var Subscription = require(ROOT_FOLDER + "/models/subscription");

exports.create = function(req, res, next) {
    new Subscription(req.body).save(function(err, result) {
        if (err) return next(err);
        return res._response(result);
    });
}
exports.remove = function(req, res, next) {
    Subscription.remove({
        _id: req.params.id
    }).exec(function(err, result) {
        if (err) return next(err);
        return res._response(result);
    });
}
exports.update = function(req, res, next) {
    Subscription.update({
        _id: req.params.id
    }, req.body).exec(function(err, result) {
        if (err) return next(err);
        return res._response(result);
    });
}
exports.fetch = function(req, res, next) {
    Subscription.findOne({
        _id: req.params.id
    }).exec(function(err, result) {
        if (err) return next(err);
        return res._response(result);
    });
}
exports.query = function(req, res, next) {
    Subscription.find({
        status: true
    }).exec(function(err, result) {
        if (err) return next(err);
        return res._response(result);
    });
}
