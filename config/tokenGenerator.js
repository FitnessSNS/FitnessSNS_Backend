const jwt = require('jsonwebtoken');
const authService = require('../src/app/Auth/authService');
const authProvider = require('../src/app/Auth/authProvider');

// 회원가입 토큰
const signUpToken = async (req, res, userCheckString) => {
    const signUpToken = jwt.sign(
        {
            userCheck: userCheckString
        },
        process.env.JWT_KEY,
        {
            expiresIn: '1h' // 회원가입 유효시간 1시간
        });
    
    // 쿠키에 저장
    res.cookie('signUpToken', signUpToken, {
        sameSite: 'none',
        secure  : true,
        path    : '/auth/signUp',
    });
}

// 리프레시 토큰
const refreshToken = async (req, res, user) => {
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
        sameSite: 'none',
        secure  : true,
        path    : '/auth'
    });
    
    // 기존 세션 정보 불러오기
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let session;
    try {
        session = await authProvider.getSessionByUserId(user.id);
    } catch (error) {
        throw error;
    }
    
    // 세션 정보 수정/생성
    try {
        if (session !== null) {
            await authService.updateSession(session.refresh_token, refreshToken);
        } else {
            await authService.createSession(user.id, refreshToken, ip);
        }
    } catch (error) {
        throw error;
    }
};


module.exports = {
    signUpToken,
    refreshToken,
}