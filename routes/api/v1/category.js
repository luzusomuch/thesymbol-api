var express = require("express");
var passport = require("passport");
var router = express.Router();
var categoryController = require(ROOT_FOLDER + "/controllers/api/v1/category");
var catUController = require(ROOT_FOLDER + "/controllers/api/v1/user/category");
var auth = require(ROOT_FOLDER + "/middlewares/authentication");
router.get("/", function(req, res) {
    passport.authenticate("token", {
            session: false
        }),
        categoryController.getCategories
})
router.post("/",
    passport.authenticate("token", {
        session: false
    }),
    auth.isAdmin,
    categoryController.addCategory
);
router.delete("/:id",
    passport.authenticate("token", {
        session: false
    }),
    auth.isAdmin,
    categoryController.remove
);
router.post("/add-category",
    passport.authenticate("token", {
        session: false
    }),
    auth.isAdmin,
    categoryController.addCategory
);
router.get("/get-categories",
    passport.authenticate("token", {
        session: false
    }),
    auth.isAdmin,
    categoryController.getCategories
);
router.get("/get-approved-categories", catUController.getCategories);
router.get("/get-non-approved-categories",
    passport.authenticate("token", {
        session: false
    }),
    auth.isAdmin,
    categoryController.getNonApprovedCategories
);
router.get("/get-single-category/:id", categoryController.getSingleCategory);
router.put("/update-category-status/:id/:status",
    passport.authenticate("token", {
        session: false
    }),
    auth.isAdmin,
    categoryController.updateCategoryStatus
);
router.put("/update-category/:id",
    passport.authenticate("token", {
        session: false
    }),
    auth.isAdmin,
    categoryController.updateCategory
);
module.exports = router;
