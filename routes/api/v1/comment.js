var express = require("express");
var passport = require("passport");
var router = express.Router();
var commentController = require(ROOT_FOLDER + "/controllers/api/v1/comment");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
router.get("/", commentController.getAll);
router.get("/:id", commentController.getOne);
router.get("/:id/:type", commentController.getAllByType);
router.post("/", passport.authenticate("token", {
    session: false
  }), commentController.create);
router.delete("/:id", passport.authenticate("token", {
  session: false
}), commentController.remove);
router.put("/:id", commentController.update);
module.exports = router;
