var express = require("express");
var passport = require("passport");
var router = express.Router();
var financeController = require(ROOT_FOLDER + "/controllers/api/v1/finance");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
router.get("/",
    financeController.getFinance
);
router.get("/:id",
    financeController.getFinance
);
router.post("/pay-amount/:id",
    financeController.payAmount
);

module.exports = router;
