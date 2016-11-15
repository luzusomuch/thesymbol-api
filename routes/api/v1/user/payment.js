var express = require("express");
var router = express.Router();
var controller = require(ROOT_FOLDER + "/controllers/api/v1/user/payment");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
router.get("/save-order", auth.partialAuthenticate, controller.saveOrder);
router.get("/notify-order/:id", controller.notifiOrder);
module.exports = router;
