var User = require(ROOT_FOLDER + "/models/users");
exports.isProductAddUser = function(req, res, next) {
  console.log(req.user.roles)
    if (req.user.roles.indexOf("admin") !== -1) {
        req.user.Admin = true;
        req.user.Seller = false;
        next();
    } else if (req.user.roles.indexOf("seller") !== -1) {
        req.user.Seller = true;
        req.user.Admin = false;
        next();
    } else {
        var err = new Error("Unauthorized");
        next(err);
    }
};
exports.partialAuthenticate = function(req, res, next) {
    var token = req.headers["authorization"];
    if (!token) return next();
    return User.findOne({
            token: token,
            is_deleted: false
        })
        .exec(function(err, result) {
            if (err) return next(err);
            if (result === null) {
                return next(new Error("Unauthorized"));
            }
            req.user = result;
            return next();
        });
}
exports.isSeller = function(req, res, next) {
    if (req.user.roles.indexOf("seller") !== -1)
        return next();
    var err = new Error("Unauthorized");
    next(err);
}
exports.isAdmin = function(req, res, next) {
    if (req.user.roles.indexOf("admin") !== -1)
        return next();
    var err = new Error("Unauthorized");
    next(err);
}
