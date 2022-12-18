const baseResponse = require('../../../config/baseResponseStatus');
const {response, errResponse} = require('../../../config/response');
const userService = require('./userService');
const userProvider = require('./userProvider');
const redis = require('redis');
const rewardProvider = require("../Reward/rewardProvider");
const redisClient = new redis.createClient();

// redis client 에러 발생
redisClient.on('error', (error) => {
    customLogger.error(`Redis Client Error\n${error.message}`);
});

// 이메일 정규표현식
const regEmail = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;

// 닉네임 정규표현식
const regNickname = /[^\w\sㄱ-힣]|[\_]/g;

// 비밀번호 정규표현식 (8~20자리, 특수문자, 영어, 숫자 포함)
const regPassword = /^.*(?=^.{8,20}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/;

// 문자열 길이 체크
const getByteLength = async (str) => {
    let byte = 0;
    let count = 12;
    
    // 글자 바이트 및 개수 확인
    for (let character of str) {
        const code = character.charCodeAt(0);
        
        if (code > 127) {
            byte += 2;
        } else if (code > 64 && code < 91) {
            byte += 2;
        } else {
            byte += 1;
        }
        
        count--;
    }
    
    // 12글자가 넘을 경우
    if (count < 0) {
        return -1;
    } else {
        return byte;
    }
};

// 랜덤 문자열 생성
const generateRandomString = async (num) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    
    for (let i = 0; i < num; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
};

/** 비밀번호 변경 API
 * [POST] /users/myPage/userInfo
 * body : currentPassword, newPassword
 */
exports.changePassword = async (req, res) => {
    const userId = req.verifiedToken.id;
    const {currentPassword, newPassword} = req.body;
    
    // 계정 상태 확인
    let userInfo;
    try {
        userInfo = await userProvider.retrieveUserInfo(userId);
        // 계정을 확인할 수 없는 경우
        if (userInfo.length < 1) {
            return errResponse(baseResponse.MY_PAGE_USER_NOT_FOUND);
        }
        
        // 사용 중지된 계정일 경우
        if (userInfo[0].status !== 'RUN') {
            return errResponse(baseResponse.MY_PAGE_USER_STATUS_WRONG);
        }
    } catch {
        return errResponse(baseResponse.DB_ERROR);
    }
    
    // 비밀번호 유효성 검사
    if (!currentPassword || !newPassword) {
        return errResponse(baseResponse.MY_PAGE_USER_PASSWORD_WRONG);
    }
    
    // 비밀번호 일치 검사
    if (currentPassword === newPassword) {
        return errResponse(baseResponse.MY_PAGE_USER_PASSWORD_SAME);
    }
    
    // 비밀번호 길이 검사
    if (newPassword.length < 8 || newPassword.length > 20) {
        return res.send(errResponse(baseResponse.MY_PAGE_USER_PASSWORD_LENGTH_OVER));
    }
    
    // 비밀번호 유효성 검사
    if (!regPassword.test(newPassword)) {
        return res.send(errResponse(baseResponse.MY_PAGE_USER_PASSWORD_REGEX_WRONG));
    }
    
    // 비밀번호 변경
    await userService.updateUserPassword(userId, newPassword);
    
    return res.send(response(baseResponse.SUCCESS));
};