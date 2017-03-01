var User = require(ROOT_FOLDER + "/models/users");
var _s_mail = require(ROOT_FOLDER + "/services/mail");
exports.query = function(req, res, next) {
    var where = {};
    where["is_deleted"] = false;
    User.
    aggregate().
    match(where).
    unwind("subscription_plans").
    lookup({
        from: "subscription_purchase_histories",
        localField: "subscription_plans",
        foreignField: "_id",
        as: "subscription_plans"
    }).
    group({
        _id: "$_id",
        name: {
            $first: "$name"
        },
        last_name: {
            $first: "$last_name"
        },
        first_name: {
            $first: "$first_name"
        },
        gender: {
            $first: "$gender"
        },
        email: {
            $first: "$email"
        },
        verified: {
            $first: "$verified"
        },
        roles: {
            $first: "$roles"
        },
        status: {
            $first: "$status"
        },
        subscription_plans: {
            $push: {
                $arrayElemAt: ["$subscription_plans", 0]
            }
        }
    }).
    project({
        _id: "$_id",
        name: 1,
        last_name: 1,
        first_name: 1,
        gender: 1,
        email: 1,
        verified: 1,
        roles: 1,
        status: 1,
        subscription_plans: 1,
        active_plan: {
            $arrayElemAt: [{
                $filter: {
                    input: "$subscription_plans",
                    as: "plan",
                    cond: {
                        $eq: ["$$plan.status", true]
                    }
                }
            }, 0]
        },
        is_plan_expired: {
            $let: {
                vars: {
                    active_plan: {
                        $arrayElemAt: [{
                            $filter: {
                                input: "$subscription_plans",
                                as: "plan",
                                cond: {
                                    $eq: ["$$plan.status", true]
                                }
                            }
                        }, 0]
                    }
                },
                in: {
                    $cond: [{
                            $gte: ["$$active_plan.expiry", new Date().toISOString()]
                        },
                        "not expired",
                        "expired"
                    ]
                }
            }

        }
    }).
    lookup({
        from: "subscriptions",
        localField: "active_plan.plan",
        foreignField: "_id",
        as: "active_plan.plan"
    }).
    exec(function(err, result) {
        if (err) return next(err);
        return res._response({
            users: result
        });
    });

    // find(where, function(err, result) {
    //     if (err) return next(err);
    //     return res._response({
    //         users: result
    //     });
    // });
}
exports.fetch = function(req, res, next) {
    var where = {};
    where["is_deleted"] = false;
    where["_id"] = require("mongoose").Types.ObjectId(req.params.id);
    User.findOne(where)
        .populate("image", "url _id")
        .populate("banner", "url _id")
        .populate("logo", "url _id")
        .exec(function(err, result) {
            if (err) return next(err);
            return res._response({
                user: result
            });
        });
}
exports.create = function(req, res, next) {
    new User(req.body).save(function(err, result) {
        if (err) return next(err);
        return res._response({
            user: result
        });
    });
}
exports.update = function(req, res, next) {
    var where = {};
    where["is_deleted"] = false;
    where["_id"] = req.params.id;
    User.update(where, req.body, function(err, result) {
        if (err) return next(err);
        if (req.body.status != undefined)
            _s_mail.sendStatusUpdateMail(req.params.id, req.body.status);
        return res._response(result);
    });
}
exports.changePassword = function(req, res, next) {
    var where = {};
    where["is_deleted"] = false;
    where["_id"] = req.user._id;
    User.findOne(where, function(err, user) {
        if (err) return next(err);
        else if (user == null) return next(Error("User not Found"));
        else if (!user.checkPassword(req.body.opassword)) return next(Error("Password is not valid"));
        else if (req.body.npassword != req.body.cpassword) return next(Error("Confirm password is not valid"));
        else {
            user.password = user.encryptPassword(req.body.npassword);
            user.save(function(err, result) {
                if (err) return next(err);
                return res._response(result);
            })
        }
    });
}
exports.remove = function(req, res, next) {
    var where = {};
    where["_id"] = req.params.id;
    User.update(where, {
        "is_deleted": true
    }, function(err, result) {
        if (err) return next(err);
        return res._response(result);
    });
}
