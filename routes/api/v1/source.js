var express = require("express");
var router = express.Router();
var ImageController = require(ROOT_FOLDER + "/controllers/api/v1/source");
var multer = require("multer");
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, ROOT_FOLDER + '/public/uploads/sources')
    }
});
var upload = multer({
    storage: storage
});
router.post("/upload", upload.single('source'), ImageController.uploadSource);
module.exports = router;
