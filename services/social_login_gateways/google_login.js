var request = require('request');
const google_fields = {
    "id": "sub",
    "name": "name",
    "first_name": "given_name",
    "last_name": "family_name",
    "email": "email",
    "gender": "gender"
};
const url = "https://www.googleapis.com/oauth2/v3/userinfo"
exports.getUser = function(token, fields, cb) {
    var fields = Array.isArray(fields) ? getFields(fields).join(",") : fields;
    request(url + '?access_token=' + token + '&fields=' + fields, function(err, repsonse, body) {
        if (err) return cb(err);
        var user = JSON.parse(body);
        if (user.error) return cb(new Error("Invalid Token."));
        return cb(null, {
            "id": user.sub,
            "name": user.name,
            "first_name": user.given_name,
            "last_name": user.family_name,
            "email": user.email,
            "gender": user.gender
        });
    });
};
getFields = function(fields) {
    return fields.map(function(a) {
        return google_fields[a];
    });
}
