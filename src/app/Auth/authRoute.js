const authController = require('./authController.js');
const {signUpAuth, authenticate} = require("../../middleware/auth");

module.exports = (app) => {
    /**
     * @swagger
     * paths :
     *   /auth/signUp/emailVerification:
     *     post:
     *       summary: 로컬계정 회원가입 이메일 인증
     *       tags:
     *         - auth
     *       requestBody:
     *         content:
     *           'application/json':
     *             schema:
     *               type: object
     *               properties:
     *                 email:
     *                   description: 회원가입용 이메일 주소
     *                   type: string
     *       responses:
     *         '200':
     *           description: OK
     */
    // 로컬 회원가입 이메일 인증
    app.post('/auth/signUp/emailVerification', authController.emailVerifyStart);
    
    /**
     * @swagger
     * paths :
     *   /auth/signUp/emailVerification/code:
     *     post:
     *       summary: 로컬계정 회원가입 이메일 인증 완료
     *       tags:
     *         - auth
     *       requestBody:
     *         content:
     *           'application/json':
     *             schema:
     *               type: object
     *               properties:
     *                 email:
     *                   description: 회원가입용 이메일 주소
     *                   type: string
     *                 code:
     *                   description: 이메일 인증코드
     *                   type: string
     *       responses:
     *         '200':
     *           description: OK
     */
    // 로컬 회원가입 이메일 인증 완료
    app.post('/auth/signUp/emailVerification/code', authController.emailVerifyEnd)
    
    /**
     * @swagger
     * paths :
     *   /auth/signUp/nickname:
     *     post:
     *       summary: 닉네임 중복 검사
     *       tags:
     *         - auth
     *       requestBody:
     *         content:
     *           'application/json':
     *             schema:
     *               type: object
     *               properties:
     *                 nickname:
     *                   description: 중복 검사용 닉네임
     *                   type: string
     *       responses:
     *         '200':
     *           description: OK
     */
    // 닉네임 중복검사
    app.post('/auth/signUp/nickname', authController.nicknameCheck);
    
    /**
     * @swagger
     * paths :
     *   /auth/signUp:
     *     post:
     *       summary: 로컬계정 회원가입
     *       tags:
     *         - auth
     *       requestBody:
     *         content:
     *           'application/json':
     *             schema:
     *               type: object
     *               properties:
     *                 email:
     *                   description: 회원가입 이메일 주소
     *                   type: string
     *                 nickname:
     *                   description: 회원가입 닉네임
     *                   type: string
     *                 password:
     *                   description: 회원가입 패스워드
     *                   type: string
     *       responses:
     *         '200':
     *           description: OK
     */
    // 로컬계정 회원가입
    app.post('/auth/signUp', signUpAuth, authController.signUp);
    
    /**
     * @swagger
     * paths :
     *   /auth/oauth/authorization:
     *     get:
     *       summary: OAuth 인가코드 요청
     *       tags:
     *         - auth
     *       parameters:
     *         - name: provider
     *           in: query
     *           description: 플랫폼 공급자
     *           required: true
     *           type: string
     *       responses:
     *         '200':
     *           description: OK
     */
    // OAuth 인가코드 (카카오)
    app.get('/auth/oauth/authorization',authController.authURI);
    
    /**
     * @swagger
     * paths :
     *   /auth/signIn/local:
     *     post:
     *       summary: 로컬계정 로그인
     *       tags:
     *         - auth
     *       requestBody:
     *         content:
     *           'application/json':
     *             schema:
     *               type: object
     *               properties:
     *                 email:
     *                   description: 로그인 이메일
     *                   type: string
     *                 password:
     *                   description: 로그인 패스워드
     *                   type: string
     *               example:
     *                 email: 'bbaekddo100@naver.com'
     *                 password: 'TestPass1!'
     *       responses:
     *         '200':
     *           description: OK
     *           headers:
     *             Set-Cookie:
     *               schema:
     *                 type: string
     *                 example: refreshToken=testTEST; Path=/auth; HttpOnly
     */
    // 로그인 (OAuth 로그인은 클라이언트에서 호출 안함)
    app.post('/auth/signIn/local', authController.localSignIn);
    app.get('/auth/signIn/kakao', authController.kakaoSignIn);
    
    /**
     * @swagger
     * paths :
     *   /auth/oauth/addInfo:
     *     post:
     *       summary: OAuth 추가정보 등록
     *       tags:
     *         - auth
     *       parameters:
     *          - name: x-access-token
     *            in: header
     *            description: 사용자 액세스 토큰
     *            required: true
     *            type : string
     *       requestBody:
     *         content:
     *           'application/json':
     *             schema:
     *               type: object
     *               properties:
     *                 nickname:
     *                   description: 회원가입 닉네임
     *                   type: string
     *       responses:
     *         '200':
     *           description: OK
     */
    // OAuth 추가정보 등록
    app.post('/auth/oauth/addInfo', authenticate, authController.addInfo);
    
    /**
     * @swagger
     * paths :
     *   /auth/refresh:
     *     get:
     *       summary: 사용자 액세스 토큰 재발급
     *       tags:
     *         - auth
     *       parameters:
     *         - name: refreshToken
     *           in: cookie
     *           description: 재발급 토큰
     *           required: true
     *           type: string
     *       responses:
     *         '200':
     *           description: OK
     */
    // accessToken 재발급
    app.get('/auth/refresh', authController.getRefreshToken);

    /**
     * @swagger
     * paths :
     *   /auth/logout:
     *     get:
     *       summary: 로그아웃
     *       tags:
     *         - auth
     *       parameters:
     *         - name: x-access-token
     *           in: header
     *           description: 사용자 액세스 토큰
     *           required: true
     *           type : string
     *       responses:
     *         '200':
     *           description: OK
     */
    app.get('/auth/logout', authenticate, authController.logout);
    
    /**
     * @swagger
     * paths :
     *   /auth/userInfo/emailVerification:
     *     post:
     *       summary: 비밀번호 찾기 이메일 인증
     *       tags:
     *         - auth
     *       requestBody:
     *         content:
     *           'application/json':
     *             schema:
     *               type: object
     *               properties:
     *                 email:
     *                   description: 인증코드 받을 이메일 주소
     *                   type: string
     *               example:
     *                 email: 'bbaekddo100@naver.com'
     *       responses:
     *         '200':
     *           description: OK
     */
    // 비밀번호 찾기 이메일 인증
    app.post('/auth/userInfo/emailVerification', authController.userInfoEmailVerifyStart);
    
    /**
     * @swagger
     * paths :
     *   /auth/userInfo/emailVerification/code:
     *     post:
     *       summary: 비밀번호 찾기 이메일 인증 완료
     *       tags:
     *         - auth
     *       requestBody:
     *         content:
     *           'application/json':
     *             schema:
     *               type: object
     *               properties:
     *                 email:
     *                   description: 인증코드 받은 이메일 주소
     *                   type: string
     *                 code:
     *                   description: 이메일 인증코드
     *                   type: string
     *               example:
     *                 email: 'bbaekddo100@naver.com'
     *                 code: code
     *       responses:
     *         '200':
     *           description: OK
     */
    // 비밀번호 찾기 이메일 인증 완료
    app.post('/auth/userInfo/emailVerification/code', authController.userInfoEmailVerifyEnd)
    
    // 회원탈퇴
    // app.post('/auth/signout', authenticate, authController.signout);
}