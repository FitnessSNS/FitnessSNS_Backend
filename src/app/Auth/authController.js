const passport = require('passport');
const jwt = require('jsonwebtoken');
const authService = require('./authService');
const authResponse = require('./authResponse');

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
        res.status(200).json({ msg: `${req.user.name} got the pizza. he/she is ${req.user.status}.` });
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
                res.send(authResponse.REFRESH_TOKEN_VERIFICATION_FAILURE);
                return;
            }
            if (e.name == "TokenExpiredError") {
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
                next({ status: 401, message: "ip has changed. please re-login" });
            }
        } else {
            throw 'Session table does not have refresh token';
        }
    } catch (e) {
        console.error(e);
        next({ status: 500, message: 'internal server error' });
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

                const { session } = await authService.getSessionByUserId(user.id);
                console.log('session', session);
                if (session) {
                    await authService.updateSession(session.refresh_token, refresh_token);
                } else {
                    await authService.createSession(user.id, refresh_token, ip);
                }
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

module.exports = { dbtest, jwttest, refresh, signin, logout };
