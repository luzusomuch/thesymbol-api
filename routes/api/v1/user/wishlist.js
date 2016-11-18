var express = require("express");
var router  = express.Router();
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
var productController = require(ROOT_FOLDER + "/controllers/api/v1/user/product");
var wlController = require(ROOT_FOLDER + "/controllers/api/v1/user/wishlist");
router.post("/add-wishlist", auth.partialAuthenticate, wlController.addWishlist);
router.get("/get-wishlist", auth.partialAuthenticate, wlController.getWishlist);
module.exports = router;