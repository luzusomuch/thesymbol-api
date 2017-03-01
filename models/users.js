var mongoose = require("mongoose");
var randomChar = require("node-random-chars");
var bcrypt = require("bcrypt");
var _h_common = require(ROOT_FOLDER + "/helpers/common");
var Schema = mongoose.Schema;
var tableSchema = new Schema({
    name: {
        type: String
    },
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    gender: {
        type: String
    },
    email: {
        type: String,
        unique: [true, "Email is already exists"]
    },
    roles: [{
        type: String
    }],
    password: String,
    subscription_plans: [{
        type: Schema.Types.ObjectId,
        ref: 'Subscription_purchase_history'
    }],
    token: String,
    token_expiry: Date,
    address: [{
        type: Schema.Types.ObjectId,
        ref: 'Address'
    }],
    social_logins: {
        fb_id: {
            type: String,
        },
        google_id: {
            type: String,
        }
    },
    shipping: {
        type: Schema.Types.ObjectId,
        ref: 'Address'
    },
    billing: {
        type: Schema.Types.ObjectId,
        ref: 'Address'
    },
    image: {
        type: Schema.Types.ObjectId,
        ref: 'Image'
    },
    logo: {
        type: Schema.Types.ObjectId,
        ref: 'Image'
    },
    banner: {
        type: Schema.Types.ObjectId,
        ref: 'Image'
    },
    phone: String,
    verified: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: true
    },
    created_at: Date,
    govt_issue_card: {
        type: Schema.Types.ObjectId,
        ref: 'Image'
    },
    business_registration: String,
    updated_at: Date,
    is_deleted: {
        type: Boolean,
        default: false
    },
    blocked_reason: String
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

tableSchema.statics.loginAsAdmin = function(body, cb) {
    return this.findOne({
            email: body.email,
            roles: "admin"
        })
        .exec(function(err, user) {
            if (!user)
                return cb({
                    message: "Invalid Mail",
                    statusCode: 401
                });
            var validUser = user.checkPassword(body.password);
            if (validUser) {
                if (user.status == false) {
                    return cb({
                        message: "You have been banned. Please contact admin.",
                        statusCode: 401
                    });
                }
                delete user.password;
                return cb(null, user);
            }
            return cb({
                message: "Invalid Password",
                statusCode: 401
            });
        });
};
tableSchema.statics.loginAsUser = function(email, password, cb) {
    return this.findOne({
            email: email,
            roles: "user"
        })
        .exec(function(err, user) {
            if (!user)
                return cb({
                    message: "Your Email ID is not registered",
                    statusCode: 401
                });

            var validUser = user.checkPassword(password);
            if (validUser) {
                if (user.verified == false) {
                    return cb({
                        message: "Your Email ID is not confirmed yet. Please login to your mail to confirm",
                        statusCode: 401
                    });
                }
                delete user.password;
                return cb(null, user);
            }
            return cb({
                message: "Your Email ID and Password doesn't match",
                statusCode: 401
            });
        });
};
tableSchema.statics.loginAsSeller = function(email, password, cb) {
    return this.findOne({
            email: email,
            roles: "seller"
        })
        .exec(function(err, user) {
            if (!user)
                return cb({
                    message: "Invalid Mail",
                    statusCode: ""
                });
            var validUser = user.checkPassword(password);
            if (validUser) {
                delete user.password;
                return cb(null, user);
            }
            return cb({
                message: "Invalid Password",
                statusCode: ""
            });
        });
};
tableSchema.statics.findAndModify = function(query, sort, doc, options, callback) {
    return this.collection.findAndModify(query, sort, doc, options, callback);
};
tableSchema.methods.checkPassword = function checkPassword(password) {
    return bcrypt.compareSync(password, this.password);
};
tableSchema.methods.encryptPassword = function encryptPassword(password) {
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};
tableSchema.methods.updateToken = function updateToken(cb) {
    var token = this.token = randomChar.create(32);
    this.save(function(err, updated) {
        cb(err, token);
    });
};
module.exports = DB_CONNECTION.model("User", tableSchema);
