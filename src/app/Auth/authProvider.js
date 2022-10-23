const {logger} = require('../../../config/winston');

// Prisma Client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// READ
// 사용자 확인 (로컬계정 이메일 중복검사)
exports.getUserByEmail = async (email) => {
    try {
        return await prisma.User.findMany({
            where: {
                provider: 'local',
                email: email
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
        })
    } catch (error) {
        logger.error(`getEmailVerification - database error\n${error.message}`);
    }
}