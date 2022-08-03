var express = require('express');
var router = express.Router();
const authController = require('./authController.js');
const {authenticate} = require("../../middleware/auth");

router.get('/jwttest', authenticate, authController.jwttest);
router.post('/signin', authController.signin);
router.post('/logout', authController.signout);

module.exports = router;
