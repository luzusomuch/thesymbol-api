var License = require(ROOT_FOLDER + "/models/license");

exports.create = function(req, res, next) {
    new License(req.body).save(function(err, result) {
        if (err) return next(err);
        return res._response(result);
    });
}
exports.remove = function(req, res, next) {
    License.remove({
        _id: req.params.id
    }).exec(function(err, result) {
        if (err) return next(err);
        return res._response(result);
    });
}
exports.update = function(req, res, next) {
    License.update({
        _id: req.params.id
    }, req.body).exec(function(err, result) {
        if (err) return next(err);
        return res._response(result);
    });
}
exports.fetch = function(req, res, next) {
  License.findOne({
      _id: req.params.id
  }).exec(function(err, result) {
      if (err) return next(err);
      return res._response(result);
  });
}
exports.query = function(req, res, next) {
  License.find({
    status: true
  }).exec(function(err, result) {
      if (err) return next(err);
      return res._response(result);
  });
}
