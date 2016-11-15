var Country = require(ROOT_FOLDER + "/models/country");

exports.query = function(req, res, next) {
    var limit = req.query.limit ? parseInt(req.query.limit) : 0;
    var skip = req.query.skip ? parseInt(req.query.skip) * limit : 0;
    delete req.query.limit;
    delete req.query.skip;
    Country
        .find(req.query)
        .limit(limit)
        .skip(skip)
        .exec(function(err, result) {
            if (err) return next(err);
            else return res._response(result);
        });
}
