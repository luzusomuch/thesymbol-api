var express = require('express');
var router = express.Router();
var nconf = require('nconf')
router.get('/', function(req, res, next) {
  res.json(nconf.get("custom"));
});
module.exports = router;
