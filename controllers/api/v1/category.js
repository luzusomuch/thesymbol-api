var User = require(ROOT_FOLDER + "/models/users");
var Category = require(ROOT_FOLDER + "/models/category");
var assert = require("assert");
var self = exports;
addCategory = function(req, res, next) {
    req.body.created_by = req.user._id;
    var parent_id = req.body.parent_id || req.body.parent;
    new Category(req.body)
        .save(function(err, result) {
            if (err) return next(err);
            if (!parent_id) return res._response(result);
            pushToParent(parent_id, result._id, function(err, data) {
                if (err) return next(err);
                return res._response(data);
            });
        });
}
pushToParent = function(parent_id, id, cb) {
    Category.update({
        _id: parent_id
    }, {
        $addToSet: {
            children: id
        }
    }, cb)
}
getCategories = function(req, res, next) {
    var where = {};
    where = req.user.Admin ? {} : {
        created_by: req.user._id
    };
    where["is_deleted"] = false;
    Category
        .find(where)
        .populate("parent_id")
        .exec(function(err, result) {
            if (!err) return res._response({
                categories: result
            }, "success", 200, "Fetched Successfully");
            return next(err);
        });
}
getApprovedCategories = function(req, res, next) {
    var where = {};
    where["status"] = 1;
    where["is_deleted"] = false;
    if (req.query.parent_id) where["parent_id"] = req.query.parent_id;
    Category
        .find(where)
        .populate("parent_id")
        .exec(function(err, result) {
            if (!err) return res._response({
                categories: result
            }, "success", 200, "Fetched Successfully");
            return next(err);
        });
}
getSingleCategory = function(req, res, next) {
    var where = {};
    where._id = req.params.id;
    where["is_deleted"] = false;
    Category
        .findOne(where)
        .populate("parent_id")
        .populate("image")
        .populate("icon")
        .exec(function(err, result) {
            if (!err) return res._response({
                category: result
            }, "success", 200, "Fetched Successfully");
            return next(err);
        });
}
getNonApprovedCategories = function(req, res, next) {
    var where = {};
    where = req.user.Admin ? {} : {
        created_by: req.user._id
    };
    where.status = 0;
    where["is_deleted"] = false;
    Category
        .find(where)
        .populate("parent_id")
        .exec(function(err, result) {
            if (!err) return res._response({
                categories: result
            }, "success", 200, "Fetched Successfully");
            return next(err);
        });
}
updateCategoryStatus = function(req, res, next) {
    var where = {},
        data = {};
    where._id = req.params.id;
    data.status = req.params.status;
    where["is_deleted"] = false;
    Category.update(where, data).exec(function(err, result) {
        if (!err) return res._response({
            categories: result
        }, "success", 200, "Updated Successfully");
        return next(err);
    });
}
updateCategory = function(req, res, next) {
    var where = {},
        data = req.body;
    var parent_id = req.body.parent_id = req.body.parent_id == ""? null: req.body.parent_id;
    where._id = req.params.id;
    Category.update(where, data).exec(function(err, result) {
        if (err) return next(err);
        if (!parent_id) return res._response(result);
        pushToParent(parent_id, req.params.id, function(err, data) {
            if (err) return next(err);
            return res._response(result);
        });
    });
}
remove = function(req, res, next) {
    Category.update({
        _id: req.params.id
    }, {
        is_deleted: true
    }, function(err, result) {
        if (!err) return res._response({
            categories: result
        }, "success", 200, "Removed Successfully");
        return next(err);
    });
}
module.exports = {
    addCategory: addCategory,
    pushToParent: pushToParent,
    getCategories: getCategories,
    getApprovedCategories: getApprovedCategories,
    getSingleCategory: getSingleCategory,
    getNonApprovedCategories: getNonApprovedCategories,
    updateCategoryStatus: updateCategoryStatus,
    remove: remove,
    updateCategory: updateCategory
}
