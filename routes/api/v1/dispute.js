var express = require("express");
var passport = require("passport");
var router = express.Router();
var disputeController = require(ROOT_FOLDER + "/controllers/api/v1/dispute");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
router.get("/", passport.authenticate('token', {
	session: false
}), disputeController.findMyDispute);
router.get("/:id", disputeController.findById);

router.post("/", passport.authenticate("token", {
  session: false
}), disputeController.create);

router.delete("/:id", passport.authenticate("token", {
  session: false
}), auth.isAdmin, disputeController.remove);

router.put("/:id/add-message", passport.authenticate("token", {
  session: false
}), disputeController.addMessage);

router.put("/:id/update-status", passport.authenticate("token", {
  session: false
}), disputeController.updateStatus);
module.exports = router;
