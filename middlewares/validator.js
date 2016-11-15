exports.socialLogin = function(req, res, next) {
  if(!req.body.access_token) return next(new Error("No token found."))
  else if(!req.body.gateway) return next(new Error("No gateway found."))
  next();
}
