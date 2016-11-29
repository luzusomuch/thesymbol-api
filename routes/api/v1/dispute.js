var express = require("express");
var passport = require("passport");
var router = express.Router();
var disputeController = require(ROOT_FOLDER + "/controllers/api/v1/dispute");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
router.get("/:id", disputeController.findById);

router.post("/", passport.authenticate("token", {
  session: false
}), disputeController.create);

router.delete("/:id", passport.authenticate("token", {
  session: false
}), auth.isAdmin, disputeController.remove);

router.put("/:id", passport.authenticate("token", {
  session: false
}), disputeController.update);
module.exports = router;
