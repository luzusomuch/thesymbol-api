var User = require(ROOT_FOLDER + "/models/users");
var Source = require(ROOT_FOLDER + "/models/source");
var _c_help = require(ROOT_FOLDER + "/helpers/common");
var Jimp = require("jimp")
var cloudinary = require("cloudinary");
cloudinary.config(require(ROOT_FOLDER + "/config/cloudinary"))
exports.uploadSource = function(req, res, next) {
    if (!req.file) next(new Error("file has not been uploaded"));
    var source = {};
    source.path = req.file.path;
    source.url = BASE_URL + "uploads/sources/" + req.file.filename;
    //cloudinary.uploader.upload(req.file.path, function(result) {
        source.cdn = {};
        source.type = req.file.mimetype;//result.resource_type;
        new Source(source).save(function(err, result) {
            if (err) return next(err);
            res._response(result);
        });
  //  }).catch(function(err) {
      //  if (err) return next(err);
    //});

}
exports.uploadMultiImage = function(req, res, next) {
    res._response(req.files);
}
