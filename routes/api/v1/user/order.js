var express = require("express");
var router = express.Router();
var controller = require(ROOT_FOLDER + "/controllers/api/v1/user/order");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
var passport = require("passport");
router.get("/get-order", passport.authenticate("token", {
    session: false
}), controller.getOrder);
router.get("/digital-products", passport.authenticate("token", {
    session: false
}), controller.getOrderedDigitalProducts);
router.get("/digital-products/:id", controller.downloadDigitalProduct);
module.exports = router;
