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

// 회원탈퇴
exports.deleteUser = async (userId) => {
    try {
        // 운동 위치 기록 삭제
        const deleteExerciseLocation = prisma.ExerciseLocation.deleteMany({
            where: {user_id: userId}
        });
        
        // 운동 기록 삭제
        const deleteExercise = prisma.Exercise.deleteMany({
            where: {user_id: userId}
        });
        
        // 리워드 기록 삭제
        const deleteReward = prisma.Reward.deleteMany({
            where: {user_id: userId}
        });
        
        // 세션 삭제
        const deleteSession = prisma.Session.deleteMany({
            where: {user_id: userId}
        });
        
        // 성공한 챌린지 삭제
        const deleteCompleteChallenge = prisma.CompletedChallenge.deleteMany({
            where: {user_id: userId}
        });
        
        // 실패한 챌린지 삭제
        const deleteFailedChallenge = prisma.FailedChallenge.deleteMany({
            where: {user_id: userId}
        });
        
        // 참여 챌린지 삭제
        const deleteUserChallenge = prisma.UserChallenge.deleteMany({
            where: {user_id: userId}
        });
        
        // 참여 그룹 삭제
        const deleteUserGroup = prisma.UserGroup.deleteMany({
            where: {user_id: userId}
        });
        
        // 사용자 계정 삭제
        const userDelete = prisma.User.delete({
            where: {id: userId}
        });
        
        // 트랜잭션 처리
        await prisma.$transaction([deleteExerciseLocation, deleteExercise, deleteReward, deleteSession,
            deleteCompleteChallenge, deleteFailedChallenge, deleteUserChallenge, deleteUserGroup]);
    } catch (error) {
        customLogger.error(`deleteUser - transaction error\n${error.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};