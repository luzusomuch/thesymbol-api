var express = require("express");
var passport = require("passport");
var router = express.Router();
var Ctrl = require(ROOT_FOLDER + "/controllers/api/v1/statistic");
router.get("/", Ctrl.getStatistics);
module.exports = router;
