var Settings = require(ROOT_FOLDER + "/models/home_page_configuration");
exports.getSettings = function(req, res, next) {
    Settings.findOne({})
        .populate("main_banner.image")
        .populate("sub_banner.image")
        .populate("images.image")
        .populate("overall_banner")
        .exec(function(err, result) {
            if (err) return next(err);
            return res._response(result);
        });
}
exports.saveSettings = function(req, res, next) {
    var id = req.body._id;
    delete req.body._id;
    var body = req.body;
    Settings.update({
        _id: id
    }, body, {upsert: true},function(err, result) {
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
