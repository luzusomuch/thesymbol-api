var User = require(ROOT_FOLDER + "/models/users");
var Category = require(ROOT_FOLDER + "/models/category");
exports.getCategories = function(req, res, next) {
    var where = {};
    where.status = true;
    where["is_deleted"] = false;
    if (req.query.parent_id) {
        where._id = req.query.parent_id;
    }
    else {
      where.parent_id = null;
    }
    Category.find(where)
        .select("name children description image icon")
        .populate([
          {
              path: "image",
              select: "url cdn _id"
          }, {
            path: "children",
            select: "name image icon description",
            populate: [
              {
                  path: "image",
                  select: "url cdn _id"
              },
              {
                  path: "icon",
                  select: "url cdn _id"
              }
            ]
          },
          {
              path: "icon",
              select: "url cdn _id"
          }
        ])
        .exec(function(err, docs) {
            if (!err) return res._response({
                categories: docs
            }, "success", 200, "Fetched Successfully");
            return next(err);
        });
}
