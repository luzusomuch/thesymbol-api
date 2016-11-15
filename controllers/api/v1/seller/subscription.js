var User = require(ROOT_FOLDER + "/models/users");
var Sphistory = require(ROOT_FOLDER + "/models/subscription_purchase_history");
var Subscription = require(ROOT_FOLDER + "/models/subscription");
var moment = require("moment");
var async = require("async");
exports.getMyPlan = function(req, res, next) {
    Sphistory
        .aggregate()
        .match({
            user: req.user._id,
            status: true,
        })
        .lookup({
            from: "subscriptions",
            localField: "plan",
            foreignField: "_id",
            as: "plan"
        })
        .project({
            "_id": 1,
            "updated_at": 1,
            "created_at": 1,
            "plan": {
                $arrayElemAt: ["$plan", 0]
            },
            "bought_amount": 1,
            "expiry_date": {
                $dateToString: {
                    format: "%Y-%m-%d %H:%M:%S",
                    date: "$expiry"
                }
            },
            "still_more_days": {
                "$ceil": {
                    "$divide": [{
                            "$subtract": ["$expiry", new Date()]
                        },
                        1000 * 60 * 60 * 24
                    ]
                }
            },
            "status": 1
        })
        .exec(function(err, result) {
            if (err) return next(err);
            return res._response(result);
        });
}
exports.subscribe = function(req, res, next) {
    async.waterfall([
        function(cb) { //check token is valid
            Sphistory.findOne({
                payment_id: req.body.payment_id
            }, function(err, result) {
                if (err) return cb(err);
                else if (result != null) return cb(new Error("Payment ID already exists."))
                else return cb(null);
            })
        },
        function(cb) { //get subscription plan
            Subscription.findOne({
                _id: req.body.plan
            }, cb);
        },
        function(plan, cb) { //make history of purchase
            if (plan == null) return cb(new Error("Invalid Plan."));
            var history = req.body;
            history["user"] = req.user._id;
            history["expiry"] = moment().add(plan.numbers, plan.type);
            new Sphistory(history).save(cb);
        },
        function(saved, no, cb) { //deactivate all plan. Except current plan
            Sphistory.update({
                user: req.user._id,
                plan: {
                    $ne: saved._id
                }
            }, {
                status: false
            }, {
                upsert: true
            }, function(err, resp) {
                return cb(err, saved);
            });
        },
        function(saved, cb) {
            User.update({
                _id: req.user._id
            }, {
                $addToSet: {
                    subscription_plans: saved._id
                }
            }, {
                upsert: true
            }, function(err, user) {
                return cb(err, saved)
            })
        }
    ], function(err, result) {
        if (err) return next(err);
        return res._response(result);
    });
}
