const jwt = require('jsonwebtoken');
const baseResponse = require('../../config/baseResponseStatus');
const {response, errResponse} = require('../../config/response');

// Prisma Client
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

// 회원가입 토큰 확인
const signUpAuth = async (req, res, next) => {
    let token = null;
    
    if (req && req.cookies && (req.cookies['signUpToken'] !== '')) {
        token = req.cookies['signUpToken'];
    }
    
    // 토큰이 없으면 종료
    if (token === null || token === undefined) {
        return res.send(errResponse(baseResponse.SIGNUP_TOKEN_EMPTY));
    }
    
    // 토큰 복호화
    await jwt.verify(token, process.env.JWT_KEY, async (error, verifiedToken) => {
        if (error) {
            customLogger.error(`signUpToken - signUpAuth middleware error\n${error.message}`);
            return res.send(errResponse(baseResponse.SIGNUP_TOKEN_VERIFICATION_FAIL));
        }
        
        // request 객체에 토큰 정보 저장
        req.verifiedToken = verifiedToken;
        next();
    });
};

// 로그인 토큰 확인
const authenticate = async (req, res, next) => {
    const token = req.headers['x-access-token'] || req.query.token;
    
    // 토큰이 없으면 종료
    if (token === null || token === undefined) {
        return res.send(errResponse(baseResponse.SIGNIN_TOKEN_EMPTY));
    }
    
    // 토큰 복호화
    await jwt.verify(token, process.env.JWT_KEY, async (error, verifiedToken) => {
        if (error) {
            customLogger.error(`signInToken - authenticate middleware error\n${error.message}`);
            return res.send(errResponse(baseResponse.SIGNIN_TOKEN_VERIFICATION_FAIL));
        }
        
        // request 객체에 토큰 정보 저장
        req.verifiedToken = verifiedToken;
        
        // 리프레시 토큰 찾기
        let refreshToken;
        try {
            refreshToken = await prisma.Session.findMany({
                where: {
                    user_id: verifiedToken.id,
                }
            });
        } catch (error) {
            customLogger.error(`signInToken - refreshToken empty\n${error.message}`);
        }
        
        // 로그아웃 검사
        if (!refreshToken || refreshToken.length < 1) {
            return res.send(errResponse(baseResponse.SIGNIN_TOKEN_ALREADY_LOGOUT));
        }
        
        next();
    });
};

module.exports = {
    signUpAuth,
    authenticate
}