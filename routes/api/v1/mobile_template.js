var express = require("express");
var passport = require("passport");
var router = express.Router();
var MTController = require(ROOT_FOLDER + "/controllers/api/v1/mobile_template");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
router.post("/",
  passport.authenticate("token", {
      session: false
  }),
  auth.isAdmin,
  MTController.create
);
router.get("/",
  passport.authenticate("token", {
      session: false
  }),
  auth.isAdmin,
  MTController.query
);
router.get("/:id",
  passport.authenticate("token", {
      session: false
  }),
  auth.isAdmin,
  MTController.get
);
router.put("/:id",
  passport.authenticate("token", {
      session: false
  }),
  auth.isAdmin,
  MTController.update
);
router.delete("/:id",
  passport.authenticate("token", {
      session: false
  }),
  auth.isAdmin,
  MTController.delete
);
module.exports = router;
