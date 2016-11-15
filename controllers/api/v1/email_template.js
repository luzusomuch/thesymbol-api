var User = require(ROOT_FOLDER + "/models/users");
var Emailtemplate = require(ROOT_FOLDER + "/models/email_template");
exports.create = function(req, res, next) {
  new Emailtemplate(req.body).save(function(err, result) {
    if(err) return next(err);
    return res._response({email_template: result});
  });
}
exports.update = function(req, res, next) {
  Emailtemplate.update({_id: req.params.id}, req.body,function(err, result) {
    if(err) return next(err);
    return res._response(result);
  });
}
exports.query = function(req, res, next) {
  var where = {};
  where["status"] = true;
  where["is_deleted"] = false;
  Emailtemplate.find(where, function(err, result) {
    if(err) return next(err);
    return res._response({email_templates: result});
  });
}
exports.delete = function(req, res, next) {
  var where = {};
  where["_id"] = req.params.id;
  Emailtemplate.update(where, {is_deleted: true}, function(err, result) {
    if(err) return next(err);
    return res._response({email_template: result});
  });
}
exports.get = function(req, res, next) {
  var where = {};
  where["status"] = true;
  where["is_deleted"] = false;
  where["_id"] = req.params.id;
  Emailtemplate.findOne(where, function(err, result) {
    if(err) return next(err);
    return res._response({email_template: result});
  });
}
