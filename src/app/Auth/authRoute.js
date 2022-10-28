const authController = require('./authController.js');
const {signUpAuth, authenticate} = require("../../middleware/auth");

module.exports = (app) => {
    // 로컬 회원가입 이메일 인증
    app.post('/auth/signUp/emailVerification', authController.emailVerifyStart);
    
    // 로컬 회원가입 이메일 인증 완료
    app.post('/auth/signUp/emailVerification/code', authController.emailVerifyEnd)
    
    // 닉네임 중복검사
    app.post('/auth/signUp/nickname', authController.nicknameCheck);
    
    // 로컬계정 회원가입
    app.post('/auth/signUp', signUpAuth, authController.signUp);

   
    // OAuth
    app.post('/auth/oauth/addinfo', authController.add_account_details)

    // 로그인
    app.post('/auth/local/signIn', authController.postSignIn);
    app.get('/auth/kakao/authorize',authController.kakao_authorize);
    app.get('/auth/kakao/signIn', authController.kakao_signin);

    // JWT 재발급
    app.get('/auth/common/refresh', authController.getRefreshToken);

    // 로그아웃
    app.post('/auth/common/logout', authController.logout);

    // 회원탈퇴
    app.post('/auth/signout', authenticate, authController.signout);
}