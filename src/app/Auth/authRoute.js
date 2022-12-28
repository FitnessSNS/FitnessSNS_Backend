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
    
    // OAuth 인가코드 (카카오)
    app.get('/auth/oauth/authorization',authController.authURI);
    
    // 로컬계정 로그인
    app.post('/auth/signIn/local', authController.localSignIn);
    
    // OAuth 로그인
    app.get('/auth/signIn/kakao', authController.kakaoSignIn);
    
    // OAuth 추가정보 등록
    app.post('/auth/oauth/addInfo', authenticate, authController.addInfo);

    // accessToken 재발급
    app.get('/auth/refresh', authController.getRefreshToken);

    // 로그아웃
    app.get('/auth/logout', authenticate, authController.logout);
    
    // 비밀번호 찾기 이메일 인증
    app.post('/auth/userInfo/emailVerification', authController.userInfoEmailVerifyStart);
    
    // 비밀번호 찾기 이메일 인증 완료
    app.post('/auth/userInfo/emailVerification/code', authController.userInfoEmailVerifyEnd)
}