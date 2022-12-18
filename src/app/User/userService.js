const userProvider = require('./userProvider');
const baseResponse = require('../../../config/baseResponseStatus');
const {response, errResponse} = require('../../../config/response');
const util = require('util');
const crypto = require('crypto');
const randomBytesPromisified = util.promisify(crypto.randomBytes);
const pbkdf2Promisified = util.promisify(crypto.pbkdf2);

// Prisma Client
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

// 비밀번호 변경
exports.updateUserPassword = async (userId, password) => {
    // salt 생성
    const createSalt = await randomBytesPromisified(64);
    const salt = createSalt.toString('base64');
    
    // 해시 비밀번호 생성
    const createHashedPassword = await pbkdf2Promisified(password, salt, 17450, 64, 'sha512');
    const hashedPassword = createHashedPassword.toString('base64');
    
    try {
        // 로컬계정 비밀번호 수정
        await prisma.User.updateMany({
            data : {
                password: hashedPassword,
                salt    : salt,
            },
            where: {id: userId}
        });
    } catch (error) {
        customLogger.error(`updateUserPassword - database error\n${error.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};
