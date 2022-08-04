const passport = require('passport');
const jwt = require('jsonwebtoken');
const db = require('../../../config/db');
const authService = require('./authService');
const authResponse = require('./authResponse');

require('dotenv').config();


const jwttest = async (req, res, next) => {
    try {
        if(!req.user){
            next({status: 401, message: 'unauthorized'});
            return;
        }
        res.status(200).json({msg: `${req.user.name} got the pizza. he/she is ${req.user.status}.`}); 
    } catch (e) {
        console.error(e);
        next({status: 500, message: 'internal server error'});
    }
}
const refreshTokenExtractor = (req)=>{
    let token = null;
    if (req&&req.cookies&&(req.cookies['refresh_token']!="")) token = req.cookies['refresh_token'];
    return token;
};

const refresh = async (req, res, next) => {
    try {
        let token = refreshTokenExtractor(req);
        if(token === null || token === undefined){
            res.send(authResponse.REFRESH_TOKEN_EMPTY);
            return;
        }

        try {
            jwt.verify(token, process.env.JWT_KEY);
        } catch (e) {
            if (e.name == "JsonWebTokenError") {
                res.send(authResponse.REFRESH_TOKEN_VERIFICATION_FAILURE);
                return;
            }
            if (e.name == "TokenExpiredError") {
                res.send(authResponse.REFRESH_TOKEN_EXPIRED);
                return;
            }
            next({status: 500, message: 'internal server error'});
            return;
        } 
        const {session, user} = await authService.getSessionByToken(token);
        if(session){
            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            if(session.ip === ip){
                const access_token = jwt.sign({ email: user.email }, process.env.JWT_KEY, { expiresIn: '1m' });
                res.cookie('access_token', access_token, {
                    httpOnly: true,
                });
                const refresh_token = jwt.sign({}, process.env.JWT_KEY, { expiresIn: '5d' });
                res.cookie('refresh_token', refresh_token, {
                    httpOnly: true,
                    path: '/auth/common'
                });
                await authService.updateSession(session.refresh_token, refresh_token);
                res.status(200).json({message: 'your tokens are re-generated'});
            }
            else {
                await authService.deleteSession(session.refresh_token);
                next({ status: 401, message: "ip has changed. please re-login" });
            }
        } else {
            throw 'Session table does not have refresh token';
        }
    } catch (e) {
        console.error(e);
        next({status: 500, message: 'internal server error'});
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
                    next({ status: 400, message: info.message });
                    return;
                }
                const access_token = jwt.sign({ email: user.email }, process.env.JWT_KEY, { expiresIn: '1m' });
                res.cookie('access_token', access_token, {
                    httpOnly: true,
                });

                const refresh_token = jwt.sign({}, process.env.JWT_KEY, { expiresIn: '5d' });
                res.cookie('refresh_token', refresh_token, {
                    httpOnly: true,
                    path: '/auth/common'
                });
                const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                
                const {session} = await authService.getSessionByUserId(user.id);
                if(session){
                    await authService.updateSession(session.refresh_token, refresh_token);
                    console.log('session exists');
                } else {
                    await authService.createSession(user.id, refresh_token, ip);
                    console.log('session create');
                }
                res.status(200).json({ message: "your token was generated" });

            } catch (e) {
                console.error(e);
                next({status: 500, message: 'internal server error'});
            }
        })(req,res);        

    } catch (e) {
        console.error(e);
        next({status: 500, message: 'internal server error'});
    }
}

const signout = async (req, res, next) => {
    try {
        let token = refreshTokenExtractor(req);
        if(token){
            await authService.deleteSession(token);
        }
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

        res.status(200).json({message: "logout success"});
    } catch (e) {
        console.error(e);
        next({status: 500, message: 'internal server error'});
    }

}

module.exports = {jwttest, refresh, signin, signout};
