var express = require("express");
var router = express.Router();
var ImageController = require(ROOT_FOLDER + "/controllers/api/v1/image");
var multer = require("multer");
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, ROOT_FOLDER + '/public/uploads/images')
    }
});
var upload = multer({
    storage: storage
});
router.post("/upload-single-image", upload.single('image'), ImageController.uploadSingleImage);
router.post("/upload-multi-image", upload.array('image'), ImageController.uploadMultiImage);
module.exports = router;
