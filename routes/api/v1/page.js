var express = require("express");
var passport = require("passport");
var router = express.Router();
var pageController = require(ROOT_FOLDER + "/controllers/api/v1/page");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
router.post("/",
  passport.authenticate("token", {
      session: false
  }),
  auth.isAdmin,
  pageController.create
);
router.get("/",
  pageController.query
);
router.get("/:id",
  pageController.get
);
router.put("/:id",
  passport.authenticate("token", {
      session: false
  }),
  auth.isAdmin,
  pageController.update
);
router.delete("/:id",
  passport.authenticate("token", {
      session: false
  }),
  auth.isAdmin,
  pageController.delete
);
module.exports = router;
