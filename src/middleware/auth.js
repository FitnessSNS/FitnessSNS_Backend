const jwt = require('jsonwebtoken');
const baseResponse = require('../../config/baseResponseStatus');
const {response, errResponse} = require('../../config/response');
const {logger} = require('../../config/winston');

// Prisma Client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 회원가입 토큰 확인
const signUpAuth = async (req, res, next) => {
    let token = null;
    
    if (req && req.cookies && (req.cookies['signUpToken'] !== '')) {
        token = req.cookies['signUpToken'];
    }
    
    // 토큰이 없으면 종료
    if (token === null || token === undefined){
        return res.send(errResponse(baseResponse.SIGNUP_TOKEN_EMPTY));
    }
    
    // 토큰 복호화
    await jwt.verify(token, process.env.JWT_KEY, async (error, verifiedToken) => {
        if (error) {
            logger.error(`signUpToken - authenticate middleware error\n${error.message}`);
            return res.send(errResponse(baseResponse.SIGNUP_TOKEN_EMPTY));
        }
        
        // request 객체에 토큰 정보 저장
        req.verifiedToken = verifiedToken;
        next();
    });
};

// 로그인 토큰 확인
const authenticate = async (req, res, next) => {
    // 토큰이 없으면 종료
    let token = null;
    
    if (req && req.cookies && (req.cookies['accessToken'] !== '')) {
        token = req.cookies['accessToken'];
    }
    
    if (token === null || token === undefined){
        next();
        return;
    }
    
    // 토큰 복호화
    await jwt.verify(token, process.env.JWT_KEY, async (error, verifiedToken) => {
        if (error) {
            res.send(errResponse(baseResponse.ACCESS_TOKEN_EXPIRED));
        }
        
        req.user = verifiedToken;
        next();
    });
   
    /*try {
        // 토큰이 없으면 종료
        let token = null;
        if (req && req.cookies && (req.cookies['accessToken'] !== '')) {
            token = req.cookies['accessToken'];
        }
        if (token === null || token === undefined){
            next();
            return;
        }
        
        // 토큰 복호화
        let decoded = null;
        try {
            decoded = jwt.verify(token, process.env.JWT_KEY);
        } catch (error) {
            if (error.name == "tokenExpiredError") {
                res.send(errResponse(baseResponse.ACCESS_TOKEN_EXPIRED));
                return;
            }
            next();
            return;
        }
        
        // 토큰 복호화
        await jwt.verify(token, process.env.JWT_KEY, async (error, verifiedToken) => {
            if (error) {
                res.send(errResponse(baseResponse.ACCESS_TOKEN_EXPIRED));
            }
            
            req.user = verifiedToken;
            next();
        });

        let user = await prisma.user.findFirst({where : { provider: decoded.provider, email : decoded.email}});
        if(!user || user.status == "DELETED" || user.status == "STOP"){
            next();
            return;
        }

        req.user = {provider: user.provider, email: user.email, name: user.name, status: user.status};
        next();
    } catch (e) {
        console.log(e);
        next({ status: 500, message: "internal server error" });
        
    }*/
}

module.exports = {
    signUpAuth,
    authenticate
}