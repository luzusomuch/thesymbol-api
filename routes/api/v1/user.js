var express = require("express");
var passport = require("passport");
var router = express.Router();
var indexController = require(ROOT_FOLDER + "/controllers/api/v1/user/index");
var uSellerController = require(ROOT_FOLDER + "/controllers/api/v1/user/seller");
var userC = require(ROOT_FOLDER + "/controllers/api/v1/user/user");
var validator = require(ROOT_FOLDER + "/middlewares/validator");
var validate = require('express-validation');
var v_user_register = require(ROOT_FOLDER + '/validations/user_register.js');
var v_user_login = require(ROOT_FOLDER + '/validations/login.js');
var auth = require(ROOT_FOLDER + "/middlewares/authentication");


router.post("/register", validate(v_user_register), indexController.resgisterUser);
router.post("/login", validate(v_user_login), indexController.loginAsUser);
router.post("/social_login", validator.socialLogin, indexController.loginUsingSocial);
router.get("/confirmuser/:id", indexController.confirmUserStatus);
router.get("/get-address", passport.authenticate("token", {
    session: false
}), indexController.getAddress);
router.get("/test", indexController.test);
router.post("/forgot", indexController.forgotPassword);
router.post("/newpassword/:id", indexController.newPassword);
router.get("/get-sellers", uSellerController.getSellers);
router.get("/generatetoken", indexController.generateToken);
router.put("/change-password", passport.authenticate("token", {
    session: false
}), userC.changePassword);
router.use("/product", require("./user/product"));
router.use("/cart", require("./user/cart"));
router.use("/checkout", require("./user/checkout"));
router.use("/category", require("./user/category"));
router.use("/order", require("./user/order"));
router.use("/payment", require("./user/payment"));
router.use("/account", require("./user/account"));

router.get("/", userC.query);
router.get("/:id", userC.fetch);
router.post("/", function(req, res, next) {
        console.log(req.headers['authorization'])
        next();
    }, passport.authenticate("token", {
        session: false
    }),
    auth.isAdmin, userC.create);
router.delete("/:id", passport.authenticate("token", {
        session: false
    }),
    auth.isAdmin, userC.remove);
router.put("/:id", userC.update);
module.exports = router;
