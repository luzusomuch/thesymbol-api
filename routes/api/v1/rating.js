var express = require("express");
var router  = express.Router();
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
var productController = require(ROOT_FOLDER + "/controllers/api/v1/user/product");
var ratingController = require(ROOT_FOLDER + "/controllers/api/v1/rating");
router.post("/add-review", auth.partialAuthenticate, ratingController.addReview);
router.get("/get-review", auth.partialAuthenticate, ratingController.getReview);
module.exports = router;