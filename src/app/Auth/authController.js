const axios = require('axios');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const authService = require('./authService');
const authResponse = require('./authResponse');
const userService = require('../User/userService');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

require('dotenv').config();

const dbtest = async (req, res, next) => {
    let users = await prisma.user.findMany();
    res.send({ users });
}
const jwttest = async (req, res, next) => {
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

const refresh = async (req, res, next) => {
    try {
        let token = refreshTokenExtractor(req);
        if (token === null || token === undefined) {
            res.send(authResponse.REFRESH_TOKEN_EMPTY);
            return;
        }

        try {
            jwt.verify(token, process.env.JWT_KEY);
        } catch (e) {
            if (e.name == "JsonWebTokenError") {
                res.send(authResponse.REFRESH_TOKEN_VERIFICATION_FAIL);
                return;
            }
            if (e.name == "TokenExpiredError") {
                await authService.deleteSession(token);
                res.send(authResponse.REFRESH_TOKEN_EXPIRED);
                return;
            }
            next({ status: 500, message: 'internal server error' });
            return;
        }
        const { session } = await authService.getSessionByToken(token);
        console.log(session);
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
                res.send(authResponse.IP_CHANGE_ERROR);
            }
        } else {
            res.send(authResponse.SESSION_EXPIRED);
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

const signin = async (req, res, next) => {
    try {
        passport.authenticate('local', async (err, user, info) => {
            try {
                if (err) {
                    next({ status: 500, message: 'internal server error' });
                    return;
                }
                if (!user) {
                    res.send(authResponse.USER_VALIDATION_FAILURE);
                    return;
                }

                await token_generator(req, res, user);
                res.status(200).json({ message: "your token was generated" });

            } catch (e) {
                console.error(e);
                next({ status: 500, message: 'internal server error' });
            }
        })(req, res);

    } catch (e) {
        console.error(e);
        next({ status: 500, message: 'internal server error' });
    }
}

//kakao oauth
const kakao_authorize = async (req, res, next) => {
    let redirect_url = `kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_REST_API_KEY}&redirect_uri=${'http://localhost:3000/auth/kakao/signin'}&response_type=code`;
    res.send({ redirect_url });
}
const kakao_signin = async (req, res, next) => {
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
                account_details_saved: true,
                nickname: kakao_user.data.kakao_account.profile.nickname,
            });
        }

        token_generator(req, res, user);

        res.status(200).json({message: "your token was generated"});
        
    } catch (e){
        next({status: 500, message: 'internal server error'});
    }
}

const logout = async (req, res, next) => {
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

module.exports = { dbtest, jwttest, refresh, signin, kakao_authorize, kakao_signin, logout };
