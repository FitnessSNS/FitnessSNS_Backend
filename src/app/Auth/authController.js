const passport = require('passport');
const jwt = require('jsonwebtoken');
const baseResponse = require('../../../config/baseResponseStatus');
const {response, errResponse} = require('../../../config/response');
const authService = require('./authService');
const authProvider = require('./authProvider');
const tokenGenerator = require('../../../config/tokenGenerator');
const redis = require('redis');
const redisClient = new redis.createClient();

// redis client 에러 발생
redisClient.on('error', (error) => {
    customLogger.error(`Redis Client Error\n${error.message}`);
});

// 이메일 정규표현식
const regEmail = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;

// 닉네임 정규표현식
const regNickname = /[^\w\sㄱ-힣]|[\_]/g;

// 비밀번호 정규표현식 (8~20자리, 특수문자, 영어, 숫자 포함)
const regPassword = /^.*(?=^.{8,20}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/;

// 문자열 길이 체크
const getByteLength = async (str) => {
    let byte = 0;
    let count = 12;
    
    // 글자 바이트 및 개수 확인
    for (let character of str) {
        const code = character.charCodeAt(0);
        
        if (code > 127) {
            byte += 2;
        } else if (code > 64 && code < 91) {
            byte += 2;
        } else {
            byte += 1;
        }
        
        count--;
    }
    
    // 12글자가 넘을 경우
    if (count < 0) {
        return -1;
    } else {
        return byte;
    }
};

// 랜덤 문자열 생성
const generateRandomString = async (num) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    
    for (let i = 0; i < num; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
};

// 리프레시 토큰 추출
const refreshTokenExtractor = async (req) => {
    let token = null;
    
    if (req && req.cookies && (req.cookies['refresh_token'] !== '')) {
        token = req.cookies['refresh_token'];
    }
    
    return token;
};

/** 이메일 인증 시작 API
 * [POST] /auth/signUp/emailVerification
 * body : email
 */
exports.emailVerifyStart = async (req, res) => {
    const {email} = req.body;
    
    // 메일 하루 최대 인증 횟수
    const MAX_VERIFICATION_TIME = 10;
    
    // 이메일 유효성 검사
    if (email === undefined || email === null || email === '') {
        return res.send(errResponse(baseResponse.EMAIL_VERIFICATION_EMAIL_EMPTY));
    }
    
    // 이메일 형식 검사
    if (!regEmail.test(email)) {
        return res.send(errResponse(baseResponse.EMAIL_VERIFICATION_EMAIL_TYPE_WRONG));
    }
    
    // 이메일 중복검사
    let getUserByEmailResult;
    try {
        getUserByEmailResult = await authProvider.getUserByEmail(email);
    } catch {
        return res.send(errResponse(baseResponse.DB_ERROR));
    }
    
    // 중복 이메일이 있을 경우
    if (getUserByEmailResult.length > 0) {
        return res.send(errResponse(baseResponse.EMAIL_VERIFICATION_EMAIL_DUPLICATED));
    }
    
    // 메일 인증번호 생성 (12자리 문자열)
    const verificationCode = await generateRandomString(12);
    
    // 이메일 인증정보 불러오기
    let emailVerificationResult;
    try {
        emailVerificationResult = await authProvider.getEmailVerification(email);
    } catch {
        return res.send(errResponse(baseResponse.DB_ERROR));
    }
    
    // 기존에 생성한 이메일 인증정보 확인
    let emailVerificationResponse = null;
    if (emailVerificationResult.length < 1) {
        emailVerificationResponse = await authService.createEmailVerification(email, verificationCode);
    } else {
        // 현재 인증 횟수
        const currentVerificationCount = emailVerificationResult[0].verification_count;
        
        // 하루 최대 인증 횟수를 초과할 경우
        if (currentVerificationCount > MAX_VERIFICATION_TIME) {
            return res.send(errResponse(baseResponse.EMAIL_VERIFICATION_COUNT_EXCEED));
        }
        
        // 인증 코드 수정 후 이메일 송신
        emailVerificationResponse = await authService.updateEmailVerification(email, verificationCode, currentVerificationCount + 1);
    }
    
    return res.send(emailVerificationResponse);
};

/** 이메일 인증 완료 API
 * [POST] /auth/signUp/emailVerification/code
 * body : email, code
 */
exports.emailVerifyEnd = async (req, res) => {
    const {email, code} = req.body;
    
    // 이메일 유효성 검사
    if (email === undefined || email === null || email === '') {
        return res.send(errResponse(baseResponse.EMAIL_VERIFICATION_EMAIL_EMPTY));
    }
    
    // 이메일 형식 검사
    if (!regEmail.test(email)) {
        return res.send(errResponse(baseResponse.EMAIL_VERIFICATION_EMAIL_TYPE_WRONG));
    }
    
    // 인증코드 유효성 검사
    if (code === undefined || code === null || code === '') {
        return res.send(errResponse(baseResponse.EMAIL_VERIFICATION_CODE_EMPTY));
    }
    
    // 이메일 인증정보 불러오기
    let emailVerificationResult;
    try {
        emailVerificationResult = await authProvider.getEmailVerification(email);
    } catch {
        return res.send(errResponse(baseResponse.DB_ERROR));
    }
    
    // 이메일 인증정보가 없을 경우
    if (emailVerificationResult.length < 1) {
        return res.send(errResponse(baseResponse.EMAIL_VERIFICATION_NOT_GENERATED));
    }
    
    // 인증코드가 맞지 않을 경우
    if (code !== emailVerificationResult[0].code) {
        return res.send(errResponse(baseResponse.EMAIL_VERIFICATION_CODE_NOT_MATCH));
    }
    
    // 인증 시간을 초과한 경우 (4분)
    const now = new Date();
    const timeDiff = (now.getTime() - emailVerificationResult[0].updated_at.getTime()) / (60 * 1000);
    if (timeDiff > 4) {
        return res.send(errResponse(baseResponse.EMAIL_VERIFICATION_TIMEOUT));
    }
    
    // 등록된 이메일이 있는 경우
    let userCheckResult;
    try {
        userCheckResult = await authProvider.getUserByEmail(email);
    } catch {
        return res.send(errResponse(baseResponse.DB_ERROR));
    }
    
    // 등록된 이메일이 있을 경우
    if (userCheckResult.length > 0) {
        return res.send(errResponse(baseResponse.EMAIL_VERIFICATION_EMAIL_DUPLICATED));
    }
    
    // redis 서버 연결
    await redisClient.connect();
    // 임시 사용자 번호 생성 (6자리 문자열)
    const userCheckString = await generateRandomString(6);
    await redisClient.set(email, userCheckString, {
        EX: 3600 // 회원가입 유효시간 1시간
    });
    await redisClient.quit();
    
    await tokenGenerator.signUpToken(req, res, userCheckString);
    
    return res.send(response(baseResponse.SUCCESS));
};

/** 닉네임 중복검사 API
 * [POST] /auth/signUp/nickname
 * body : nickname
 */
exports.nicknameCheck = async (req, res) => {
    const {nickname} = req.body;
    
    // 닉네임 확인
    if (nickname === undefined || nickname === null || nickname === '') {
        return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_EMPTY));
    }
    
    // 닉네임 길이 검사
    if (nickname.length > 12) {
        return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_LENGTH_OVER));
    }
    
    // 닉네임 유효성 검사
    if (regNickname.test(nickname)) {
        return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_REGEX_WRONG));
    }
    
    // 닉네임 중복검사
    try {
        const nicknameResult = await authProvider.getUserNickname(nickname);
        if (nicknameResult.length > 0) {
            return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_DUPLICATED));
        }
    } catch {
        return res.send(errResponse(baseResponse.DB_ERROR));
    }
    
    // 응답 객체 생성
    const finalResult = {
        nickname: nickname
    };
    
    return res.send(response(baseResponse.SUCCESS, finalResult));
};

/** 로컬계정 회원가입 API
 * [POST] /auth/signUp
 * body : email, nickname, password
 */
exports.signUp = async (req, res) => {
    const userCheck = req.verifiedToken.userCheck;
    const {email, nickname, password} = req.body;
    
    // redis 서버 연결
    await redisClient.connect();
    const redisCheck = await redisClient.get(email);
    await redisClient.quit();
    
    // 임시 사용자 번호 확인
    if (userCheck !== redisCheck) {
        return res.send(errResponse(baseResponse.SIGNUP_EMAIL_NOT_MATCH));
    }
    
    // 이메일 인증정보 확인
    try {
        const emailVeirificationResult = await authProvider.getEmailVerification(email);
        if (emailVeirificationResult.length < 1) {
            return res.send(errResponse(baseResponse.SIGNUP_EMAIL_VERIFICATION_EMPTY));
        }
    } catch {
        return res.send(errResponse(baseResponse.DB_ERROR));
    }
    
    // 닉네임 확인
    if (nickname === undefined || nickname === null || nickname === '') {
        return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_EMPTY));
    }
    
    // 닉네임 길이 계산
    const nicknameByteLength = await getByteLength(nickname);
    
    // 닉네임 길이 검사
    if (nicknameByteLength < 0 || nicknameByteLength.length > 12) {
        return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_LENGTH_OVER));
    }
    
    // 닉네임 유효성 검사
    if (regNickname.test(nickname)) {
        return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_REGEX_WRONG));
    }
    
    // 닉네임 중복검사
    try {
        const nicknameResult = await authProvider.getUserNickname(nickname);
        if (nicknameResult !== undefined && nicknameResult.length > 0) {
            return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_DUPLICATED));
        }
    } catch {
        return res.send(errResponse(baseResponse.DB_ERROR));
    }
    
    // 비밀번호 확인
    if (password === undefined || password === null || password === '') {
        return res.send(errResponse(baseResponse.SIGNUP_PASSWORD_EMPTY));
    }
    
    // 비밀번호 길이 검사
    if (password.length < 8 || password.length > 20) {
        return res.send(errResponse(baseResponse.SIGNUP_PASSWORD_LENGTH_OVER));
    }
    
    // 비밀번호 유효성 검사
    if (!regPassword.test(password)) {
        return res.send(errResponse(baseResponse.SIGNUP_PASSWORD_REGEX_WRONG));
    }
    
    // 로컬계정 생성
    const signUpResponse = await authService.createLocalUser(email, nickname, password);
    
    return res.send(signUpResponse);
};

/** OAuth 인가 코드 API
 * [GET] /auth/oauth/authorization
 */
exports.authURI = async (req, res) => {
    const provider = req.query.provider;
    
    // SNS 플랫폼 유효성 검사
    if (provider === undefined || provider !== 'kakao') {
        return res.send(errResponse(baseResponse.OAUTH_AUTHORIZATION_PROVIDER_WRONG));
    }
    
    // 플랫폼별 인가코드 응답
    let authResult = {};
    if (provider === 'kakao') {
        authResult.authURI = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_REST_API_KEY}&redirect_uri=${process.env.KAKAO_REDIRECT_URI_SERVER}&response_type=code`;
    }
    
    return res.send(response(baseResponse.SUCCESS, authResult));
};

/** 로컬 로그인 API
 * [POST] /auth/signIn/local
 * body : provider, email, password
 */
exports.localSignIn = async (req, res) => {
    passport.authenticate('local', async (error, user) => {
        if (error) {
            if (error.type === 'db') {
                return res.send(errResponse(baseResponse.DB_ERROR));
            } else {
                return res.send(error);
            }
        }
        
        // TODO: 유효시간 변경
        // 액세스 토큰 발급
        const accessToken = jwt.sign(
            {
                id: user.userId
            },
            process.env.JWT_KEY,
            {
                expiresIn: '1d'
            }
        );
        
        // 리프레시 토큰 발급 (쿠키)
        try {
            await tokenGenerator.refreshToken(req, res, user);
        } catch {
            return res.send(errResponse(baseResponse.SIGNIN_REFRESH_TOKEN_GENERATE_FAIL));
        }
        
        // 응답 객체 생성
        const signInResult = {
            userId     : user.userId,
            provider   : user.provider,
            email      : user.email,
            nickname   : user.nickname,
            status     : user.status,
            accessToken: accessToken
        };
        
        return res.send(response(baseResponse.SUCCESS, signInResult));
    })(req, res);
};

/** 소셜 로그인 (카카오) API
 * [GET] /auth/signIn/kakao
 * query : code
 */
exports.kakaoSignIn = async (req, res) => {
    // 카카오 API 인가코드
    const code = req.query.code;
    
    // 인가코드로 액세스 토큰 요청
    let getKakaoTokenResult;
    try {
        getKakaoTokenResult = await authProvider.getKakaoToken(code);
    } catch (error) {
        return res.send(errResponse(baseResponse.KAKAO_API_ERROR));
    }
    
    // 액세스 토큰을 받을 수 없는 경우
    if (getKakaoTokenResult.data === undefined || getKakaoTokenResult.data === null) {
        return res.send(errResponse(baseResponse.SIGNIN_KAKAO_AUTHORIZATION_CODE_WRONG));
    }
    
    // 액세스 토큰으로 사용자 정보 요청
    const accessToken = getKakaoTokenResult.data.access_token;
    let getKakaoUserInfoResult;
    try {
        getKakaoUserInfoResult = await authProvider.getKakaoUserInfo(accessToken);
    } catch {
        return res.send(errResponse(baseResponse.KAKAO_API_ERROR));
    }
    
    // 사용자 정보를 받을 수 없는 경우
    if (getKakaoUserInfoResult.data.kakao_account.email === undefined || getKakaoUserInfoResult.data.kakao_account.email === null) {
        return res.send(errResponse(baseResponse.SIGNIN_KAKAO_ACCESS_TOKEN_WRONG));
    }
    
    // 기존에 가입한 계정 확인
    const email = getKakaoUserInfoResult.data.kakao_account.email;
    let getUserInfo;
    try {
        getUserInfo = await authProvider.getUserInfoByEmail('kakao', email);
    } catch {
        return res.send(errResponse(baseResponse.DB_ERROR));
    }
    
    // 기존에 가입한 계정이 없을 경우
    if (getUserInfo.length < 1) {
        // 신규 가입
        try {
            getUserInfo = await authService.createOAuthUser('kakao', email);
        } catch {
            return res.send(errResponse(baseResponse.DB_ERROR));
        }
        
        // 신규 가입이 안 될 경우
        if (getUserInfo.length < 1) {
            return res.send(errResponse(baseResponse.SIGNIN_KAKAO_USER_NOT_CREATED));
        }
        // 가입한 계정이 있을 경우
    } else {
        // 계정 상태 확인
        if (getUserInfo[0].status !== 'RUN') {
            return res.send(errResponse(baseResponse.SIGNIN_KAKAO_USER_STATUS));
        }
    }
    
    // TODO: 유효시간 변경
    // 액세스 토큰 발급
    getUserInfo[0].accessToken = jwt.sign(
        {
            id: getUserInfo[0].userId
        },
        process.env.JWT_KEY,
        {
            expiresIn: '1d'
        }
    );
    
    // 리프레시 토큰 발급 (쿠키)
    try {
        await tokenGenerator.refreshToken(req, res, getUserInfo[0]);
    } catch {
        return res.send(errResponse(baseResponse.SIGNIN_REFRESH_TOKEN_GENERATE_FAIL));
    }
    
    return res.send(response(baseResponse.SUCCESS, getUserInfo[0]));
};

/** OAuth 추가정보 등록 API
 * [POST] /auth/oauth/addInfo
 * body : nickname
 */
exports.addInfo = async (req, res) => {
    const userId = req.verifiedToken.id;
    const {nickname} = req.body;
    
    // 가입한 계정 확인
    let getUserInfo;
    try {
        getUserInfo = await authProvider.getUserInfoById(userId);
        if (getUserInfo.length < 1) {
            return res.send(errResponse(baseResponse.OAUTH_ADDINFO_USER_NOT_FOUND));
        }
    } catch {
        return res.send(errResponse(baseResponse.DB_ERROR));
    }
    
    // 닉네임 확인
    if (nickname === undefined || nickname === null || nickname === '') {
        return res.send(errResponse(baseResponse.OAUTH_ADDINFO_NICKNAME_EMPTY));
    }
    
    // 닉네임 길이 검사
    const nicknameByteLength = await getByteLength(nickname);
    if (nicknameByteLength < 0 || nicknameByteLength.length > 12) {
        return res.send(errResponse(baseResponse.OAUTH_ADDINFO_NICKNAME_LENGTH_OVER));
    }
    
    // 닉네임 유효성 검사
    if (regNickname.test(nickname)) {
        return res.send(errResponse(baseResponse.OAUTH_ADDINFO_NICKNAME_REGEX_WRONG));
    }
    
    // 닉네임 중복검사
    try {
        const nicknameResult = await authProvider.getUserNickname(nickname);
        if (nicknameResult !== undefined && nicknameResult.length > 0) {
            return res.send(errResponse(baseResponse.OAUTH_ADDINFO_NICKNAME_DUPLICATED));
        }
    } catch {
        return res.send(errResponse(baseResponse.DB_ERROR));
    }
    
    const addUserInfoResponse = await authService.addUserInfo(getUserInfo[0].proivder, getUserInfo[0].email, getUserInfo[0].nickname);
    
    res.send(addUserInfoResponse);
};


/** JWT 재발급 API
 * [GET] /auth/common/refresh
 */
exports.getRefreshToken = async (req, res) => {
    // 토큰 검사
    const token = await refreshTokenExtractor(req);
    if (token === null || token === undefined) {
        return res.send(errResponse(baseResponse.REFRESH_TOKEN_EMPTY));
    }
    
    // 토큰 복호화
    await jwt.verify(token, process.env.JWT_KEY, async (error, verifiedToken) => {
        if (error) {
            if (error.name === 'TokenExpiredError') {
                // 리프레시 토큰이 만료될 경우 세션에서 삭제
                await authService.deleteSession(token);
                return res.send(errResponse(baseResponse.REFRESH_TOKEN_EXPIRED));
            } else {
                return res.send(errResponse(baseResponse.REFRESH_TOKEN_VERIFICATION_FAIL));
            }
        }
    });
    
    // 세션 정보 불러오기
    const session = await authProvider.getSessionByToken(token);
    if (session !== null) {
        // 현재 단말기에서 접속한 IP와 세션 정보에 있는 IP 비교
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        if (session.ip === ip) {
            // IP가 일치하면 JWT 재발급
            const accessToken = jwt.sign(
                {
                    provider: session.User.provider,
                    email   : session.User.email
                },
                process.env.JWT_KEY,
                {
                    expiresIn: '3h'
                }
            );
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
            });
            
            // 리프레시 토큰 재발급
            const refreshToken = jwt.sign(
                {},
                process.env.JWT_KEY,
                {
                    expiresIn: '5d'
                }
            );
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path    : '/auth/common'
            });
            
            // 세션 정보 수정
            await authService.updateSession(session.refresh_token, refreshToken);
            return res.send(response(baseResponse.SUCCESS));
        }
        // IP가 일치하지 않을 경우
        else {
            return res.send(errResponse(baseResponse.REFRESH_TOKEN_IP_NOT_MATCH));
        }
        // 세션 정보가 없을 경우
    } else {
        return res.send(errResponse(baseResponse.REFRESH_TOKEN_SESSION_DELETED));
    }
};


exports.logout = async (req, res, next) => {
    try {
        let token = await refreshTokenExtractor(req);
        if (token) {
            await authService.deleteSession(token);
        }
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        
        res.send(response(baseResponse.SUCCESS));
    } catch (e) {
        console.error(e);
        next({status: 500, message: 'internal server error'});
    }
    
}

exports.signout = async (req, res, next) => {
    try {
        let token = accessTokenExtractor(req);
        if (token === null || token === undefined) {
            res.send(errResponse(baseResponse.ACCESS_TOKEN_EMPTY));
            return;
        }
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_KEY);
        } catch (e) {
            if (e.name == "JsonWebTokenError") {
                res.send(errResponse(baseResponse.ACCESS_TOKEN_VERIFICATION_FAIL));
                return;
            }
            if (e.name == "TokenExpiredError") {
                res.send(errResponse(baseResponse.ACCESS_TOKEN_EXPIRED));
                return;
            }
            next({status: 500, message: 'internal server error'});
            return;
        }
        
        await userService.chageStatus({status: "DELETED", provider: decoded.provider, email: decoded.email});
        
        let refresh_token = await refreshTokenExtractor(req);
        if (refresh_token) {
            await authService.deleteSession(token);
        }
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        
        res.send(response(baseResponse.SUCCESS));
        
    } catch (e) {
        console.error(e);
        next({status: 500, message: 'internal server error'});
    }
}

