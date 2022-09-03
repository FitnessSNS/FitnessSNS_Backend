var express = require('express');
var router = express.Router();
const authController = require('./authController.js');
const {authenticate} = require("../../middleware/auth");

router.get('/dbtest', authController.dbtest);
router.get('/jwttest', authenticate, authController.jwttest);
router.get('/addinfotest', authController.add_info);

//jwt routes
router.post('/common/refresh', authController.refresh);

//oauth routes
router.post('/oauth/addinfo', authController.add_account_details)

//sign in routes
router.post('/signin', authController.signin);
router.get('/kakao/authorize',authController.kakao_authorize);
router.get('/kakao/signin', authController.kakao_signin);

//sign up routes
router.post('/signup/evstart', authController.emailVerifyStart);
router.post('/signup/evend', authController.emailVerifyEnd)
router.post('/signup/nv', authController.nicknameVerify);
router.post('/signup', authController.signup);

//log out routes
router.post('/common/logout', authController.logout);

//sign out routes
router.post('/signout', authenticate, authController.signout);

module.exports = router;
