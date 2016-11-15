var express = require("express");
var router = express.Router();
var countryController = require(ROOT_FOLDER + "/controllers/api/v1/country");
router.get("/", countryController.query);
module.exports = router;
