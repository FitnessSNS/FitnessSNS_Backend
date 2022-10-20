const authController = require('./authController.js');
const {authenticate} = require("../../middleware/auth");

module.exports = (app) => {
    // 회원가입
    app.post('/auth/signup/evstart', authController.emailVerifyStart);
    app.post('/auth/signup/evend', authController.emailVerifyEnd)
    app.post('/auth/signup/nv', authController.nicknameVerify);
    app.post('/auth/signup', authController.signup);

    // OAuth
    app.post('/auth/oauth/addinfo', authController.add_account_details)

    // 로그인
    app.post('/auth/signIn', authController.postSignIn);
    app.get('/auth/kakao/authorize',authController.kakao_authorize);
    app.get('/auth/kakao/signin', authController.kakao_signin);

    // JWT 재발급
    app.get('/auth/common/refresh', authController.getRefreshToken);

    // 로그아웃
    app.post('/auth/common/logout', authController.logout);

    // 회원탈퇴
    app.post('/auth/signout', authenticate, authController.signout);
}