var User = require(ROOT_FOLDER + "/models/users");
var Image = require(ROOT_FOLDER + "/models/image");
var _c_help = require(ROOT_FOLDER + "/helpers/common");
var Jimp = require("jimp")
var cloudinary = require("cloudinary");
cloudinary.config(require(ROOT_FOLDER+"/config/cloudinary"))
exports.uploadSingleImage = function(req, res, next) {
    if (!req.file) next(new Error("file has not been uploaded"));
    var image_data = {};
    image_data.path = req.file.path;
    image_data.url = BASE_URL + "uploads/images/" + req.file.filename;

    Jimp.read(req.file.path).then(function(Jimage) {
        Jimage
            .resize(640, 640)
            .write(ROOT_FOLDER + "/public/uploads/resized_640_640/" + req.file.filename + ".jpg");
        Jimage
            .resize(800, 1000)
            .write(ROOT_FOLDER + "/public/uploads/resized_800_1000/" + req.file.filename + ".jpg");
        Jimage
            .resize(480, 180)
            .write(ROOT_FOLDER + "/public/uploads/resized_480_180/" + req.file.filename + ".jpg");
        image_data.c_name = req.file.filename + ".jpg";
        image_data.c_path = ROOT_FOLDER + "/public/uploads/";
        image_data.c_url = BASE_URL + "uploads/";
        cloudinary.uploader.upload(req.file.path, function(result) {
            image_data.cdn = result;
            new Image(image_data).save(function(err, reuslt) {
                if (err) return next(err);
                res._response(reuslt);
            });
        });
    }).catch(function(err) {
        if (err) return next(err);
    });

}
exports.uploadMultiImage = function(req, res, next) {
    res._response(req.files);
}
