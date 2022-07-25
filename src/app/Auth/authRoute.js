var express = require('express');
var router = express.Router();
const authController = require('./authController.js');
const {wrapAsync} = require('../../../common/index');
const {authenticate} =  require("../../../passport/index");

router.get('/jwttest',authenticate,wrapAsync(authController.jwttest));
router.post('/signin', wrapAsync(authController.signin));

module.exports = router;
