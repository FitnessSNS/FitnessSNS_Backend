const util = require('util');
const crypto = require('crypto');
const randomBytesPromisified = util.promisify(crypto.randomBytes);
const pbkdf2Promisified = util.promisify(crypto.pbkdf2);
const {logger} = require('../../../config/winston');

// Prisma Client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// READ
// 세션 확인 (토큰)
exports.getSessionByToken = async (refresh_token) => {
    try {
        return await prisma.session.findFirst({
            where: { refresh_token: refresh_token},
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
        logger.error(`getSessionByToken - database error\n${JSON.stringify(error)}`);
        throw error;
    }
};

// 세션 확인 (사용자 ID)
exports.getSessionByUserId = async (user_id) => {
    try {
        return await prisma.session.findFirst({
            where: { user_id: user_id }
        });
    } catch (error) {
        logger.error(`getSessionByUserId - database error\n${JSON.stringify(error)}`);
        throw error;
    }
};