var express = require("express");
var passport = require("passport");
var router = express.Router();
var trackingController = require(ROOT_FOLDER + "/controllers/api/v1/seller/tracking");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
router.get("/getStatus",
    passport.authenticate("token", {
        session: false
    }),
    trackingController.getStatus
);
router.put("/update/:order_id/:product_id",
    passport.authenticate("token", {
        session: false
    }),
    auth.isSeller,
    trackingController.updateTracking
);
module.exports = router;
