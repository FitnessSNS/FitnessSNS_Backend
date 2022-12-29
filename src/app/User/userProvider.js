const {PrismaClient, Prisma} = require('@prisma/client');
const prisma = new PrismaClient();
const util = require("util");
const crypto = require('crypto');
const pbkdf2Promisified = util.promisify(crypto.pbkdf2);

// 사용자 비밀번호 암호화
const hashedPassword = async (salt, password) => {
    const key = await pbkdf2Promisified(password, salt, 17450, 64, 'sha512');
    
    return key.toString('base64');
}

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

// 사용자 비밀번호 확인
exports.checkUserPassword = async (userId, password) => {
    let userInfo;
    try {
        userInfo = await prisma.User.findUniqueOrThrow({
            where: {id: userId},
            select: {
                password: true,
                salt: true
            }
        });
    } catch (error) {
        customLogger.error(`checkUserPassword - get userInfo error\n$${error.message}`);
        throw error;
    }
    
    // 사용자 입력 비밀번호 암호화
    const currentPassword = await hashedPassword(userInfo.salt, password);
    
    return userInfo.password === currentPassword;
};