'use strict';
let Like = require(ROOT_FOLDER + "/models/like");

exports.create = function(req, res, next) {
	let data = req.body;
	data.ownerId = req.user._id;
  new Like(data).save(function(err, result) {
    if (err) return next(err);
    return res._response(result);
  });
}
exports.remove = function(req, res, next) {
  Like.remove({
    _id: req.params.id
  }).exec(function(err, result) {
    if (err) return next(err);
    return res._response(result);
  });
}

exports.check = (req, res, next) => {
	Like.findOne({type: req.params.type, objectId: req.params.id}).exec((err, liked) => {
		if (err) {
			return next(err);
		}
		if (!liked) {
			return next({liked: false});
		}
		return res._response({liked: true});
	});
};
