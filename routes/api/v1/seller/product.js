var express = require("express");
var passport = require("passport");
var router = express.Router();
var productController = require(ROOT_FOLDER + "/controllers/api/v1/seller/product");
var Settings = require(ROOT_FOLDER + "/models/site_configuration");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");


router.get("/non-approved-products",
    passport.authenticate("token", {
        session: false
    }),
    auth.isSeller,
    productController.getNonApprovedProducts
);
router.get("/approved-products",
    passport.authenticate("token", {
        session: false
    }),
    auth.isSeller,
    productController.getApprovedProducts
);
router.get("/active-products",
    passport.authenticate("token", {
        session: false
    }),
    auth.isSeller,
    productController.getActiveProducts
);
router.get("/deactive-products",
    passport.authenticate("token", {
        session: false
    }),
    auth.isSeller,
    productController.getDeactiveProducts
);
router.get("/out-of-stock",
    passport.authenticate("token", {
        session: false
    }),
    auth.isSeller,
    productController.getOutOfStockProducts
);
router.post("/delete/:id",
    passport.authenticate("token", {
        session: false
    }),
    auth.isSeller,
    productController.deleteProduct
);
router.post("/update-status/:id/:status",
    passport.authenticate("token", {
        session: false
    }),
    auth.isSeller,
    productController.updateProductStatus
);
router.post("/update/:id",
    passport.authenticate("token", {
        session: false
    }),
    auth.isSeller,
    productController.updateProduct
);
router.get("/upload-xls",
    passport.authenticate("token", {
        session: false
    }),
    auth.isSeller,
    function (req, res, next) {
      Settings.findOne({}, function(err, result) {
        if(err) return next(err);
        req.site_configuration = result;
        next();
      });
    },
    productController.uploadProductXL
);
module.exports = router;
