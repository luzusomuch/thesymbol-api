var express = require("express");
var passport = require("passport");
var router = express.Router();
var licenseC = require(ROOT_FOLDER + "/controllers/api/v1/license");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
router.get("/", licenseC.query);
router.get("/:id", licenseC.fetch);
router.post("/", passport.authenticate("token", {
        session: false
    }),
    auth.isAdmin, licenseC.create);
router.delete("/:id", passport.authenticate("token", {
        session: false
    }),
    auth.isAdmin, licenseC.remove);
router.put("/:id", licenseC.update);
module.exports = router;
