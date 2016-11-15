var express = require("express");
var passport = require("passport");
var router = express.Router();
var couponC = require(ROOT_FOLDER + "/controllers/api/v1/coupon");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
router.get("/", couponC.query);
router.get("/:id", couponC.fetch);
router.post("/", passport.authenticate("token", {
        session: false
    }),
    auth.isAdmin, couponC.create);
router.delete("/:id", passport.authenticate("token", {
        session: false
    }),
    auth.isAdmin, couponC.remove);
router.put("/:id", couponC.update);
router.get("/is-valid/:id", passport.authenticate("token", {
    session: false
}), couponC.check);
module.exports = router;
