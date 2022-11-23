const passport = require('passport');
const {Strategy: LocalStrategy} = require('passport-local');
const baseResponse = require('../baseResponseStatus');
const {response, errResponse} = require('../response');
const util = require('util');
const crypto = require('crypto');
const pbkdf2Promisified = util.promisify(crypto.pbkdf2);

// Prisma Client
const {PrismaClient, Prisma} = require('@prisma/client');
const prisma = new PrismaClient();

// 사용자 비밀번호 암호화
const hashedPassword = async (salt, password) => {
    const key = await pbkdf2Promisified(password, salt, 17450, 64, 'sha512');
    
    return key.toString('base64');
}

// local config
const localConfig = {
    usernameField: 'email',
    passwordField: 'password'
};

// local strategy
const localVerification = async (email, password, done) => {
    // 사용자 정보 불러오기
    let userResult;
    try {
        userResult = await prisma.$queryRaw(
            Prisma.sql`
                SELECT id                     AS userId,
                       provider,
                       email,
                       password,
                       salt,
                       CAST(nickname AS CHAR) AS nickname,
                       status
                FROM User
                WHERE provider = 'local'
                  AND email = ${email};
            `
        );
    } catch (error) {
        customLogger.error(`localVerification - database error\n${error.message}`);
        error.type = 'db';
        return done(error);
    }
    const user = userResult[0];
    
    // 사용자 정보가 없을 경우
    if (user === undefined || user === null) {
        return done(errResponse(baseResponse.SIGNIN_LOCAL_USER_NOT_FOUND));
    }
    
    // 사용자 계정 상태가 RUN이 아닐 경우
    if (user.status !== 'RUN') {
        return done(errResponse(baseResponse.SIGNIN_LOCAL_USER_STATUS));
    }
    
    // 비밀번호가 다를 경우
    const userPassword = await hashedPassword(user.salt, password);
    if (user.password !== userPassword) {
        return done(errResponse(baseResponse.SIGNIN_LOCAL_USER_PASSWORD_WRONG));
    }
    
    done(null, user);
}

module.exports = {
    localInitialize: () => {
        passport.use('local', new LocalStrategy(localConfig, localVerification));
    },
}
