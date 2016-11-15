var express = require("express");
var passport = require("passport");
var router = express.Router();
var subscriptionC = require(ROOT_FOLDER + "/controllers/api/v1/subscription");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
router.get("/", subscriptionC.query);
router.get("/:id", subscriptionC.fetch);
router.post("/", passport.authenticate("token", {
        session: false
    }),
    auth.isAdmin, subscriptionC.create);
router.delete("/:id", passport.authenticate("token", {
        session: false
    }),
    auth.isAdmin, subscriptionC.remove);
router.put("/:id", subscriptionC.update);
module.exports = router;
