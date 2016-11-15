var Settings = require(ROOT_FOLDER + "/models/site_configuration");
var Image = require(ROOT_FOLDER + "/models/image");
exports.getSettings = function(req, res, next) {
    Settings.findOne()
    .exec(function(err, result) {
        if (err) return next(err);
        Image.populate(result, [{path: "fav_icon"}, {path: 'site_logo'}, {path: "overall_banner"}], function(err, result) {
          if (err) return next(err);
          return res._response(result);
        });
    });
}
exports.saveSettings = function(req, res, next) {
    var id = req.body._id;
    delete req.body._id;
    var body = req.body;
    Settings.update({_id: id}, body, {upsert: true},function(err, result) {
        if (err) return next(err);
        return res._response(result);
    });
}
exports.insertSettings = function(req, res, next) {
    var id = req.body._id;
    delete req.body._id;
    var body = req.body;
    Settings.create(body, function(err, result) {
        if (err) return next(err);
        return res._response(result);
    });
}
