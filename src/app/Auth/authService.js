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
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    },
})


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
        logger.error(`createSession - database error\n${JSON.stringify(error)}`);
        throw error;
    }
};








exports.getUserByEmail = async ({provider, email}) => {
    try {
        let user = await prisma.user.findFirst({
            where : {
                provider,
                email 
            },
        });
        return user;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

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

exports.getEvByEmail = async (email) => {
    try {
        let ev = await prisma.ev.findFirst({
            where : {
                email,    
            }
        })
        return ev;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

exports.createEv = async (email, code) => {
    try {
        await prisma.ev.create({
            data: {
                email,
                code,
            } 
        })
    } catch (e){
        console.log(e);
        throw e;
    }
}
exports.updateEv  = async ({email, code, updated_at, total_gen_per_day, isVerified}) => {
    try {
        if(!email) throw {message: 'target email not entered'};
        await prisma.ev.updateMany({
            where: {
                email,
            },
            data: {
                code,
                updated_at,
                total_gen_per_day,
                isVerified,
            }
        });
    } catch (e) {
        console.log(e);
        throw e;
    }
}

exports.sendEvMail = async (email, code) => {
    try {
        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: `${email}`,
            subject: "러닝하이 인증코드입니다.",
            text: `${code}`,
        });
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


// UPDATE
// 세션 정보 수정
exports.updateSession = async (prev_token, new_token) => {
    try {
        await prisma.session.updateMany({
            where: {
                refresh_token: prev_token
            },
            data: {
                refresh_token: new_token
            }
        });
    } catch (error) {
        logger.error(`updateSession - database error\n${JSON.stringify(error)}`);
        throw error;
    }
};



// DELETE
// 세션 정보 삭제
exports.deleteSession = async (refresh_token) => {
    try {
        await prisma.session.deleteMany({
            where: { refresh_token: refresh_token }
        });
    } catch (error) {
        logger.error(`deleteSession - database error\n${JSON.stringify(error)}`);
        throw error;
    }
};