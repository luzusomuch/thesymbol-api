var User = require(ROOT_FOLDER + "/models/users");
exports.Auth = function(req, res, next) {
    User.loginAsAdmin(req.body, function(err, user) {
      if(!err) {
        user.updateToken(function(err, result) {
          if(err) return next(err);
          user.token = result;
          return res._response(user);
        });
      }
      else {
        return next(err);
      }
    });
}
exports.sampleInsert = function(req, res, next) {
    var rand = Math.floor(Math.random());
    new User({
            name: "example" + rand,
            email: "example" + rand + "@email.com",
            roles: ["admin", "user"],
            password: 123456
        })
        .save(function() {
            console.log("asdhjsda");
            res.json({});
        });
}
