var express = require('express');
var router = express.Router();
const authController = require('./authController.js');
const {wrapAsync} = require('../../../common/index');
const {authenticate} = require("../../middleware/auth");

router.get('/jwttest',wrapAsync(authenticate),wrapAsync(authController.jwttest));
router.post('/signin', wrapAsync(authController.signin));
router.post('/logout', wrapAsync(authController.signout));

module.exports = router;
