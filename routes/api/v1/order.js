var express = require("express");
var passport = require("passport");
var router = express.Router();
var orderController = require(ROOT_FOLDER + "/controllers/api/v1/order");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
router.get("/",
    orderController.getOrders
);

module.exports = router;
