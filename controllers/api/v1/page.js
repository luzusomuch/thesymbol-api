var User = require(ROOT_FOLDER + "/models/users");
var Page = require(ROOT_FOLDER + "/models/page");
exports.create = function(req, res, next) {
  new Page(req.body).save(function(err, result) {
    if(err) return next(err);
    return res._response({page: result});
  });
}
exports.update = function(req, res, next) {
  Page.update({_id: req.params.id}, req.body,function(err, result) {
    if(err) return next(err);
    return res._response(result);
  });
}
exports.query = function(req, res, next) {
  var where = {};
  where["status"] = true;
  where["is_deleted"] = false;
  Page.find(where, function(err, result) {
    if(err) return next(err);
    return res._response({pages: result});
  });
}
exports.delete = function(req, res, next) {
  var where = {};
  where["_id"] = req.params.id;
  Page.update(where, {is_deleted: true}, function(err, result) {
    if(err) return next(err);
    return res._response({page: result});
  });
}
exports.get = function(req, res, next) {
  var where = {};
  where["status"] = true;
  where["is_deleted"] = false;
  where["_id"] = req.params.id;
  Page.findOne(where, function(err, result) {
    if(err) return next(err);
    return res._response({page: result});
  });
}
