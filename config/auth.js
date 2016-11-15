var passport = require("passport");
var TokenStrategy = require("passport-token-auth");
var User = require(ROOT_FOLDER+"/models/users");
passport.use(new TokenStrategy(
  function(token, done) {
    User.findOne({ token: token }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      return done(null, user, { scope: 'all' });
    });
  }
));
