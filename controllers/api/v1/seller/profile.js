var User = require(ROOT_FOLDER + "/models/users");
var Address = require(ROOT_FOLDER + "/models/address");
var _c_help = require(ROOT_FOLDER + "/helpers/common");
var async = require("async");

exports.getProfile = function(req, res, next) {
    User
        .findById(req.user._id)
        .populate("image", "url -_id")
        .populate("address")
        .populate("logo", "url cdn -_id")
        .populate("banner", "url cdn -_id")
        .populate("govt_issue_card", "url cdn -_id")
        .exec(function(err, result) {
            if (err) return next(err);
            res._response(result);
        });
}
exports.updateProfile = function(req, res, next) {
    var seller = {};
    var address1 = req.body.address;
    delete req.body.address;
    seller = req.body;
    address = {};
    if(req.body.pincode) {
      address["pincode"] = req.body.pincode;
      delete req.body.pincode;
    }
    if(address1) {
      address["address"] = address1;
    }
    if(req.body.phone) {
      address["phone"] = req.body.phone;
      delete req.body.phone;
    }
    if(req.body.city) {
      address["city"] = req.body.city;
      delete req.body.city;
    }
    if(req.body.state) {
      address["state"] = req.body.state;
      delete req.body.state;
    }
    if(req.body.country) {
      address["country"] = req.body.country;
      delete req.body.country;
    }
    if(req.body.locality) {
      address["locality"] = req.body.locality;
      delete req.body.locality;
    }
    seller.updated_at = new Date();
    delete seller.pincode;
    delete seller.city;
    delete seller.state;
    delete seller.country;
    delete seller.locality;
    seller.password = _c_help.getHash(seller.password);
    User.findAndModify({
        _id: req.user._id
    }, [], {
        $set: seller
    }, {}, function(err, user) {
        if (err) return next(err);
        Address.update({
            _id: user.value.address[0]
        }, address, {
            upsert: true
        }, function(err, user) {
            if (err) return next(err);
            return res._response(user, "success", 200, "user successfully updated");
        })
    });
}
exports.updateSettings = function(req, res, next) {

}
