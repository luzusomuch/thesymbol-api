var express = require("express");
var router = express.Router();
var configController = require(ROOT_FOLDER + "/controllers/api/v1/configurations");
router.get("/seller", configController.sellerConfiguration);
module.exports = router;
