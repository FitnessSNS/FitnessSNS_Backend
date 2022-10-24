const {logger} = require('../../../config/winston');

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
                provider_id: true,
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
exports.getUserInfoByEmail = async (email) => {
    try {
        // Binary 타입으로 변환해서 조회
        return await prisma.$queryRaw(
            Prisma.sql`
                SELECT provider, provider_id, email,
                       CAST(nickname AS CHAR) AS nickname,
                       status
                FROM User
                WHERE provider = 'local' AND
                      email = ${email};
            `
        );
    } catch (error) {
        logger.error(`getUserNickname - database error\n${error.message}`);
    }
};