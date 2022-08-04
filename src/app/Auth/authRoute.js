var express = require('express');
var router = express.Router();
const authController = require('./authController.js');
const {authenticate} = require("../../middleware/auth");

router.get('/jwttest', authenticate, authController.jwttest);
router.post('/common/refresh', authController.refresh);
router.post('/common/logout', authController.signout);
router.post('/signin', authController.signin);

module.exports = router;
