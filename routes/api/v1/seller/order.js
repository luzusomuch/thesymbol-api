var express = require("express");
var passport = require("passport");
var router = express.Router();
var orderController = require(ROOT_FOLDER + "/controllers/api/v1/seller/order");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");


router.get("/getStatus",
    passport.authenticate("token", {
        session: false
    }),
    auth.isSeller,
    orderController.getOrders
);
router.put("/update/:order_id/:product_id",
    passport.authenticate("token", {
        session: false
    }),
    auth.isSeller,
    orderController.updateOrder
);
router.get("/:id",
    passport.authenticate("token", {
        session: false
    }),
    auth.isSeller,
    orderController.getSingleOrder
);
module.exports = router;
