var express = require("express");
var router = express.Router();
router.get("/", function(req, res, next) {
    res.json({
        status: "Message"
    });
});
router.use("/admin", require("./v1/admin"));
router.use("/products", require("./v1/product"));
router.use("/categories", require("./v1/category"));
router.use("/users", require("./v1/user"));
router.use("/sellers", require("./v1/seller"));
router.use("/images", require("./v1/image"));
router.use("/emailtemplates", require("./v1/email_template"));
router.use("/mobiletemplates", require("./v1/mobile_template"));
router.use("/pages", require("./v1/page"));
router.use("/orders", require("./v1/order"));
router.use("/finance", require("./v1/finance"));
router.use("/configurations", require("./v1/configurations"));
router.use("/countries", require("./v1/country"));
router.use("/statistics", require("./v1/statistics"));
router.use("/licenses", require("./v1/license"));
router.use("/coupons", require("./v1/coupon"));
router.use("/subscriptions", require("./v1/subscription"));
router.use("/sources", require("./v1/source"));
router.get("/test", function(req, res, next) {
});
module.exports = router;
