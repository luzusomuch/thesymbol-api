var express = require("express");
var passport = require("passport");
var router = express.Router();
var primesubscriptionController = require(ROOT_FOLDER + "/controllers/api/v1/primesubscription");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
router.get("/", primesubscriptionController.query);
router.get("/:id", primesubscriptionController.fetch);
router.post("/", passport.authenticate("token", {
    session: false
  }), auth.isAdmin, primesubscriptionController.create);
router.delete("/:id", passport.authenticate("token", {
  session: false
}), auth.isAdmin, primesubscriptionController.remove);
router.put("/:id", primesubscriptionController.update);
module.exports = router;
