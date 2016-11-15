var express = require("express");
var passport = require("passport");
var validate = require('express-validation');
var router = express.Router();

/** Seller Controllers **/
var indexController = require(ROOT_FOLDER + "/controllers/api/v1/seller/index");
var profileController = require(ROOT_FOLDER + "/controllers/api/v1/seller/profile");
var subController = require(ROOT_FOLDER + "/controllers/api/v1/seller/subscription");
/** Middlewares **/
var auth = require(ROOT_FOLDER + "/middlewares/auth");
var authentication = require(ROOT_FOLDER + "/middlewares/authentication");
/** Validations **/
var v_seller_register = require(ROOT_FOLDER + '/validations/seller_register.js');
var v_user_login = require(ROOT_FOLDER + '/validations/login.js');
/** Index Controllers **/
router.post("/register", validate(v_seller_register), indexController.resgisterSeller);
router.get("/confirm/:id", indexController.confirmUserStatus);
router.post("/login", validate(v_user_login), indexController.loginAsSeller);
router.post("/forgotpassword", indexController.forgotPassword);
router.post("/newpassword/:id", indexController.setNewPassword);

/** Subscription Controller **/
router.post("/subscribe",
    passport.authenticate("token", {
        session: false
    }), subController.subscribe);
router.get("/current-subscription",
    passport.authenticate("token", {
        session: false
    }), subController.getMyPlan);
//seller details update
router.get("/get-profile",
    passport.authenticate("token", {
        session: false
    }),
    authentication.isSeller,
    profileController.getProfile);
router.post("/update-profile",
    passport.authenticate("token", {
        session: false
    }),
    authentication.isSeller,
    profileController.updateProfile);
router.post("/update-settings",
    passport.authenticate("token", {
        session: false
    }),
    authentication.isSeller,
    profileController.updateSettings);
/** Seller Product Routes**/
router.use("/products", require(ROOT_FOLDER + "/routes/api/v1/seller/product"));
/** Seller Order Routes**/
router.use("/orders", require(ROOT_FOLDER + "/routes/api/v1/seller/order"));
/** Seller Tracking Routes**/
router.use("/tracking", require(ROOT_FOLDER + "/routes/api/v1/seller/tracking"));
module.exports = router;
