const {PrismaClient, Prisma} = require('@prisma/client');
const prisma = new PrismaClient();
const baseResponse = require('../../../config/baseResponseStatus');
const {response, errResponse} = require("../../../config/response");

// 사용자 정보 조회
exports.retrieveUserInfo = async (userId) => {
    try {
        return await prisma.$queryRaw(
            Prisma.sql`
                SELECT id                     AS userId,
                       provider,
                       email,
                       CAST(nickname AS CHAR) AS nickname,
                       status
                FROM User
                WHERE id = ${userId};
            `
        );
    } catch (error) {
        customLogger.error(`retrieveUserInfo - database error\n$${error.message}`);
        throw error;
    }
};