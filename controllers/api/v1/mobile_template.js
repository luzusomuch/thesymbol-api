var User = require(ROOT_FOLDER + "/models/users");
var Mobiletemplate = require(ROOT_FOLDER + "/models/mobile_template");
exports.create = function(req, res, next) {
  new Mobiletemplate(req.body).save(function(err, result) {
    if(err) return next(err);
    return res._response({mobile_template: result});
  });
}
exports.update = function(req, res, next) {
  Mobiletemplate.update({_id: req.params.id}, req.body,function(err, result) {
    if(err) return next(err);
    return res._response(result);
  });
}
exports.query = function(req, res, next) {
  var where = {};
  where["status"] = true;
  where["is_deleted"] = false;
  Mobiletemplate.find(where, function(err, result) {
    if(err) return next(err);
    return res._response({mobile_templates: result});
  });
}
exports.delete = function(req, res, next) {
  var where = {};
  where["_id"] = req.params.id;
  Mobiletemplate.update(where, {is_deleted: true}, function(err, result) {
    if(err) return next(err);
    return res._response({mobile_template: result});
  });
}
exports.get = function(req, res, next) {
  var where = {};
  where["status"] = true;
  where["is_deleted"] = false;
  where["_id"] = req.params.id;
  Mobiletemplate.findOne(where, function(err, result) {
    if(err) return next(err);
    return res._response({mobile_template: result});
  });
}
