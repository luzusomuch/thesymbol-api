var express = require("express");
var router = express.Router();
var controller = require(ROOT_FOLDER + "/controllers/api/v1/user/category");
var product_controller = require(ROOT_FOLDER + "/controllers/api/v1/user/product");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
router.get("/get-categories", controller.getCategories);
module.exports = router;
