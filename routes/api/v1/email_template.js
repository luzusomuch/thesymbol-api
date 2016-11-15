var express = require("express");
var passport = require("passport");
var router = express.Router();
var ETController = require(ROOT_FOLDER + "/controllers/api/v1/email_template");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
router.post("/",
  passport.authenticate("token", {
      session: false
  }),
  auth.isAdmin,
  ETController.create
);
router.get("/",
  passport.authenticate("token", {
      session: false
  }),
  auth.isAdmin,
  ETController.query
);
router.get("/:id",
  passport.authenticate("token", {
      session: false
  }),
  auth.isAdmin,
  ETController.get
);
router.put("/:id",
  passport.authenticate("token", {
      session: false
  }),
  auth.isAdmin,
  ETController.update
);
router.delete("/:id",
  passport.authenticate("token", {
      session: false
  }),
  auth.isAdmin,
  ETController.delete
);
module.exports = router;
