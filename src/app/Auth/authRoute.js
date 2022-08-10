var express = require('express');
var router = express.Router();
const authController = require('./authController.js');
const {authenticate} = require("../../middleware/auth");

router.get('/dbtest', authController.dbtest);
router.get('/jwttest', authenticate, authController.jwttest);

//jwt routes
router.post('/common/refresh', authController.refresh);

//sign in routes
router.post('/signin', authController.signin);
router.get('/kakao/authorize',authController.kakao_authorize);
router.get('/kakao/signin', authController.kakao_signin);

//sign up routes
router.post('/evstart', authController.emailVerifyStart);
router.post('/signup');

//log out routes
router.post('/common/logout', authController.logout);

module.exports = router;
