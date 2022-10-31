const {logger} = require('../../../config/winston');
const axios = require('axios');

// Prisma Client
const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

// READ
// 사용자 확인 (로컬계정 이메일 중복검사)
exports.getUserByEmail = async (email) => {
    try {
        return await prisma.User.findMany({
            where: {
                provider: 'local',
                email: email
            },
            select: {
                provider: true,
                email: true,
                nickname: true,
                status: true
            }
        });
    } catch (error) {
        logger.error(`getUserByEmail - database error\n${error.message}`);
    }
};

// 세션 확인 (토큰)
exports.getSessionByToken = async (refresh_token) => {
    try {
        return await prisma.Session.findFirst({
            where: { refresh_token: refresh_token },
            include: {
                User: {
                    select: {
                        provider: true,
                        email: true
                    }
                }
            }
        });
    } catch (error) {
        logger.error(`getSessionByToken - database error\n${error.message}`);
    }
};

// 세션 확인 (사용자 ID)
exports.getSessionByUserId = async (user_id) => {
    try {
        return await prisma.Session.findFirst({
            where: { user_id: user_id }
        });
    } catch (error) {
        logger.error(`getSessionByUserId - database error\n${error.message}`);
    }
};

// 이메일 인증 정보 확인
exports.getEmailVerification = async (email) => {
    try {
        return await prisma.EmailVerification.findMany({
            where : { email: email }
        });
    } catch (error) {
        logger.error(`getEmailVerification - database error\n${error.message}`);
    }
};

// 닉네임 중복 확인
exports.getUserNickname = async (nickname) => {
    try {
        // Binary 타입으로 변환해서 조회
        const nicknameBuffer = Buffer.from(nickname);
        
        return await prisma.User.findMany({
            where : { nickname: nicknameBuffer }
        });
    } catch (error) {
        logger.error(`getUserNickname - database error\n${error.message}`);
    }
};

// 사용자 가입확인
exports.getUserInfoByEmail = async (provider, email) => {
    try {
        // Binary 타입으로 변환해서 조회
        return await prisma.$queryRaw(
            Prisma.sql`
                SELECT id AS userId, provider, email,
                       CAST(nickname AS CHAR) AS nickname,
                       status
                FROM User
                WHERE provider = ${provider} AND
                      email = ${email};
            `
        );
    } catch (error) {
        logger.error(`getUserInfoByEmail - database error\n${error.message}`);
    }
};

// 카카오 액세스 토큰 요청
exports.getKakaoToken = async (code) => {
    try {
        // 액세스 토큰 발급 파라미터
        const params = {
            grant_type: 'authorization_code',
            client_id: `${process.env.KAKAO_REST_API_KEY}`,
            redirect_uri: `http://localhost:3000/auth/signIn/kakao`,
            code: code,
        }
    
        return await axios({
            url: 'https://kauth.kakao.com/oauth/token',
            method: 'post',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            params: params,
        });
    } catch (error) {
        logger.error(`getKakaoToken - Kakao API error\n${error.message}`);
        return 'apiError';
    }
};

// 카카오 사용자 정보 요청
exports.getKakaoUserInfo = async (accessToken) => {
    try {
        // 이메일 정보만 추출
        const params = {
            property_keys: [
                'kakao_account.email'
            ]
        };
        
        return await axios({
            url: 'https://kapi.kakao.com/v2/user/me',
            method: 'post',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
                'Authorization': `Bearer ${accessToken}`,
            },
            params: params
        });
    } catch (error) {
        logger.error(`getKakaoUserInfo - Kakao API error\n${error.message}`);
        return 'apiError';
    }
};