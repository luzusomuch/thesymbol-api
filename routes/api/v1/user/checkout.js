var express = require("express");
var router = express.Router();
var controller = require(ROOT_FOLDER + "/controllers/api/v1/user/checkout");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
var passport = require("passport");
router.post("/add-billaddress", passport.authenticate("token", {
    session: false
}), controller.addBillAddress);
router.post("/add-shipaddress", passport.authenticate("token", {
    session: false
}), controller.addShipAddress);
router.get("/get-address", passport.authenticate("token", {
    session: false
}), controller.getAddress);
router.post("/buy-now-completed", passport.authenticate("token", {
    session: false
}), controller.buyNowCompleted);
router.post("/buy-cart-completed", passport.authenticate("token", {
    session: false
}), controller.buyFromCartCompleted);
module.exports = router;
