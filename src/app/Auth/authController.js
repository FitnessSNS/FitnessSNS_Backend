const axios = require('axios');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const baseResponse = require('../../../config/baseResponseStatus');
const {response, errResponse} = require('../../../config/response');
const authService = require('./authService');
const authProvider = require('./authProvider');
const userService = require('../User/userService');
const {logger} = require('../../../config/winston');

// 이메일 정규표현식
const regEmail = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;

// JWT 생성
const tokenGenerator = async(req, res, user) =>{
    try {
        // 액세스 토큰 발급
        const accessToken = jwt.sign(
            {
                provider: user.provider,
                email: user.email
            },
            process.env.JWT_KEY,
            {
                expiresIn: '3h'
            }
        );
        // 액세스 토큰 쿠키에 저장
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
        });
    
        // 리프레시 토큰 발급
        const refreshToken = jwt.sign(
            {},
            process.env.JWT_KEY,
            {
                expiresIn: '5d'
            }
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            path: '/auth/common'
        });
    
        // 기존 세션 정보 불러오기
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const session = await authProvider.getSessionByUserId(user.id);
        
        // 세션 정보가 있을 경우
        if (session !== null) {
            await authService.updateSession(session.refresh_token, refreshToken);
        } else {
            await authService.createSession(user.id, refreshToken, ip);
        }
    }
    catch (error) {
        logger.error(`tokenGenerator - database error\n${error.message}`);
        throw error;
    }
}

// 리프레시 토큰 추출
const refreshTokenExtractor = async (req) => {
    let token = null;
    
    if (req && req.cookies && (req.cookies['refresh_token'] !== '')) {
        token = req.cookies['refresh_token'];
    }
    
    return token;
};

// 랜덤 문자열 생성
const generateRandomString = async (num) => {
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < num; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
}

/** 이메일 인증 시작 API
 * [POST] /auth/signUp/emailVerification
 * body : email
 */
exports.emailVerifyStart = async (req, res) => {
    const {email} = req.body;
    
    // 메일 하루 최대 인증 횟수
    const MAX_VERIFICATION_TIME = 10;
    
    // 이메일 유효성 검사
    if(email === undefined || email === null || email === ''){
        return res.send(errResponse(baseResponse.SIGNUP_EMAIL_EMPTY));
    }
    
    // 이메일 형식 검사
    if (!regEmail.test(email)) {
        return res.send(errResponse(baseResponse.SIGNUP_EMAIL_TYPE_WRONG));
    }
    
    // 이메일 중복검사
    const getUserByEmailResult = await authProvider.getUserByEmail(email);
    if (getUserByEmailResult.length > 0) {
        return res.send(errResponse(baseResponse.SIGNUP_EMAIL_DUPLICATED));
    }
    
    // 메일 인증번호 생성 (12자리 문자열)
    const verificationCode = await generateRandomString(12);
    
    // 이메일 인증정보 불러오기
    const emailVerificationResult = await authProvider.getEmailVerification(email);
    
    // 기존에 생성한 이메일 인증정보가 없을 경우
    let emailVerificationResponse = null;
    if (emailVerificationResult.length < 1) {
        emailVerificationResponse = await authService.createEmailVerification(email, verificationCode);
    } else {
        // 현재 인증 횟수
        const currentVerificationCount = emailVerificationResult[0].verification_count;
        
        // 하루 최대 인증 횟수를 초과할 경우
        if (currentVerificationCount > MAX_VERIFICATION_TIME){
            return res.send(errResponse(baseResponse.EMAIL_VERIFICATION_COUNT_EXCEED));
        }
        
        // 인증 코드 수정 후 이메일 송신
        emailVerificationResponse = await authService.updateEmailVerification(email, verificationCode, currentVerificationCount + 1);
    }
    
    return res.send(emailVerificationResponse);
}

/** 이메일 인증 완료 API
 * [POST] /auth/signUp/emailVerification/code
 * body : email, code
 */
exports.emailVerifyEnd = async (req, res) => {
    const {email, code} = req.body;
    
    // 이메일 유효성 검사
    if(email === undefined || email === null || email === ''){
        return res.send(errResponse(baseResponse.SIGNUP_EMAIL_EMPTY));
    }
    
    // 이메일 형식 검사
    if (!regEmail.test(email)) {
        return res.send(errResponse(baseResponse.SIGNUP_EMAIL_TYPE_WRONG));
    }
    
    // 인증코드 유효성 검사
    if(code === undefined || code === null || code === '') {
        return res.send(errResponse(baseResponse.EMAIL_VERIFICATION_CODE_EMPTY));
    }
    
    // 이메일 인증정보 불러오기
    const emailVerificationResult = await authProvider.getEmailVerification(email);
    
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
    if (timeDiff > 4){
        return res.send(errResponse(baseResponse.EMAIL_VERIFICATION_TIMEOUT));
    }
    
    // 등록된 이메일이 있는 경우
    const userCheckResult = await authProvider.getUserByEmail(email);
    if (userCheckResult.length > 0) {
        return res.send(errResponse(baseResponse.EMAIL_VERIFICATION_USER_ALREADY_EXIST));
    }
    
    // 회원가입 JWT 생성
    const signUpToken = jwt.sign(
        {
            email: email
        },
        process.env.JWT_KEY,
        {
            expiresIn: '5m'
        });
    
    // JWT 쿠키에 저장
    res.cookie('signUpToken', signUpToken, {
        httpOnly: true,
        path: '/auth/signUp',
    });
    
    // 완료된 이메일 인증정보 삭제
    await authService.deleteEmailVerification(email);
    
    return res.send(response(baseResponse.SUCCESS));
}

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
                    email: session.User.email
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
                path: '/auth/common'
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
}

/** 로그인 API
 * [POST] /app/users
 * body : provider, email, password
 */
exports.postSignIn = async (req, res) => {
    passport.authenticate('local', async (error, user, passportResponse) => {
        if (error) {
            return res.send(errResponse(baseResponse.SIGNIN_LOCAL_PASSPORT));
        }
        
        // 사용자 정보가 없을 경우
        if (!user) {
            return res.send(passportResponse);
        }
        
        // JWT 발급
        await tokenGenerator(req, res, user);
    
        return res.send(response(baseResponse.SUCCESS));
    })(req, res);
}

const accessTokenExtractor = (req)=>{
    let token = null;
    if (req&&req.cookies&&(req.cookies['access_token']!="")) token = req.cookies['access_token'];
    return token;
};
exports.add_account_details = async (req, res, next) => {
    let target_nickname = req.body.nickname;
    try {
        if(!target_nickname) {
            res.send(errResponse(baseResponse.NICKNAME_EMPTY));
        }
        let token = accessTokenExtractor(req);
        if(token === null || token === undefined){
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
            next({ status: 500, message: 'internal server error' });
            return;
        }

        let user = await authService.getUserByEmail({provider: decoded.provider, email: decoded.email});
        if(!user){
            res.send(errResponse(baseResponse.USER_VALIDATION_FAILURE));
            return;
        }
        if(user.account_details_saved){
            res.send(errResponse(baseResponse.ACCOUNT_DETAILS_SAVED)); 
            return;
        }
        await userService.addAccountDetails({provider: user.provider, email: user.email, nickname: target_nickname});
        res.send(response(baseResponse.SUCCESS));
    } catch (e) {
        console.error(e);
        next({status: 500, message: 'internal server error'});
    } 
}

//kakao oauth
exports.kakao_authorize = async (req, res, next) => {
    let redirect_url = `kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_REST_API_KEY}&redirect_uri=${'http://localhost:3000/auth/kakao/signin'}&response_type=code`;
    res.send({ redirect_url });
}
exports.kakao_signin = async (req, res, next) => {
    let code = req.query.code;
    let params = {
        grant_type: 'authorization_code',
        client_id: `${process.env.KAKAO_REST_API_KEY}`,
        redirect_uri: `http://localhost:3000/auth/kakao/signin`,
        code,
    }
    try {
        const result = await axios({
            url: 'https://kauth.kakao.com/oauth/token',
            method: 'post',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            params,
        });
        const kakao_user = await axios({
            url: 'https://kapi.kakao.com/v2/user/me',
            method: 'post',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
                'Authorization': `Bearer ${result.data.access_token}`,
            },
        });

        let user = await authService.getUserByProviderId({provider: 'kakao', provider_id: kakao_user.data.id});

        if(!user) {
            console.log('create');
            user = await userService.createUser({
                provider: 'kakao',
                provider_id: kakao_user.data.id,
                email: kakao_user.data.kakao_account.email, 
                status: 'RUN',
                account_details_saved: false,
                nickname: kakao_user.data.kakao_account.profile.nickname,
            });
        }
        if(user.status == "DELETED" || user.status == "STOP"){
            res.send(errResponse(baseResponse.USER_VALIDATION_FAILURE));
            return;
        }

        await tokenGenerator(req, res, user);

        res.send(response(baseResponse.SUCCESS));
        
    } catch (e){
        next({status: 500, message: 'internal server error'});
    }
}



// nickname 중복 검사 로직 추가하기

exports.nicknameVerify = async (req, res, next) => {
    let target_nickname = req.body.nickname;
    try {
        if(!target_nickname) {
            res.send(errResponse(baseResponse.NICKNAME_EMPTY));
            return;
        }
        let nnRegex = /^[A-Za-z\dㄱ-ㅎ|ㅏ-ㅣ|가-힣]{4,12}$/;
        if(!nnRegex.test(target_nickname)){
            res.send(errResponse(baseResponse.NICKNAME_VALIDATION_FAIL));
            return;
        }
        res.send(response(baseResponse.SUCCESS));
        return; 
    } catch (e) {
        console.error(e);
        next({status: 500, message: 'internal server error'});
    }
     
}

const evTokenExtractor = (req) => {
    let token = null;
    if (req && req.cookies && (req.cookies['ev_token'] != "")) token = req.cookies['ev_token'];
    return token;
};

// nickname 중복 검사 로직 추가하기
exports.signup = async (req, res, next) => {
    try {
        let payload;
        let ev_token = evTokenExtractor(req);
        if(!ev_token) {
            res.send(errResponse(baseResponse.EV_TOKEN_EMPTY));
            return;
        }
        try {
            payload = jwt.verify(ev_token, process.env.JWT_KEY);
        } catch (e) {
            if (e.name == "JsonWebTokenError") {
                res.send(errResponse(baseResponse.EV_TOKEN_VERIFICATION_FAIL));
                return;
            }
            if (e.name == "TokenExpiredError") {
                res.send(errResponse(baseResponse.EV_TOKEN_EXPIRED));
                return;
            }
            next({ status: 500, message: 'internal server error' });
            return;
        }

        let ev = await authService.getEvByEmail(payload.email);
        if(!ev || !ev.isVerified){
            res.send(errResponse(baseResponse.EV_VERIFICATION_FAIL));
            return;
        }

        let password = req.body.password;
        let nickname = req.body.nickname; 
        if(!password){
            res.send(errResponse(baseResponse.PASSWORD_EMPTY));
            return;
        }    
        if(!nickname){
            res.send(errResponse(baseResponse.NICKNAME_EMPTY));
            return;
        }
        let pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()\-_+=~`])[A-Za-z\d!@#$%^&*()\-_+=~`]{8,20}$/;
        let nnRegex = /^[A-Za-z\dㄱ-ㅎ|ㅏ-ㅣ|가-힣]{4,12}$/;
        if(!pwRegex.test(password)){
            res.send(errResponse(baseResponse.PASSWORD_VALIDATION_FAIL));
            return;
        }
        if(!nnRegex.test(nickname)){
            res.send(errResponse(baseResponse.NICKNAME_VALIDATION_FAIL));
            return;
        }

        let salt = await authService.createSalt();
        let hashPassword = await authService.hashPassword(salt, password);

        let user = await userService.createUser({
            provider: 'local',
            email: payload.email,
            password: hashPassword,
            salt: salt,
            status: 'run',
            account_details_saved: true,
            nickname: nickname,
        });
        
        res.send(response(baseResponse.SUCCESS));

    } catch (e) {
        console.error(e);
        next({status: 500, message: 'internal server error'});
    }
}

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
        next({ status: 500, message: 'internal server error' });
    }

}

exports.signout = async (req, res, next) => {
    try {
        let token = accessTokenExtractor(req);
        if(token === null || token === undefined){
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
            next({ status: 500, message: 'internal server error' });
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

