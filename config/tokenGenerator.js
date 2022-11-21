const jwt = require('jsonwebtoken');
const authService = require('../src/app/Auth/authService');
const authProvider = require('../src/app/Auth/authProvider');

// 회원가입 JWT
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

// 로그인 JWT
const loginToken = async (req, res, user) => {
    try {
        // 액세스 토큰 발급
        const accessToken = jwt.sign(
            {
                provider: user.provider,
                email   : user.email
            },
            process.env.JWT_KEY,
            {
                expiresIn: '3h'
            }
        );
        // 액세스 토큰 쿠키에 저장
        res.cookie('accessToken', accessToken, {
            sameSite: 'none',
            secure  : true,
            path    : '/',
            
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
            sameSite: 'none',
            secure  : true,
            path    : '/auth'
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
    } catch (error) {
        customLogger.error(`tokenGenerator - database error\n${error.message}`);
        throw error;
    }
};


module.exports = {
    signUpToken,
    loginToken,
}