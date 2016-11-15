var express = require("express");
var router = express.Router();
var passport = require("passport");
var controller = require(ROOT_FOLDER + "/controllers/api/v1/user/account");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
router.get("/get-details", passport.authenticate("token", {
    session: false
}), controller.getDetails);
router.post("/save-details", passport.authenticate("token", {
    session: false
}), controller.saveDetails);
router.put("/update", passport.authenticate("token", {
    session: false
}), controller.update);
router.post("/change-password", passport.authenticate("token", {
    session: false
}), controller.updatePassword);
router.post("/add-address", passport.authenticate("token", {
    session: false
}), controller.addAddress);
router.get("/get-address", passport.authenticate("token", {
    session: false
}), controller.getAddress);
router.get("/get-address/:id", passport.authenticate("token", {
    session: false
}), controller.getSingleAddress);
router.put("/update-address/:id", passport.authenticate("token", {
    session: false
}), controller.updateAddress);
router.delete("/remove-address/:id", passport.authenticate("token", {
    session: false
}), controller.removeAddress);
module.exports = router;
