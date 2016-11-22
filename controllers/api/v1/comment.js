'use strict';
let Comment = require(ROOT_FOLDER + "/models/comment");

exports.create = function(req, res, next) {
	let data = req.body;
	data.ownerId = req.user._id;
  new Comment(data).save(function(err, result) {
    if (err) return next(err);
    return res._response(result);
  });
}
exports.remove = function(req, res, next) {
  Comment.remove({
    _id: req.params.id
  }).exec(function(err, result) {
    if (err) return next(err);
    return res._response(result);
  });
}
exports.update = function(req, res, next) {
  Comment.update({
    _id: req.params.id
  }, req.body).exec(function(err, result) {
    if (err) return next(err);
    return res._response(result);
  });
}
exports.getOne = function(req, res, next) {
  Comment.findById(req.params.id)
  .populate('ownerId', '-password')
  .exec(function(err, result) {
    if (err) return next(err);
    if (!result) {
    	return next({status: 404, message: 'Currency not found'});
    }
    return res._response(result);
  });
}

exports.getAll = function(req, res, next) {
  Comment.find({}).exec(function(err, result) {
    if (err) return next(err);
    return res._response(result);
  });
}

exports.getAllByType = (req, res, next) => {
	let page = req.query.page || 1;
	let limit = req.query.limit || 10;
	let skip = (page - 1) * limit;
	Comment.find({type: req.params.type, objectId: req.params.id})
	.populate('ownerId', '-password')
	.limit(limit)
	.skip(skip).exec((err, comments) => {
		if (err) {
			return next(err);
		}
		// count total items
		Comment.count({type: req.params.type, objectId: req.params.id}).exec((err, count) => {
			if (err) {
				return next(err);
			}
			return res._response({items: comments, totalItem: count});
		});
	});
};
