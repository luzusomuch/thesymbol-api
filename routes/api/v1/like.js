var express = require("express");
var passport = require("passport");
var router = express.Router();
var likeController = require(ROOT_FOLDER + "/controllers/api/v1/like");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
router.get("/:id/:type/check", likeController.check);
router.post("/", passport.authenticate("token", {
    session: false
  }), likeController.create);
router.delete("/:id", passport.authenticate("token", {
  session: false
}), likeController.remove);
module.exports = router;
