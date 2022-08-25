const axios = require('axios');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const authService = require('./authService');

const baseResponse = require('../../../config/baseResponseStatus');
const {response, errResponse} = require('../../../config/response');
const userService = require('../User/userService');
const {logger} = require('../../../config/winston');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// index.js에 설정
// require('dotenv').config();

exports.dbtest = async (req, res, next) => {
    let users = await prisma.user.findMany();
    res.send({ users });
}
exports.jwttest = async (req, res, next) => {
    try {
        if (!req.user) {
            next({ status: 401, message: 'unauthorized' });
            return;
        }
        res.status(200).json({ msg: `${req.user.email} got the pizza. he/she is ${req.user.status}.` });
    } catch (e) {
        console.error(e);
        next({ status: 500, message: 'internal server error' });
    }
}

const refreshTokenExtractor = (req) => {
    let token = null;
    if (req && req.cookies && (req.cookies['refresh_token'] != "")) token = req.cookies['refresh_token'];
    return token;
};

exports.refresh = async (req, res, next) => {
    try {
        let token = refreshTokenExtractor(req);
        if (token === null || token === undefined) {
            res.send(errResponse(baseResponse.REFRESH_TOKEN_EMPTY));
            return;
        }

        try {
            jwt.verify(token, process.env.JWT_KEY);
        } catch (e) {
            if (e.name == "JsonWebTokenError") {
                res.send(errResponse(baseResponse.REFRESH_TOKEN_VERIFICATION_FAIL));
                return;
            }
            if (e.name == "TokenExpiredError") {
                await authService.deleteSession(token);
                res.send(errResponse(baseResponse.REFRESH_TOKEN_EXPIRED));
                return;
            }
            next({ status: 500, message: 'internal server error' });
            return;
        }
        const { session } = await authService.getSessionByToken(token);
        if (session) {
            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            if (session.ip === ip) {
                const access_token = jwt.sign({ email: session.user.email }, process.env.JWT_KEY, { expiresIn: '1m' });
                res.cookie('access_token', access_token, {
                    httpOnly: true,
                });
                const refresh_token = jwt.sign({}, process.env.JWT_KEY, { expiresIn: '5d' });
                res.cookie('refresh_token', refresh_token, {
                    httpOnly: true,
                    path: '/auth/common'
                });
                await authService.updateSession(session.refresh_token, refresh_token);
                res.status(200).json({ message: 'your tokens are re-generated' });
            }
            else {
                await authService.deleteSession(session.refresh_token);
                res.send(errResponse(baseResponse.IP_CHANGE_ERROR));
            }
        } else {
            res.send(errResponse(baseResponse.SESSION_EXPIRED));
        }
    } catch (e) {
        console.error(e);
        next({ status: 500, message: 'internal server error' });
    }
}

const token_generator = async(req, res, user) =>{
    console.log(user);
    try {
        const access_token = jwt.sign({ provider: user.provider, email: user.email }, process.env.JWT_KEY, { expiresIn: '1m' });
        res.cookie('access_token', access_token, {
            httpOnly: true,
        });

        const refresh_token = jwt.sign({}, process.env.JWT_KEY, { expiresIn: '5m' });
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            path: '/auth/common'
        });
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        const { session } = await authService.getSessionByUserId(user.id);
        if (session) {
            await authService.updateSession(session.refresh_token, refresh_token);
        } else {
            await authService.createSession(user.id, refresh_token, ip);
        }

    } 
    catch (e) {
        throw e;
    }
}

exports.signin = async (req, res, next) => {
    try {
        passport.authenticate('local', async (err, user, info) => {
            try {
                if (err) {
                    next({ status: 500, message: 'internal server error' });
                    return;
                }
                if (!user) {
                    res.send(errResponse(baseResponse.USER_VALIDATION_FAILURE));
                    return;
                }

                await token_generator(req, res, user);
                
                res.status(200).json({ message: "your token was generated" });
            } catch (e) {
                console.error(e);
                logger.error(`Global error\n: ${e.message} \n${JSON.stringify(e)}`);
                next({ status: 500, message: 'passport-local service error' });
            }
        })(req, res);

    } catch (e) {
        console.error(e);
        // TODO: 에러 발생 부분에 log 추가
        logger.error(`Global error\n: ${e.message} \n${JSON.stringify(e)}`);
        next({ status: 500, message: 'internal server error' });
    }
}
//oauth common
exports.add_info = async (req, res, next) => {
    res.render('addinfo');
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
                res.send(errResponse(baseResponse.ACCESS_TOKEN_VERFICATION_FAIL));
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
                status: 'run',
                account_details_saved: false,
                nickname: kakao_user.data.kakao_account.profile.nickname,
            });
        }

        token_generator(req, res, user);

        res.send(response(baseResponse.SUCCESS));
        
    } catch (e){
        next({status: 500, message: 'internal server error'});
    }
}
exports.emailVerifyStart = async (req, res, next) => {
    try {
        let target_email = req.body.email;
        if(!target_email){
            res.send(errResponse(baseResponse.EMAIL_EMPTY));
            return;
        }
        let regEmail = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
        if (!regEmail.test(target_email)) {
            res.send(errResponse(baseResponse.EMAIL_VALIDATION_FAIL));
            return;
        }

        let new_code = Math.floor(Math.random()*1000000);
        if(new_code.toString().length < 6) new_code+=100000;

        let ev = await authService.getEvByEmail(target_email);         
        if(!ev){
            await authService.createEv(target_email, new_code);
            await authService.sendEvMail(target_email, new_code);
        } else {
            let {email, code, updated_at, total_gen_per_day, isVerified} = ev;
            let curTime = new Date();
            let curYear = curTime.getFullYear();
            let curMonth = curTime.getMonth();
            let curDate = curTime.getDate();
            let evYear = updated_at.getFullYear();
            let evMonth = updated_at.getMonth();
            let evDate = updated_at.getDate();
            if (evYear < curYear || evMonth < curMonth || evDate < curDate){
                total_gen_per_day = 1;
            } else {
                total_gen_per_day += 1;
            }

            if (total_gen_per_day > 10){
                res.send(errResponse(baseResponse.EV_VERIFICATION_COUNT_EXCEEDED));
                return;
            }
            code = new_code;
            isVerified = false;
            updated_at = new Date();
            console.log(updated_at);
            await authService.updateEv({email, code, updated_at, total_gen_per_day, isVerified});
            await authService.sendEvMail(target_email, new_code);
        }
        
        res.status(200).json({message: 'verification code was sent'});
    }
    catch (e) {
        console.error(e);
        next({status: 500, message: 'internal server error'});
    }

}
exports.emailVerifyEnd = async (req,res,err) => {
    let target_email = req.body.email;
    let target_code = req.body.code;
    try {
        if(!target_email || !target_code) {
            res.send(errResponse(baseResponse.EV_CREDENTIAL_EMPTY));
            return;
        }
        let ev = await authService.getEvByEmail(target_email);
        if(!ev){
            res.send(errResponse(baseResponse.EV_CODE_NOT_GENERATED));
            return;
        }
        if (Number(target_code) !== ev.code) {
            res.send(errResponse(baseResponse.EV_CODE_NOT_MATCH));
            return;
        }
        if ((new Date().getTime() - ev.updated_at.getTime()) / (1000*60) > 1){
            res.send(errResponse(baseResponse.EV_VERIFICATION_TIMEOUT));
            return;
        }
        let user = await authService.getUserByEmail({provider:'local', email:target_email});
        if(user){
            res.send(errResponse(baseResponse.EV_USER_EXIST));
            return;
        }
        
        const ev_token = jwt.sign({ email: target_email }, process.env.JWT_KEY, { expiresIn: '5m' });
        res.cookie('ev_token', ev_token, {
            httpOnly: true,
            path: '/auth/signup',
        });

        await authService.updateEv({email: target_email, isVerified: true}); 

        res.status(200).json({message: 'your ev_token is generated'});
        

    } catch (e) {
        console.error(e);
        next({status: 500, message: 'internal server error'});
    }
    
}

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

        //password, nickname 검증 추가하기
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
        
        res.status(200).json({message: "registration success"});

    } catch (e) {
        console.error(e);
        next({status: 500, message: 'internal server error'});
    }
}

exports.logout = async (req, res, next) => {
    try {
        let token = refreshTokenExtractor(req);
        if (token) {
            await authService.deleteSession(token);
        }
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

        res.status(200).json({ message: "logout success" });
    } catch (e) {
        console.error(e);
        next({ status: 500, message: 'internal server error' });
    }

}

