const rewardService = require('./rewardService');
const rewardProvider = require('./rewardProvider');
const baseResponse = require('../../../config/baseResponseStatus');
const {response, errResponse} = require('../../../config/response');

// 한글, 영어, 숫제 제외한 특수문자를 찾는 정규표현식
const specialCharacter = /[^\w\sㄱ-힣]|[\_]/g;

// 경도, 위도 검사
const coordinateCheck = /^\d+\.\d+$/;

/** 챌린지 확인 API
 * [GET] /app/rewards/challenge
 * body :
 */
exports.getChallenge = async function (req, res) {
    // TODO: 사용자 인증 추가
    
    const getchallengeResult = await rewardProvider.retrieveChallenge();
    
    if (getchallengeResult === 'NoChallenges') {
        return res.send(errResponse(baseResponse.CHALLENGE_NOT_FOUND));
    }
    
    return res.send(response(baseResponse.SUCCESS, getchallengeResult));
};

/** 챌린지 등록 API
 * [POST] /app/rewards/challenge
 * body : title, content, condition, end_date
 */
exports.postChallenge = async function (req, res) {
    const { title, content, condition, end_date } = req.body;
    
    const postChallengeResult = await rewardService.createChallenge(title, content, condition, end_date)
    
    return res.send(postChallengeResult);
};

/** 리워드 페이지 사용자 정보 API
 * [GET] /app/rewards/users
 */
exports.getUserInfo = async function (req, res) {
    const { email } = req.user;
    
    const getUserInfoResult = await rewardProvider.retrieveUserInfo(email);
    
    return res.send(getUserInfoResult);
};

/** 운동 선택 API
 * [GET] /app/rewards/running/exercise
 * query : type
 */
exports.checkUserExerciseGroup = async function (req, res) {
    const { email } = req.user;
    const { type } = req.query;
    
    const getUserExerciseGroupResult = await rewardProvider.retrieveUserExerciseGroup(email, type);
    
    return res.send(getUserExerciseGroupResult);
};

/** 운동 시작 API
 * [POST] /app/rewards/running/start
 * body : longitude, latitude
 */
exports.postUserRunning = async function (req, res) {
    const { email } = req.user;
    const { longitude, latitude } = req.body;
    
    // 경도와 위도 정보가 없을 경우
    if (longitude === undefined || latitude === undefined) {
        return res.send(errResponse(baseResponse.RUNNING_START_LOCATION_EMPTY));
    }
    
    // 경도와 위도가 소수점이 아닐 경우
    if (!coordinateCheck.test(longitude) || !coordinateCheck.test(latitude)) {
        return res.send(errResponse(baseResponse.RUNNING_START_LOCATION_TYPE_WRONG));
    }
    
    const postUserRunningResult = await rewardService.createUserRunning(email, longitude, latitude);
    
    return res.send(postUserRunningResult);
};

/** 운동 진행 API
 * [POST] /app/rewards/running/check
 * query : isRestart
 * body : longitude, latitude
 */
exports.postUserRunningCheck = async function (req, res) {
    const { email } = req.user;
    const isRestart = req.query.isRestart;
    const { longitude, latitude } = req.body;
    
    // 운동 재시작 여부 타입 확인
    if (isRestart !== true && isRestart !== false) {
        return res.send(errResponse(baseResponse.RUNNING_CHECK_RESTART_TYPE_WRONG));
    }
    
    // 경도와 위도 정보가 없을 경우
    if (longitude === undefined || latitude === undefined) {
        return res.send(errResponse(baseResponse.RUNNING_CHECK_LOCATION_EMPTY));
    }
    
    // 경도와 위도가 소수점이 아닐 경우
    if (!coordinateCheck.test(longitude) || !coordinateCheck.test(latitude)) {
        return res.send(errResponse(baseResponse.RUNNING_CHECK_LOCATION_TYPE_WRONG));
    }
    
    // 일시정지 후 재시작인 경우
    if (isRestart) {
        const postUserRunningRestartResult = await rewardService.updateUserRunningCheck(email, longitude, latitude);
    
        return res.send(postUserRunningRestartResult);
    } else {
        const postUserRunningCheckResult = await rewardService.createUserRunningCheck(email, longitude, latitude);
    
        return res.send(postUserRunningCheckResult);
    }
};