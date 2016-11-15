
exports.sellerConfiguration = function(req, res, next) {
    res._response({
      units: ["kg", "g", "ltr"],
      ships_in: [1,2,3,4,5],
      service_tax: 5,
      commission: 15
    });
}
