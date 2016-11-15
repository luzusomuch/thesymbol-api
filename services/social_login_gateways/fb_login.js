var graph = require('fbgraph');
exports.getUser = function(token, fields, cb) {
    graph.setAccessToken(token);
    var fields = Array.isArray(fields) ? fields.join(",") : fields;
    graph.get('me?fields='+fields, cb);
}
