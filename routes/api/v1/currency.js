var express = require("express");
var passport = require("passport");
var router = express.Router();
var currencyController = require(ROOT_FOLDER + "/controllers/api/v1/currency");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
router.get("/", currencyController.query);
router.get("/get-by-country-code", currencyController.getByCountryCode);
router.get("/:id", currencyController.fetch);
router.post("/", passport.authenticate("token", {
    session: false
  }), auth.isAdmin, currencyController.create);
router.delete("/:id", passport.authenticate("token", {
  session: false
}), auth.isAdmin, currencyController.remove);
router.put("/:id", currencyController.update);
module.exports = router;
