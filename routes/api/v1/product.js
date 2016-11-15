var express = require("express");
var passport = require("passport");
var router = express.Router();
var productController = require(ROOT_FOLDER + "/controllers/api/v1/product");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
var validate = require('express-validation');
var product_add = require(ROOT_FOLDER+'/validations/product_add.js');
router.get("/", function(req, res) {
    res._response({
        name: "sadhjasdj"
    });
});
router.post("/add-product",
    passport.authenticate("token", {
        session: false
    }),
    auth.isProductAddUser,
    validate(product_add),
    productController.addProduct
);
router.get("/get-out-of-stock-product",
    passport.authenticate("token", {
        session: false
    }),
    auth.isProductAddUser,
    productController.getOutOfStockProduct
);
router.get("/get-products",
    passport.authenticate("token", {
        session: false
    }),
    auth.isProductAddUser,
    productController.getProducts
);
router.get("/get-approved-products",
    passport.authenticate("token", {
        session: false
    }),
    auth.isProductAddUser,
    productController.getApprovedProducts
);
router.get("/get-non-approved-products",
    passport.authenticate("token", {
        session: false
    }),
    auth.isProductAddUser,
    productController.getNonApprovedProducts
);
router.get("/get-single-product/:id",
    passport.authenticate("token", {
        session: false
    }),
    auth.isProductAddUser,
    productController.getSingleProduct
);
router.put("/update-product-status/:id/:status",
    passport.authenticate("token", {
        session: false
    }),
    auth.isAdmin,
    productController.updateProductStatus
);
router.put("/update-product/:id",
    passport.authenticate("token", {
        session: false
    }),
    auth.isProductAddUser,
    productController.updateProduct
);
router.post("/isexist", productController.isExistSKU);
router.put("/delete-product/:id",
    passport.authenticate("token", {
        session: false
    }),
    auth.isProductAddUser,
    productController.deleteProduct
);
router.get("/features",
    productController.getFeatureProducts
);
module.exports = router;
