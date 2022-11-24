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

    // 로그인 (OAuth 로그인은 클라이언트에서 호출 안함)
    app.post('/auth/signIn/local', authController.localSignIn);
    app.get('/auth/signIn/kakao', authController.kakaoSignIn);
    
    // OAuth 추가정보 등록
    app.post('/auth/oauth/addInfo', authenticate, authController.addInfo);
    
    // accessToken 재발급
    app.get('/auth/refresh', authController.getRefreshToken);

    // TODO: 로그아웃
    app.post('/auth/common/logout', authController.logout);

    // 회원탈퇴
    app.post('/auth/signout', authenticate, authController.signout);
}