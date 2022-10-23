const authProvider = require('./authProvider');
const baseResponse = require('../../../config/baseResponseStatus');
const {response, errResponse} = require('../../../config/response');
const util = require('util');
const crypto = require('crypto');
const randomBytesPromisified = util.promisify(crypto.randomBytes);
const pbkdf2Promisified = util.promisify(crypto.pbkdf2);
const {logger} = require('../../../config/winston');

// Prisma Client
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 메일 인증 객체
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    host: process.env.MAIL_HOST,
    port: 587,
    secure: true,
    requireTLS: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    },
});


// CREATE
// 세션 생성
exports.createSession = async (user_id, refresh_token, ip) => {
    try {
        await prisma.session.create({
            data: {
                user_id: user_id,
                refresh_token: refresh_token,
                ip: ip
            }
        });
    } catch (error) {
        logger.error(`createSession - database error\n${error.message}`);
        throw error;
    }
};

// 이메일 인증정보 생성
exports.createEmailVerification = async (email, code) => {
    try {
        // DB에 인증정보 저장
        await prisma.EmailVerification.create({
            data: {
                email: email,
                code: code
            }
        });
        
        // 메일 내용
        const mailContent = `
            <h2>Running High</h2>
            <h3>인증 이메일 확인</h3>
            <p>다음 코드를 사용해서 메일을 인증하세요</p>
            <p>${code}</p>
        `;
        
        // 메일 옵션
        const mailOption = {
            from: process.env.MAIL_USER,
            to: `${email}`,
            subject: "러닝하이 회원가입 인증코드",
            html: `${mailContent}`
        };
        
        // 메일 인증 송신
        await transporter.sendMail(mailOption, async (error, info) => {
            if (error) {
                logger.error(`createEmailVerification - nodeMailer error\n${error.message}`);
            } else {
                console.log(info.response);
            }
        });
    
        // 이메일 인증정보 응답 객체 생성
        const emailVerificationFinalResult = await authProvider.getEmailVerification(email);
        const finalResponse = {
            userEmail: emailVerificationFinalResult[0].email,
            verificationCount: emailVerificationFinalResult[0].verification_count,
            isVerified: emailVerificationFinalResult[0].is_verified
        };
    
        return response(baseResponse.SUCCESS, finalResponse);
    } catch (error){
        logger.error(`createEmailVerification - database error\n${error.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


// UPDATE
// 세션 정보 수정
exports.updateSession = async (prev_token, new_token) => {
    try {
        await prisma.Session.updateMany({
            where: {
                refresh_token: prev_token
            },
            data: {
                refresh_token: new_token
            }
        });
    } catch (error) {
        logger.error(`updateSession - database error\n${error.message}`);
        throw error;
    }
};

// 이메일 인증 정보 수정
exports.updateEmailVerification  = async (email, code, verificationCount) => {
    try {
        // DB에 인증정보 수정
        await prisma.EmailVerification.update({
            where: {
                email: email
            },
            data: {
                code: code,
                verification_count: verificationCount
            }
        });
        
        // 메일 내용
        const mailContent = `
            <h2>Running High</h2>
            <h3>인증 이메일 확인</h3>
            <p>다음 코드를 사용해서 메일을 인증하세요</p>
            <p>${code}</p>
        `;
        
        // 메일 옵션
        const mailOption = {
            from: process.env.MAIL_USER,
            to: `${email}`,
            subject: "러닝하이 회원가입 인증코드",
            html: `${mailContent}`
        };
        
        // 메일 인증 송신
        await transporter.sendMail(mailOption, async (error, info) => {
            if (error) {
                logger.error(`createEmailVerification - nodeMailer error\n${error.message}`);
            } else {
                console.log(info.response);
            }
        });
        
        // 이메일 인증정보 응답 객체 생성
        const emailVerificationFinalResult = await authProvider.getEmailVerification(email);
        const finalResponse = {
            userEmail: emailVerificationFinalResult[0].email,
            verificationCount: emailVerificationFinalResult[0].verification_count,
            isVerified: emailVerificationFinalResult[0].is_verified
        };
    
        return response(baseResponse.SUCCESS, finalResponse);
    } catch (error) {
        logger.error(`updateEmailVerification - database error\n${error.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


// DELETE
// 세션 정보 삭제
exports.deleteSession = async (refresh_token) => {
    try {
        await prisma.Session.deleteMany({
            where: { refresh_token: refresh_token }
        });
    } catch (error) {
        logger.error(`deleteSession - database error\n${error.message}`);
        throw error;
    }
};

// 이메일 인증정보 삭제
exports.deleteEmailVerification = async (email) => {
    try {
        await prisma.EmailVerification.deleteMany({
            where: { email: email }
        });
    } catch (error) {
        logger.error(`deleteEmailVerification - database error\n${error.message}`);
        throw error;
    }
};



exports.getUserByProviderId = async ({provider, provider_id}) => {
    try {
        let user = await prisma.user.findFirst({
            where : {
                provider,
                provider_id: String(provider_id),
            },
        });
        return user;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

//signup
exports.createSalt = async () => {
    try {
        let salt = await randomBytesPromisified(64);
        return salt.toString('base64');
    } catch (e) {
        console.log(e);
        throw e;
    }
}
exports.hashPassword = async (salt, password) => {
    try {
        let key = await pbkdf2Promisified(password, salt, 17450, 64, 'sha512');
        return key.toString('base64');
    } catch (e) {
        console.log(e);
        throw e;
    }
}

exports.verifyUser = async (pwfromClient, saltfromDB, hashfromDB) => {
    let hashfromClient = await exports.hashPassword(saltfromDB, pwfromClient);
    return hashfromClient === hashfromDB;
}